import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { StochasticRSI, BollingerBands, RSI } from 'technicalindicators';
import * as dotenv from 'dotenv';
import { DiscordAgent } from './services/discord';
import { LLMAgent } from './services/llm';

dotenv.config();

// Configuration
const COINS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "SUI", "TRX", "LINK"];
const INTERVAL = "15m"; 
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Strategy Config
const STRATEGY = {
    RSI_OVERSOLD: 35, // For BB Strategy
    RSI_HYPE_ENTRY: 50, // For Trending Strategy
    RISK_PCT: 0.02,   // 2% Loss
    REWARD_PCT: 0.06, // 6% Win (1:3 Ratio)
    ALLOCATION_PCT: 0.10 // 10% of balance per trade
};

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
    close: number;
}
interface CoinScope {
    symbol: string;
    isTrending?: boolean;
}

// --- HELPERS ---

async function logToTerminal(message: string, level: 'info' | 'success' | 'error' = 'info', meta?: any) {
    console.log(`${level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️'} ${message}`);
    await supabase.from('bot_logs').insert({ 
        message, 
        level, 
        meta,
        created_at: new Date().toISOString() 
    });
}

async function getTrendingCoins(): Promise<CoinScope[]> {
    try {
        const { data } = await axios.get("https://api.coingecko.com/api/v3/search/trending");
        return data.coins.slice(0, 5).map((c: any) => ({
             symbol: c.item.symbol.toUpperCase(),
             isTrending: true
        }));
    } catch (e) {
        return [];
    }
}

async function getCandles(symbol: string, limit: number = 200): Promise<number[]> {
    const fetchFrom = async (baseUrl: string) => {
        const url = `${baseUrl}/api/v3/klines?symbol=${symbol}USDT&interval=${INTERVAL}&limit=${limit}`;
        const { data } = await axios.get(url);
        return data.map((d: any) => parseFloat(d[4])); // Only need closes
    };

    try {
        return await fetchFrom("https://api.binance.com");
    } catch (e: any) {
        if (e.response?.status === 451 || e.response?.status === 403) {
            try { return await fetchFrom("https://api.binance.us"); } catch (e2) { return []; }
        }
        return [];
    }
}

// --- MAIN BOT ENGINE ---

