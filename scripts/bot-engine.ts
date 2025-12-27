import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { MACD, StochasticRSI, EMA } from 'technicalindicators';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const COINS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "SUI", "TRX", "LINK"];
const INTERVAL = "15m"; // High-Velocity Swing
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("🔥 CRITICAL: Missing Supabase Credentials. Check your .env or GitHub Secrets.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Types
interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface SentimentResult {
    score: number;
    reason: string;
}

// --- HELPERS ---

async function log(message: string) {
    console.log(message);
    // Also save to database for the Frontend "Live Terminal"
    await supabase.from('sim_logs').insert({ message, timestamp: new Date().toISOString() });
}

// Fetch Candles from Binance (Public API)
async function getCandles(symbol: string, limit: number = 300): Promise<Candle[]> {
    try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${INTERVAL}&limit=${limit}`;
        const { data } = await axios.get(url);
        return data.map((d: any) => ({
            time: d[0],
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5]),
        }));
    } catch (e) {
        console.error(`⚠️ Error fetching candles for ${symbol}:`, (e as Error).message);
        return [];
    }
}

// News Sentiment Analysis
async function getNewsSentiment(symbol: string): Promise<SentimentResult> {
    try {
        // Using CryptoCompare Public News API
        // In production, you might want to cycle keys or use a paid endpoint if rate limited.
        const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${symbol}`;
        const { data } = await axios.get(url, { timeout: 5000 }); // 5s timeout
        
        const articles = data.Data.slice(0, 5); // Analyze last 5 headlines
        let score = 0;
        let triggers: string[] = [];

        // Keywords
        const POSITIVE = ["launch", "partnership", "bull", "adoption", "record", "upgrade", "etf", "soar", "surge"];
        const NEGATIVE = ["ban", "hack", "lawsuit", "crash", "sec", "down", "stolen", "drop", "collapse"];

        articles.forEach((article: any) => {
            const text = (article.title + " " + article.body).toLowerCase();
            
            POSITIVE.forEach(word => {
                if (text.includes(word)) {
                    score += 1;
                    if (!triggers.includes(word)) triggers.push(`+${word}`);
                }
            });

            NEGATIVE.forEach(word => {
                if (text.includes(word)) {
                    score -= 1;
                    if (!triggers.includes(word)) triggers.push(`-${word}`);
                }
            });
        });

        // Cap score logically
        const reason = triggers.length > 0 ? triggers.join(", ") : "Neutral News";
        return { score, reason };

    } catch (e) {
        console.log(`⚠️ News API failed for ${symbol}, assuming Neutral.`);
        return { score: 0, reason: "API Error (Neutral)" };
    }
}

// --- MAIN BOT ENGINE ---

