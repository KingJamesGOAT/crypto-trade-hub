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

interface CoinScope {
    symbol: string;
    id?: string; // Optional, present only for Tier 2 (Trending) coins
}

// --- HELPERS ---

async function log(message: string) {
    console.log(message);
    // Also save to database for the Frontend "Live Terminal"
    await supabase.from('sim_logs').insert({ message, timestamp: new Date().toISOString() });
}

// Fetch Market Mood (Fear & Greed Index)
async function getMarketMood(): Promise<number> {
    try {
        const { data } = await axios.get("https://api.alternative.me/fng/?limit=1");
        return parseInt(data.data[0].value);
    } catch (e) {
        console.error("⚠️ F&G API failed, assuming 50.");
        return 50;
    }
}

// Fetch Trending Coins (Discovery Mode)
async function getTrendingCoins(): Promise<CoinScope[]> {
    try {
        const { data } = await axios.get("https://api.coingecko.com/api/v3/search/trending");
        // Extract top 7
        const trends = data.coins.slice(0, 7).map((c: any) => ({
             symbol: c.item.symbol.toUpperCase(),
             id: c.item.id
        }));
        
        // Filter 1: Deduplication (Ignore if already in Tier 1)
        const unique = trends.filter((coin: CoinScope) => !COINS.includes(coin.symbol));
        
        // Filter 2: Basic formatting safety
        return unique.filter((coin: CoinScope) => /^[A-Z0-9]+$/.test(coin.symbol)); 
    } catch (e) {
        console.error("⚠️ Failed to fetch trending coins, defaulting to empty list.");
        return [];
    }
}

