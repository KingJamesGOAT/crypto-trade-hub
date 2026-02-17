import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { MACD, StochasticRSI, EMA } from 'technicalindicators';
import * as dotenv from 'dotenv';
import { DiscordAgent } from './services/discord';
import { LLMAgent } from './services/llm';

dotenv.config();

// Configuration
const COINS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "SUI", "TRX", "LINK"];
const INTERVAL = "15m"; 
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("🔥 CRITICAL: Missing Supabase Credentials.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const discord = new DiscordAgent();
const llm = new LLMAgent();

// Types
interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface CoinScope {
    symbol: string;
    id?: string;
}

// --- HELPERS ---

async function logToTerminal(message: string, level: 'info' | 'success' | 'error' = 'info', meta?: any) {
    console.log(message); // Keep console for GitHub Actions
    // Write to Supabase for Frontend Terminal
    await supabase.from('bot_logs').insert({ 
        message, 
        level, 
        meta,
        created_at: new Date().toISOString() 
    });
}

async function log(message: string) {
    await logToTerminal(message, 'info');
    // Legacy support for sim_logs if still needed, otherwise bot_logs replaces it
}

async function getTrendingCoins(): Promise<CoinScope[]> {
    try {
        const { data } = await axios.get("https://api.coingecko.com/api/v3/search/trending");
        const trends = data.coins.slice(0, 7).map((c: any) => ({
             symbol: c.item.symbol.toUpperCase(),
             id: c.item.id
        }));
        
        const unique = trends.filter((coin: CoinScope) => !COINS.includes(coin.symbol));
        return unique.filter((coin: CoinScope) => /^[A-Z0-9]+$/.test(coin.symbol)); 
    } catch (e) {
        console.error("⚠️ Failed to fetch trending coins, defaulting to empty list.");
        return [];
    }
}

async function getCandles(symbol: string, limit: number = 300): Promise<Candle[]> {
    const fetchFrom = async (baseUrl: string) => {
        const url = `${baseUrl}/api/v3/klines?symbol=${symbol}USDT&interval=${INTERVAL}&limit=${limit}`;
        const apiKey = process.env.BINANCE_API_KEY || process.env.VITE_BINANCE_API_KEY;
        const headers = apiKey ? { 'X-MBX-APIKEY': apiKey } : undefined;
        
        const { data } = await axios.get(url, { headers });
        return data.map((d: any) => ({
            time: d[0],
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5]),
        }));
    };

    try {
        return await fetchFrom("https://api.binance.com");
    } catch (e: any) {
        // If Geo-Restricted (likely 451 or 403), try Binance.US
        if (e.response?.status === 451 || e.response?.status === 403) {
            try {
                return await fetchFrom("https://api.binance.us");
            } catch (e2) {
                console.log(`⚠️ Coin ${symbol} not found on Binance.US either.`);
                return [];
            }
        }
        console.log(`⚠️ Coin ${symbol} error: ${e.message}`);
        return [];
    }
}

// --- MAIN BOT ENGINE ---