async function runBot() {
    console.log(`\n👻 GHOST BOT ENGINE STARTING... [${new Date().toISOString()}]`);
    console.log(`🚀 Strategy: High-Velocity Swing (StochRSI + MACD + EMA200 + NewsSentiment)`);

    // 1. Load Settings & Portfolio
    const { data: settings } = await supabase.from('sim_settings').select('*').limit(1).single();
    if (!settings || !settings.is_bot_active) {
        console.log("💤 Bot is paused or settings missing. Exiting.");
        return;
    }

    let { data: portfolio } = await supabase.from('sim_portfolio').select('*');
    if (!portfolio) portfolio = [];

    const config = settings.config || {};
    const RISK_PER_TRADE = config.risk_per_trade || 0.05; // Default 5% of balance per trade
    
    let currentBalance = parseFloat(settings.balance_usdt);
    console.log(`💰 WALLET BALANCE: $${currentBalance.toFixed(2)}`);

    // 2. Scan Market (All Coins)
    for (const coin of COINS) {
        console.log(`\n🔍 Analyzing ${coin}...`);
        
        // A. Fetch Data
        const candles = await getCandles(coin);
        if (candles.length < 200) {
            console.log(`   -> Not enough data. Skipping.`);
            continue;
        }

        const closes = candles.map(c => c.close);
        const currentPrice = closes[closes.length - 1];

        // B. Calculate Indicators
        const stochRsiInput = {
            values: closes,
            rsiPeriod: config.stoch_len || 14,
            stochasticPeriod: config.stoch_len || 14,
            kPeriod: config.stoch_k || 3,
            dPeriod: config.stoch_d || 3,
        };
        const stochResults = StochasticRSI.calculate(stochRsiInput);
        const latestStoch = stochResults[stochResults.length - 1];
        const prevStoch = stochResults[stochResults.length - 2];

        const macdInput = {
            values: closes,
            fastPeriod: config.macd_fast || 12,
            slowPeriod: config.macd_slow || 26,
            signalPeriod: config.macd_sig || 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        };
        const macdResults = MACD.calculate(macdInput);
        const latestMacd = macdResults[macdResults.length - 1];

        const ema200Results = EMA.calculate({ period: 200, values: closes });
        const latestEma200 = ema200Results[ema200Results.length - 1];

        // Ensure we have all indicators
        if (!latestStoch || !latestMacd || !latestEma200) {
           console.log("   -> Indicators not ready.");
           continue;
        }

        // C. Logic Checks
        const holding = portfolio.find((p: any) => p.symbol === coin + "USDT");
        const isUpTrend = currentPrice > latestEma200;
        const isMacdPositive = (latestMacd.histogram || 0) > 0;
        
        // Buy Logic: Stoch Cross Up (<20) AND Positive Momentum AND Up Trend
        const stochCrossUp = prevStoch.k < prevStoch.d && latestStoch.k > latestStoch.d;
        const isOversold = latestStoch.k < 20 && latestStoch.d < 20;

        // Sell Logic: Stoch Cross Down (>80)
        const stochCrossDown = prevStoch.k > prevStoch.d && latestStoch.k < latestStoch.d;
        const isOverbought = latestStoch.k > 80 && latestStoch.d > 80;

        // Log Technical State
        console.log(`   -> Price: $${currentPrice.toFixed(2)} | EMA200: $${latestEma200.toFixed(2)} (${isUpTrend ? 'Build' : 'Bear'})`);
        console.log(`   -> Stoch: K=${latestStoch.k.toFixed(2)} D=${latestStoch.d.toFixed(2)} | MACD Hist: ${(latestMacd.histogram || 0).toFixed(4)}`);

        // D. Execution
        if (!holding) {
            // BUY CHECK
            // Condition: Oversold Cross UP + MACD Positive + Above EMA200
            if (stochCrossUp && isOversold && isMacdPositive && isUpTrend) {
                console.log("   ✅ TECHNICAL BUY SIGNAL DETECTED! Checking News...");
                
                // News Filter
                const sentiment = await getNewsSentiment(coin);
                console.log(`   📰 Sentiment Score: ${sentiment.score} (${sentiment.reason})`);

                if (sentiment.score < -1) {
                    await log(`🚫 Skipped BUY on ${coin}: Technicals Good but News FUD (${sentiment.reason})`);
                } else {
                    // Valid Buy
                    let positionSize = currentBalance * RISK_PER_TRADE;
                    let sizeReason = "Standard Size";

                    // News Boost
                    if (sentiment.score > 2) {
                        positionSize *= 1.5;
                        sizeReason = "News Boost 1.5x 🚀";
                    }

                    if (currentBalance >= positionSize) {
                        const amount = positionSize / currentPrice;
                        
                        // Execute DB
                        await supabase.from('sim_portfolio').insert({ symbol: coin + "USDT", amount, avg_buy_price: currentPrice });
                        await supabase.from('sim_settings').update({ balance_usdt: currentBalance - positionSize }).eq('id', settings.id);
                        await supabase.from('sim_trades').insert({ 
                            symbol: coin + "USDT", 
                            side: "BUY", 
                            amount, 
                            price: currentPrice, 
                            news_score: sentiment.score,
                            pnl: 0 
                        });

                        currentBalance -= positionSize; // Update local for next iteration
                        await log(`✅ BOUGHT ${coin} @ $${currentPrice.toFixed(2)} | ${sizeReason}`);
                    }
                }
            } else {
                 console.log("   -> No Buy Signal.");
            }
        } 
        else {
            // SELL CHECK
            // Condition: Overbought Cross Down OR Stop Loss? (For now just Strategy Exit)
            // Stop Loss could be added, but adhering to prompt:
            // "Sell Signal: K line crosses BELOW D line while both are > 80 (Overbought Cross)."
            
            if (stochCrossDown && isOverbought) {
                 console.log("   🔻 TECHNICAL SELL SIGNAL (Overbought Cross). Executing...");
                 
                 const amount = parseFloat(holding.amount);
                 const revenue = amount * currentPrice;
                 const profit = revenue - (amount * parseFloat(holding.avg_buy_price));
                 
                 // Execute DB
                 await supabase.from('sim_portfolio').delete().eq('symbol', coin + "USDT");
                 await supabase.from('sim_settings').update({ balance_usdt: currentBalance + revenue }).eq('id', settings.id);
                 await supabase.from('sim_trades').insert({ 
                    symbol: coin + "USDT", 
                    side: "SELL", 
                    amount, 
                    price: currentPrice, 
                    news_score: 0, 
                    pnl: profit 
                 });
                 
                 currentBalance += revenue;
                 await log(`💰 SOLD ${coin} @ $${currentPrice.toFixed(2)} | PnL: $${profit.toFixed(2)}`);
            } else {
                console.log("   -> Holding. Waiting for exit.");
            }
        }
    }

    // 3. Heartbeat & History
    await supabase.from('sim_settings').update({ last_run: new Date().toISOString() }).eq('id', settings.id);
    
    // Save history snapshot (useful for graph)
    // We calculate total equity approximately
    const { data: finalPortfolio } = await supabase.from('sim_portfolio').select('*');
    let equity = currentBalance;
    // We would need current prices for all held assets to be accurate, 
    // but for 10-min resolution, fetching again or using last fetch is fine.
    // Simpler: Just save cash balance + approx value if needed, 
    // but typically history tracks total Net Worth.
    // For now, let's just log status.
    
    console.log("🏁 Run Complete.");
}

runBot();