// Check Social Hype (Social Intelligence)
async function checkSocialHype(id: string): Promise<boolean> {
    try {
        // Fetch Community Data
        const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=false&community_data=true&developer_data=false`;
        const { data } = await axios.get(url, { timeout: 5000 });
        
        const twitter = data.community_data?.twitter_followers || 0;
        const reddit = data.community_data?.reddit_subscribers || 0;

        // "Ghost Town" Filter: If NO community, it's a fake pump
        if (twitter < 500 && reddit < 100) {
            return false;
        }
        
        return true;
    } catch (e) {
        // Fail-safe: If API limits hit (429) or other error, assume it's SAFE to avoid missing real gems
        // In a real production bot, you might want to be safer, but for "Gem Hunting" we default to Open.
        console.log(`⚠️ Social Check API failed for ${id} (Rate Limit?), assuming Safe.`);
        return true;
    }
}

// Fetch Candles from Binance (Public API) -- WITH VALIDATION
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
        // Validation: If 404/400, it means it's not on Binance or unavailable
        console.log(`⚠️ Trending coin ${symbol} not found on Binance or API error. Skipping.`);
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
    await log("👻 Scan Started...");
    
    // 1. Load Settings & Portfolio
    const { data: settings } = await supabase.from('sim_settings').select('*').limit(1).single();
    if (!settings || !settings.is_bot_active) {
        console.log("💤 Bot is paused or settings missing. Exiting.");
        return;
    }

    let { data: portfolio } = await supabase.from('sim_portfolio').select('*');
    if (!portfolio) portfolio = [];

    const config = settings.config || {};
    let STANDARD_RISK = config.risk_per_trade || 0.05; // Default 5% for Generals
    let STOP_LOSS_PCT = config.stop_loss_pct || 0.03; // Default 3% stop loss
    
    let currentBalance = parseFloat(settings.balance_usdt);
    console.log(`💰 WALLET BALANCE: $${currentBalance.toFixed(2)}`);

    // 2. Market Mood Analysis
    const mood = await getMarketMood();

    if (mood < 20) {
        STANDARD_RISK = 0.08;
        await log(`😱 Extreme Fear detected (${mood}). Sniper Mode ACTIVATE! (Risk 8%)`);
    } else if (mood > 80) {
        STOP_LOSS_PCT = 0.01;
        await log(`🤑 Extreme Greed detected (${mood}). Tightening Stop Losses to 1%.`);
    } else {
        console.log(`🧠 Market Mood: Neutral (${mood}). Using defaults.`);
    }

    // 3. Discovery Mode (Build Coin List)
    const tier1Coins: CoinScope[] = COINS.map(s => ({ symbol: s }));
    const tier2Coins: CoinScope[] = await getTrendingCoins();
    
    if (tier2Coins.length > 0) {
        const symbols = tier2Coins.map(t => t.symbol).join(", ");
        await log(`💎 Gem Hunter found: [${symbols}]`);
    }

    // Merge lists
    const allCoins = [...tier1Coins, ...tier2Coins];

    let tradeMade = false;

    // 4. Scan Market (All Coins)
    for (const coin of allCoins) {
        console.log(`\n🔍 Analyzing ${coin.symbol}...`);
        
        // --- SOCIAL INTELLIGENCE CHECK (Tier 2 Only) ---
        if (coin.id) {
             const isHypeReal = await checkSocialHype(coin.id);
             if (!isHypeReal) {
                 await log(`🚫 Skipped Gem ${coin.symbol}: Price is trending but Socials are dead (Fake Pump risk).`);
                 continue;
             }
             await log(`🗣️ Social AI: ${coin.symbol} community is active. Proceeding to technical scan.`);
        }

        // A. Fetch Data (Robust Validation)
        const candles = await getCandles(coin.symbol);
        if (candles.length < 200) {
            // Already logged inside getCandles if it was a 404
            if (candles.length > 0 && candles.length < 200) {
                console.log(`   -> Not enough data (${candles.length}). Skipping.`);
            }
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
        const holding = portfolio.find((p: any) => p.symbol === coin.symbol + "USDT");
        const isUpTrend = currentPrice > latestEma200;
        const isMacdPositive = (latestMacd.histogram || 0) > 0;
        
        // Buy Logic: Stoch Cross Up (<20) AND Positive Momentum AND Up Trend
        const stochCrossUp = prevStoch.k < prevStoch.d && latestStoch.k > latestStoch.d;
        
        // Sell Logic: Stoch Cross Down (>80)
        const stochCrossDown = prevStoch.k > prevStoch.d && latestStoch.k < latestStoch.d;
        const isOverbought = latestStoch.k > 80 && latestStoch.d > 80;

        // Log Technical State
        console.log(`   -> Price: $${currentPrice.toFixed(2)} | EMA200: $${latestEma200.toFixed(2)} (${isUpTrend ? 'Build' : 'Bear'})`);
        console.log(`   -> Stoch: K=${latestStoch.k.toFixed(2)} D=${latestStoch.d.toFixed(2)}`);

        // D. Execution
        if (!holding) {
            // BUY CHECK
            // Condition: Stoch Cross Up + Positive Momentum + Up Trend
            if (stochCrossUp && isMacdPositive && isUpTrend) {
                console.log("   ✅ TECHNICAL BUY SIGNAL DETECTED! Checking News...");
                
                // News Filter
                const sentiment = await getNewsSentiment(coin.symbol);
                console.log(`   📰 Sentiment Score: ${sentiment.score} (${sentiment.reason})`);

                if (sentiment.score < -1) {
                    await log(`🚫 Skipped BUY on ${coin.symbol}: Technicals Good but News FUD (${sentiment.reason})`);
                } else {
                    // Valid Buy - Dynamic Risk Management
                    let RISK_USED = STANDARD_RISK;
                    let typeLog = "Standard Trade Setup";
                    
                    // Check if it's a Tier 1 Coin (General)
                    const isTier1 = COINS.includes(coin.symbol);

                    if (!isTier1) {
                         // Tier 2 (Scout)
                         RISK_USED = 0.015; // 1.5% Risk
                         typeLog = "🚀 HYPE TRADE! Low Risk Mode (1.5%)";
                    }

                    const amount = (currentBalance * RISK_USED) / currentPrice; 
                    
                    // Execute DB
                    await supabase.from('sim_portfolio').insert({ symbol: coin.symbol + "USDT", amount, avg_buy_price: currentPrice });
                    await supabase.from('sim_settings').update({ balance_usdt: currentBalance - (amount * currentPrice) }).eq('id', settings.id);
                    await supabase.from('sim_trades').insert({ 
                        symbol: coin.symbol + "USDT", 
                        side: "BUY", 
                        amount, 
                        price: currentPrice, 
                        news_score: sentiment.score,
                        pnl: 0 
                    });

                    currentBalance -= (amount * currentPrice); // Update local for next iteration
                    tradeMade = true;
                    
                    // Add Gem Emoji to log if Tier 2
                    const gemEmoji = !isTier1 ? "💎" : "";
                    await log(`✅ BOUGHT ${coin.symbol} ${gemEmoji} @ $${currentPrice.toFixed(2)} | ${typeLog} | News: ${sentiment.score}`);
                }
            } else {
                // Not a Buy - Log Skipped
                // Only log "Skipped" for major coins (BTC/ETH/SOL) OR if it was a Trending Coin that almost made it
                const isTier1 = COINS.includes(coin.symbol);
                if (isTier1) {
                     if (["BTC", "ETH", "SOL"].includes(coin.symbol)) {
                         await log(`📉 Skipped ${coin.symbol}: Trend=${isUpTrend ? '✅' : '❌'} Momentum=${isMacdPositive ? '✅' : '❌'} Stoch=${stochCrossUp ? '✅' : '❌'}`);
                     }
                } else {
                    // Reduce noise for skipped random meme coins, maybe only log if Trend was OK?
                    if (isUpTrend) {
                        console.log(`📉 Skipped GEM ${coin.symbol}: Trend Good but Momentum/Stoch weak.`);
                    }
                }
            }
        } 
        else {
            // HOLDING LOGIC: Sell if Profit Target, Indicator Exit, or STOP LOSS
            
            const amount = parseFloat(holding.amount);
            const avgPrice = parseFloat(holding.avg_buy_price);
            const pnlPct = (currentPrice - avgPrice) / avgPrice;

            let sellReason = "";

            if (pnlPct < -STOP_LOSS_PCT) {
                sellReason = `🛑 STOP LOSS HIT (${(pnlPct * 100).toFixed(2)}%)`;
            } else if (stochCrossDown && isOverbought) {
                sellReason = "📉 StochRSI Overbought Cross";
            }

            if (sellReason) {
                 console.log(`   🚨 EXECUTE SELL: ${sellReason}`);
                 
                 const revenue = amount * currentPrice;
                 const profit = revenue - (amount * avgPrice);
                 
                 // Execute DB
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
                 await log(`🚨 SOLD ${coin.symbol} @ $${currentPrice.toFixed(2)} | PnL: $${profit.toFixed(2)} | ${sellReason}`);
            } else {
                console.log(`   -> Holding ${coin.symbol}. PnL: ${(pnlPct * 100).toFixed(2)}%`);
            }
        }
    }

    // 5. Heartbeat & History
    await supabase.from('sim_settings').update({ last_run: new Date().toISOString() }).eq('id', settings.id);
    
    if (!tradeMade) {
        await log("🏁 Scan Complete. Market calm.");
    } else {
        await log("🏁 Scan Complete. Trades executed.");
    }
    
    console.log("🏁 Run Complete.");
}

runBot();