async function runBot() {
    console.log(`\n👻 GHOST ENGINE AI ACTIVATED... [${new Date().toISOString()}]`);
    await logToTerminal("👻 Ghost Engine AI Scan Started...", 'info');
    
    // 1. Load Settings & Portfolio
    const { data: settings } = await supabase.from('sim_settings').select('*').limit(1).single();
    if (!settings || !settings.is_bot_active) {
        console.log("💤 Bot is paused or settings missing. Exiting.");
        return;
    }

    let { data: portfolio } = await supabase.from('sim_portfolio').select('*');
    if (!portfolio) portfolio = [];

    const config = settings.config || {};
    let STANDARD_RISK = config.risk_per_trade || 0.05;
    let STOP_LOSS_PCT = config.stop_loss_pct || 0.03;
    let currentBalance = parseFloat(settings.balance_usdt);

    console.log(`💰 BALANCE: $${currentBalance.toFixed(2)}`);

    // 2. Discovery
    const tier1Coins: CoinScope[] = COINS.map(s => ({ symbol: s }));
    const tier2Coins: CoinScope[] = await getTrendingCoins();
    
    if (tier2Coins.length > 0) {
        const symbols = tier2Coins.map(t => t.symbol).join(", ");
        await logToTerminal(`💎 Gem Hunter found: [${symbols}]`, 'info');
    }

    const allCoins = [...tier1Coins, ...tier2Coins];
    let tradeMade = false;

    // 3. Scan Loop
    for (const coin of allCoins) {
        // Log scanning only to console to keep terminal clean, or use verbose mode
        // process.stdout.write(`\r🔍 Analyzing ${coin.symbol}... `); 
        
        // A. Fetch Data
        const candles = await getCandles(coin.symbol);
        if (candles.length < 200) continue;

        const closes = candles.map(c => c.close);
        const currentPrice = closes[closes.length - 1];

        // B. Calculate Indicators
        const stochInput = {
            values: closes,
            rsiPeriod: 14,
            stochasticPeriod: 14,
            kPeriod: 3,
            dPeriod: 3,
        };
        const stochResults = StochasticRSI.calculate(stochInput);
        const latestStoch = stochResults[stochResults.length - 1];

        const macdInput = {
            values: closes,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        };
        const macdResults = MACD.calculate(macdInput);
        const latestMacd = macdResults[macdResults.length - 1];

        const ema200Results = EMA.calculate({ period: 200, values: closes });
        const latestEma200 = ema200Results[ema200Results.length - 1];

        if (!latestStoch || !latestMacd || !latestEma200) continue;

        // C. Pre-Filter Logic
        const isUpTrend = currentPrice > latestEma200;
        const isMacdPositive = (latestMacd.histogram || 0) > 0;
        
        // Filter: Trend is UP and Stoch is Oversold (<30)
        // This is the "Setup" that we ask the AI to validate
        const isSetup = isUpTrend && latestStoch.k < 30;

        // Interactive logging for terminal
        await logToTerminal(`🔍 ${coin.symbol}: $${currentPrice.toFixed(2)} | Trend: ${isUpTrend ? 'UP' : 'DOWN'} | Stoch: ${latestStoch.k.toFixed(2)}`, 'info');

        const holding = portfolio.find((p: any) => p.symbol === coin.symbol + "USDT");

        if (!holding) {
            // BUY LOGIC
            if (isSetup) {
                await logToTerminal(`🤖 ${coin.symbol} Setup Found! Asking AI Agent...`, 'info');
                
                const indicators = {
                    isUpTrend,
                    isMacdPositive,
                    k: latestStoch.k,
                    d: latestStoch.d
                };

                // AI VALIDATION
                const aiDecision = await llm.analyzeSetup(coin.symbol, currentPrice, indicators);
                // console.log(`   🧠 AI Reasoning: ${aiDecision.reasoning} (Confidence: ${aiDecision.confidence})`);

                if (aiDecision.decision === "BUY" && aiDecision.confidence === "HIGH") {
                    // EXECUTE BUY
                    const amount = (currentBalance * STANDARD_RISK) / currentPrice;
                    
                    await supabase.from('sim_portfolio').insert({ symbol: coin.symbol + "USDT", amount, avg_buy_price: currentPrice });
                    await supabase.from('sim_settings').update({ balance_usdt: currentBalance - (amount * currentPrice) }).eq('id', settings.id);
                    await supabase.from('sim_trades').insert({ 
                        symbol: coin.symbol + "USDT", 
                        side: "BUY", 
                        amount, 
                        price: currentPrice, 
                        news_score: 0, // Legacy field
                        pnl: 0,
                        ai_reasoning: aiDecision.reasoning,
                        ai_confidence: aiDecision.confidence
                    });

                    currentBalance -= (amount * currentPrice);
                    tradeMade = true;

                    // NOTIFY
                    await logToTerminal(`🚀 AI BOUGHT ${coin.symbol} | ${aiDecision.reasoning}`, 'success');
                    await discord.sendAlert(`🚀 AI BUY SIGNAL: ${coin.symbol}`, [
                        { name: "Price", value: `$${currentPrice}`, inline: true },
                        { name: "Reasoning", value: aiDecision.reasoning, inline: false },
                        { name: "Confidence", value: aiDecision.confidence, inline: true }
                    ], 0x00ff00);
                } else {
                    await logToTerminal(`📉 AI Reject ${coin.symbol}: ${aiDecision.reasoning}`, 'info');
                }
            }
        } else {
            // SELL LOGIC (Rule based for safety + take profit)
            const amount = parseFloat(holding.amount);
            const avgPrice = parseFloat(holding.avg_buy_price);
            const pnlPct = (currentPrice - avgPrice) / avgPrice;

            let sellReason = "";
            let sellColor = 0xff0000;

            if (pnlPct < -STOP_LOSS_PCT) {
                sellReason = `🛑 STOP LOSS HIT (${(pnlPct * 100).toFixed(2)}%)`;
            } else if (latestStoch.k > 80 && latestStoch.k < latestStoch.d) {
                // Cross down from overbought
                if (pnlPct > 0) {
                     sellReason = `💰 TAKE PROFIT (${(pnlPct * 100).toFixed(2)}%)`;
                     sellColor = 0x00ff00;
                }
            }

            if (sellReason) {
                 const revenue = amount * currentPrice;
                 const profit = revenue - (amount * avgPrice);
                 
                 await supabase.from('sim_portfolio').delete().eq('symbol', coin.symbol + "USDT");
                 await supabase.from('sim_settings').update({ balance_usdt: currentBalance + revenue }).eq('id', settings.id);
                 await supabase.from('sim_trades').insert({ 
                    symbol: coin.symbol + "USDT", 
                    side: "SELL", 
                    amount, 
                    price: currentPrice, 
                    news_score: 0, 
                    pnl: profit 
                 });
                 
                 currentBalance += revenue;
                 tradeMade = true;
                 
                 await log(`🚨 SOLD ${coin.symbol} | ${sellReason}`);
                 await discord.sendAlert(`🔔 SALE EXECUTED: ${coin.symbol}`, [
                     { name: "Price", value: `$${currentPrice}`, inline: true },
                     { name: "PnL", value: `$${profit.toFixed(2)} (${(pnlPct * 100).toFixed(2)}%)`, inline: true },
                     { name: "Reason", value: sellReason, inline: false }
                 ], sellColor);
            }
        }
    }

    // 4. Wrap up
    await supabase.from('sim_settings').update({ last_run: new Date().toISOString() }).eq('id', settings.id);
    
    if (tradeMade) {
        await log("🏁 Scan Complete. Trades executed.");
    }
    console.log("🏁 Run Complete.");
}

runBot();
