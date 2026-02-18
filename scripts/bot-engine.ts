import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { StochasticRSI, BollingerBands, RSI } from 'technicalindicators';
import * as dotenv from 'dotenv';
import { DiscordAgent } from './services/discord';

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
    console.log("⚠️  Running Smart Money Strategy (Slots + Trailing Stop + Cooldown)");
    await logToTerminal("👻 Scout Engine Scan Started (Smart Mode)...", 'info');
    
    // 1. Load Settings
    const { data: settings } = await supabase.from('sim_settings').select('*').limit(1).single();
    if (!settings || !settings.is_bot_active) {
        console.log("💤 Bot is paused using 'System Sleep' switch.");
        return;
    }
    
    let { data: portfolio } = await supabase.from('sim_portfolio').select('*');
    if (!portfolio) portfolio = [];
    
    let currentBalance = parseFloat(settings.balance_usdt);

    // --- PHASE 0: EXIT MANAGER (Trailing Stop & Hard Stop) ---
    for (const position of portfolio) {
        const symbol = position.symbol.replace("USDT", "");
        const candles = await getCandles(symbol, 5); // Just need latest price
        if (!candles.length) continue;
        
        const currentPrice = candles[candles.length - 1];
        const stopLoss = parseFloat(position.stop_loss);
        const entryPrice = parseFloat(position.avg_buy_price);
        const amount = parseFloat(position.amount); // Asset Amount
        
        let exitReason = "";
        let isWin = false;

        // 1. Check Hard Stop Loss
        if (stopLoss > 0 && currentPrice <= stopLoss) {
            exitReason = "🛑 STOP LOSS HIT";
            isWin = false;
        } 
        
        // 2. Manage Trailing Stop (The "Moon Bag" Logic)
        // If price > 6% profit, we shift from "Target" to "Trailing Stop"
        if (!exitReason && currentPrice >= entryPrice * 1.06) {
            const newTrailingStop = currentPrice * 0.98; // Trail by 2%
            
            // Only update if we are moving the stop UP
            if (newTrailingStop > stopLoss) {
                await supabase.from('sim_portfolio')
                    .update({ stop_loss: newTrailingStop })
                    .eq('symbol', position.symbol);
                
                await logToTerminal(`📈 TRAILING STOP UPDATED: ${symbol} locked at $${newTrailingStop.toFixed(4)}`, 'success');
            }
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

    // --- PHASE 1: DISCOVERY & ENTRY ---
    
    // A. Check Slot Availability
    const MAX_SLOTS = 5;
    if (portfolio.length >= MAX_SLOTS) {
        console.log("🔒 Portfolio Full (Max 5 Slots). Skipping scan.");
        return;
    }

    // B. Calculate Dynamic Position Size (Slot Based)
    // Equity = Cash + Portfolio Value
    // We approximate Portfolio Value as (Entry Price * Amount) for simplicity, or we could fetch live prices.
    // For speed, let's use the Balance + Cost Basis of current holds.
    const portfolioValue = portfolio.reduce((acc: number, p: any) => acc + (parseFloat(p.avg_buy_price) * parseFloat(p.amount)), 0);
    const totalEquity = currentBalance + portfolioValue;
    const targetSlotSize = totalEquity / MAX_SLOTS;
    
    // C. Get Cooldown List (Coins sold for loss in last 60 mins)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentLosses } = await supabase
        .from('sim_trades')
        .select('symbol')
        .eq('exit_reason', '🛑 STOP LOSS HIT')
        .gt('closed_at', oneHourAgo);
    
    const cooldownSymbols = recentLosses?.map((t: any) => t.symbol) || [];

    const trending = await getTrendingCoins();
    const scanList: CoinScope[] = [
        ...COINS.map(s => ({ symbol: s })), 
        ...trending.filter(t => !COINS.includes(t.symbol))
    ];
    
    for (const coin of scanList) {
        const pair = coin.symbol + "USDT";
        
        // 1. Skip if owned
        if (portfolio.some((p: any) => p.symbol === pair)) continue;
        
        // 2. Skip if Cooldown
        if (cooldownSymbols.includes(pair)) {
            // console.log(`❄️ COOLDOWN: Skipping ${coin.symbol} (Recent Loss)`);
            continue;
        }

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
            // RISK MANAGEMENT
            const stopLoss = currentPrice * 0.98; // Start with tighter 2% stop
            // No fixed Take Profit anymore.
            
            await logToTerminal(`⚡ SIGNAL FOUND: ${coin.symbol} | Strategy: ${reasoning}`, 'info');

            // Use Slot Size from above
            const amountUsd = targetSlotSize;
            
            if (amountUsd > currentBalance) {
                console.log("⚠️ Insufficient funds for full slot.");
                continue;
            }

            const tokenAmount = amountUsd / currentPrice;

            // EXECUTE BUY
            await supabase.from('sim_portfolio').insert({
                symbol: pair,
                amount: tokenAmount,
                avg_buy_price: currentPrice,
                stop_loss: stopLoss,
                take_profit: 0 // Unlimited upside (Trailing Stop handles exit)
            });
            
            await supabase.from('sim_settings').update({ balance_usdt: currentBalance - amountUsd }).eq('id', settings.id);

            await logToTerminal(`🚀 BOUGHT ${coin.symbol} @ $${currentPrice.toFixed(4)} | Size: $${amountUsd.toFixed(0)}`, 'success');
            await discord.sendAlert(`🚀 ENTRY: ${coin.symbol} ${coin.isTrending ? '(🔥 Trending)' : ''}`, [
                { name: "Strategy", value: reasoning, inline: false },
                { name: "Plan", value: `Trailing Stop Mode | Initial SL: $${stopLoss.toFixed(4)} (-2%)`, inline: false }
            ], 0x00ff00);
            
            // Stop scanning after 1 buy to prevent over-trading in one tick (wait for next loop)
            break; 
        }
    }

    await supabase.from('sim_settings').update({ last_run: new Date().toISOString() }).eq('id', settings.id);
    console.log("🏁 Run Complete.");
}

// Run for roughly 8 minutes (Leaving 2 mins buffer for the next 10-min schedule)
const MAX_RUNTIME = 8 * 60 * 1000; 
const START_TIME = Date.now();
const RUN_INTERVAL = 60 * 1000; // 1 minute

async function startLoop() {
    console.log("⚡ Bot Loop Started...");
    
    // Check if we have time left
    while (Date.now() - START_TIME < MAX_RUNTIME) {
        try {
            await runBot();
        } catch (e) {
            console.error("💥 Critical Error:", e);
            // Log to Supabase so you see it in the terminal
            await logToTerminal(`💥 Crash: ${e instanceof Error ? e.message : String(e)}`, 'error');
        }
        
        console.log(`⏳ Sleeping for ${RUN_INTERVAL / 1000}s...`);
        await new Promise(r => setTimeout(r, RUN_INTERVAL));
    }
    
    console.log("🛑 Time limit reached. Shutting down for next schedule.");
}

startLoop();