async function runBot() {
    console.log(`\n👻 GHOST ENGINE SCOUT ACTIVATED... [${new Date().toISOString()}]`);
    console.log("⚠️  Running Aggressive Strategy (1:3 Risk/Reward)");
    await logToTerminal("👻 Scout Engine Scan Started...", 'info');
    
    // 1. Load Settings
    const { data: settings } = await supabase.from('sim_settings').select('*').limit(1).single();
    if (!settings || !settings.is_bot_active) {
        console.log("💤 Bot is paused using 'System Sleep' switch.");
        return;
    }
    
    let { data: portfolio } = await supabase.from('sim_portfolio').select('*');
    if (!portfolio) portfolio = [];
    
    let currentBalance = parseFloat(settings.balance_usdt);

    // --- PHASE 0: EXIT MANAGER (Crucial Step) ---
    // Check all open positions first using LIVE price
    for (const position of portfolio) {
        const symbol = position.symbol.replace("USDT", "");
        const candles = await getCandles(symbol, 5); // Just need latest price
        if (!candles.length) continue;
        
        const currentPrice = candles[candles.length - 1];
        const stopLoss = parseFloat(position.stop_loss);
        const takeProfit = parseFloat(position.take_profit);
        const entryPrice = parseFloat(position.avg_buy_price);
        const amount = parseFloat(position.amount); // Asset Amount
        
        let exitReason = "";
        let isWin = false;

        if (stopLoss > 0 && currentPrice <= stopLoss) {
            exitReason = "🛑 STOP LOSS HIT (-2%)";
            isWin = false;
        } else if (takeProfit > 0 && currentPrice >= takeProfit) {
            exitReason = "💰 TAKE PROFIT HIT (+6%)";
            isWin = true;
        }

        if (exitReason) {
             const revenue = amount * currentPrice;
             const initialCost = amount * entryPrice;
             const pnl = revenue - initialCost;
             const pnlPercent = (pnl / initialCost) * 100;

             // 1. Remove from Portfolio
             await supabase.from('sim_portfolio').delete().eq('symbol', position.symbol);
             
             // 2. Update Balance
             currentBalance += revenue;
             await supabase.from('sim_settings').update({ balance_usdt: currentBalance }).eq('id', settings.id);
             
             // 3. Log Trade History
             await supabase.from('sim_trades').insert({ 
                symbol: position.symbol, 
                side: "SELL", 
                amount, 
                price: currentPrice, 
                pnl,
                pnl_percent: pnlPercent,
                exit_reason: exitReason,
                closed_at: new Date().toISOString()
             });

             await logToTerminal(`${exitReason}: ${symbol} | PnL: $${pnl.toFixed(2)}`, isWin ? 'success' : 'error');
             await discord.sendAlert(
                 isWin ? `✅ WIN: ${symbol} Closed` : `❌ LOSS: ${symbol} Closed`,
                 [
                     { name: "Result", value: exitReason, inline: true },
                     { name: "PnL", value: `$${pnl.toFixed(2)} (${pnlPercent.toFixed(1)}%)`, inline: true }
                 ],
                 isWin ? 0x00ff00 : 0xff0000
             );
        }
    }
    // ---------------------------------------------


    // --- PHASE 1: MARKET BRIEFING ---
    try {
        const newsUrl = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN";
        const { data: newsData } = await axios.get(newsUrl);
        const headlines = newsData.Data.slice(0, 10).map((n: any) => n.title);
        const briefing = await llm.generateMarketBriefing(headlines);
        await supabase.from('market_briefings').insert({
            sentiment_score: briefing.sentiment_score,
            summary: briefing.summary,
            key_narratives: briefing.key_narratives,
            created_at: new Date().toISOString()
        });
    } catch(e) { /* Silent fail for brevity */ }


    // --- PHASE 2: DISCOVERY & ENTRY ---
    const trending = await getTrendingCoins();
    // Merge lists, prioritize Tier 1
    // Explicitly cast to CoinScope[] to avoid type errors
    const scanList: CoinScope[] = [
        ...COINS.map(s => ({ symbol: s })), 
        ...trending.filter(t => !COINS.includes(t.symbol))
    ];
    
    for (const coin of scanList) {
        // Skip if we already own it
        if (portfolio.some((p: any) => p.symbol === coin.symbol + "USDT")) continue;

        const candles = await getCandles(coin.symbol);
        if (candles.length < 50) continue;
        
        const currentPrice = candles[candles.length - 1];
        
        // INDICATORS
        const rsiVal = RSI.calculate({ values: candles, period: 14 });
        const currentRSI = rsiVal[rsiVal.length - 1];
        
        const bb = BollingerBands.calculate({ values: candles, period: 20, stdDev: 2 });
        const currentBB = bb[bb.length - 1];

        if (!currentRSI || !currentBB) continue;

        let buySignal = false;
        let reasoning = "";

        // STRATEGY A: Volatile Bounce (Oversold + Lower Band)
        if (currentRSI < STRATEGY.RSI_OVERSOLD && currentPrice <= currentBB.lower) {
            buySignal = true;
            reasoning = `📉 VOLATILITY BOUNCE: Price touched Lower BB & RSI ${currentRSI.toFixed(1)} (Oversold)`;
        }
        
        // STRATEGY B: Hype Dip (Trending + RSI Pullback)
        else if (coin.isTrending && currentRSI < STRATEGY.RSI_HYPE_ENTRY) {
            buySignal = true;
            reasoning = `🔥 HYPE DIP: Coin is Trending & RSI ${currentRSI.toFixed(1)} (Pullback)`;
        }

        if (buySignal) {
            // RISK MANAGEMENT 1:3
            const stopLoss = currentPrice * (1 - STRATEGY.RISK_PCT);
            const takeProfit = currentPrice * (1 + STRATEGY.REWARD_PCT);
            
            // ASK AI FOR 2nd OPINION (The filter)
            await logToTerminal(`🤖 ${coin.symbol} Setup Found (${reasoning}). Asking AI...`, 'info');
            const aiDecision = await llm.analyzeSetup(coin.symbol, currentPrice, { k: currentRSI, d: 50, isUpTrend: true, isMacdPositive: true }); // Mocking indicators for the LLM function signature
            
            if (aiDecision.decision === "BUY") {
                const amountUsd = currentBalance * STRATEGY.ALLOCATION_PCT;
                const tokenAmount = amountUsd / currentPrice;

                // EXECUTE BUY
                await supabase.from('sim_portfolio').insert({
                    symbol: coin.symbol + "USDT",
                    amount: tokenAmount,
                    avg_buy_price: currentPrice,
                    stop_loss: stopLoss,
                    take_profit: takeProfit
                });
                
                await supabase.from('sim_settings').update({ balance_usdt: currentBalance - amountUsd }).eq('id', settings.id);

                await logToTerminal(`🚀 BOUGHT ${coin.symbol} @ $${currentPrice.toFixed(4)}`, 'success');
                await discord.sendAlert(`🚀 ENTRY: ${coin.symbol} ${coin.isTrending ? '(🔥 Trending)' : ''}`, [
                    { name: "Strategy", value: reasoning, inline: false },
                    { name: "Plan", value: `TP: $${takeProfit.toFixed(4)} (+6%) | SL: $${stopLoss.toFixed(4)} (-2%)`, inline: false },
                    { name: "AI View", value: aiDecision.reasoning, inline: false }
                ], 0x00ff00);
            } else {
                 await logToTerminal(`✋ AI Rejected ${coin.symbol}: ${aiDecision.reasoning}`, 'info');
            }
        }
    }

    await supabase.from('sim_settings').update({ last_run: new Date().toISOString() }).eq('id', settings.id);
    console.log("🏁 Run Complete.");
}

runBot();
