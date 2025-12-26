import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { RSI, EMA, BollingerBands } from 'technicalindicators';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURATION ---
const COINS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", 
  "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "SUIUSDT", "TRXUSDT", "LINKUSDT"
];
const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';

// --- INITIALIZATION ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const binanceApiKey = process.env.BINANCE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Missing Supabase Credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- TYPES ---
interface Settings {
  id: number;
  balance_usdt: number;
  is_bot_active: boolean;
  config: {
    rsi_length: number;
    rsi_buy: number;
    rsi_sell: number;
    ema_period: number;
    bb_period: number;
    bb_std: number;
  };
}

// --- HELPERS ---
async function logActivity(message: string) {
    const { error } = await supabase.from('sim_logs').insert({ message, timestamp: new Date().toISOString() });
    if(error) console.error("Log Error:", error.message);
}

async function fetchCandles(symbol: string, limit: number = 300) {
  try {
    const response = await axios.get(BINANCE_API_URL, {
      params: { symbol, interval: '15m', limit },
      headers: binanceApiKey ? { 'X-MBX-APIKEY': binanceApiKey } : undefined
    });
    // Return Close Prices
    return response.data.map((d: any[]) => parseFloat(d[4]));
  } catch (error) {
    console.error(`[API ERROR] Could not fetch ${symbol}`);
    await logActivity(`[API ERROR] Could not fetch ${symbol}`);
    return [];
  }
}

// --- MAIN ENGINE ---
async function runBot() {
  console.log(`\n👻 GHOST BOT INITIATED: ${new Date().toISOString()}`);
  await logActivity(`👻 Ghost Bot woken up. Scanning market...`);

  // 1. LOAD BRAIN (Settings)
  const { data: settingsData, error } = await supabase.from('sim_settings').select('*').single();
  if (error || !settingsData) {
      console.error('Failed to load settings from Supabase.');
      return;
  }
  
  const settings: Settings = settingsData;
  if (!settings.is_bot_active) {
      console.log('Bot is globally PAUSED in settings.');
      await logActivity('Bot is PAUSED. Sleeping.');
      return;
  }

  // Default values if config is missing (Safety fallback)
  const rsi_length = settings.config?.rsi_length || 14;
  const rsi_buy = settings.config?.rsi_buy || 30;
  const rsi_sell = settings.config?.rsi_sell || 70;
  const ema_period = settings.config?.ema_period || 200;
  const bb_period = settings.config?.bb_period || 20;
  const bb_std = settings.config?.bb_std || 2;

  let availableBalance = parseFloat(settings.balance_usdt.toString());
  let currentInvested = 0;

  console.log(`💰 BALANCE: $${availableBalance.toFixed(2)}`);

  // 2. LOAD PORTFOLIO
  const { data: portfolioData } = await supabase.from('sim_portfolio').select('*');
  const portfolioMap = new Map<string, any>();
  if (portfolioData) {
      portfolioData.forEach((p: any) => {
          portfolioMap.set(p.symbol, p);
          currentInvested += (p.amount * p.avg_buy_price); // Approx value
      });
  }

  // 3. ANALYZE MARKET (Parallel Fetching)
  const tradeDecisions = await Promise.all(COINS.map(async (symbol) => {
    const closes = await fetchCandles(symbol);
    if (closes.length < ema_period + 10) return null;

    const currentPrice = closes[closes.length - 1];

    // INDICATORS
    const rsiRaw = RSI.calculate({ values: closes, period: rsi_length });
    const emaRaw = EMA.calculate({ values: closes, period: ema_period });
    const bbRaw = BollingerBands.calculate({ values: closes, period: bb_period, stdDev: bb_std });

    const rsi = rsiRaw[rsiRaw.length - 1];
    const ema = emaRaw[emaRaw.length - 1];
    const bb = bbRaw[bbRaw.length - 1];

    if (!rsi || !ema || !bb) return null;

    // LOGIC
    const holding = portfolioMap.get(symbol);
    let action = 'NEUTRAL';
    let reason = '';

    // --- STRATEGY: BOLLINGER SNIPER ---
    if (!holding) {
      // BUY: Trend Safe (Price > EMA) AND Oversold (Price < Lower Band) AND Cheap (RSI Low)
      const isUptrend = currentPrice > ema;
      const isOversold = currentPrice < bb.lower; // The Sniper Entry
      const isRsiLow = rsi < rsi_buy;

      if (isUptrend && isOversold && isRsiLow) {
        action = 'BUY';
        reason = `Sniper Entry! Price ($${currentPrice.toFixed(2)}) < Lower BB ($${bb.lower.toFixed(2)})`;
      } else {
         // Verbose logging for debugging "why didn't it buy?"
         // console.log(`${symbol}: RSI=${rsi.toFixed(2)} Price=${currentPrice.toFixed(2)} LowerBB=${bb.lower.toFixed(2)} Uptrend=${isUptrend}`);
      }
    } else {
      // SELL: Overbought (RSI High) OR Price hits Upper Band OR Trend Broken
      if (rsi > rsi_sell) {
        action = 'SELL';
        reason = `RSI Overbought (${rsi.toFixed(2)})`;
      } else if (currentPrice > bb.upper) {
        action = 'SELL';
        reason = 'Hit Upper Bollinger Band';
      } else if (currentPrice < ema * 0.98) { // 2% below EMA = Trend Broken (Stop Loss)
        action = 'SELL';
        reason = 'Trend Broken (Stop Loss)';
      }
    }

    if (action !== 'NEUTRAL') {
      return { symbol, action, price: currentPrice, reason, holding };
    }
    return null;
  }));

  // 4. EXECUTE TRADES (Sequential to protect balance)
  let tradesMade = false;
  for (const trade of tradeDecisions) {
    if (!trade) continue;

    // Refresh Balance (Crucial for loop safety)
    const { data: freshUser } = await supabase.from('sim_settings').select('balance_usdt').single();
    if (!freshUser) continue;
    availableBalance = parseFloat(freshUser.balance_usdt.toString());

    if (trade.action === 'BUY') {
      const betSize = availableBalance * 0.15; // 15% of balance per trade
      if (betSize < 10) {
        console.log(`Skipping ${trade.symbol}: Insufficient funds ($${availableBalance.toFixed(2)})`);
        await logActivity(`Skipping ${trade.symbol}: Insufficient funds.`);
        continue;
      }
      
      const amount = betSize / trade.price;
      
      // DB Transaction
      await supabase.from('sim_settings').update({ balance_usdt: availableBalance - betSize }).eq('id', settings.id);
      await supabase.from('sim_portfolio').upsert({ symbol: trade.symbol, amount, avg_buy_price: trade.price });
      await supabase.from('sim_trades').insert({ symbol: trade.symbol, side: 'BUY', amount, price: trade.price });
      
      const msg = `✅ BOUGHT ${trade.symbol} @ $${trade.price.toFixed(2)} | ${trade.reason}`;
      console.log(msg);
      await logActivity(msg);
      tradesMade = true;
      availableBalance -= betSize; // Local update
      currentInvested += betSize;
    
    } else if (trade.action === 'SELL') {
      const revenue = trade.holding.amount * trade.price;
      const pnl = revenue - (trade.holding.amount * trade.holding.avg_buy_price);

      // DB Transaction
      await supabase.from('sim_settings').update({ balance_usdt: availableBalance + revenue }).eq('id', settings.id);
      await supabase.from('sim_portfolio').delete().eq('symbol', trade.symbol);
      await supabase.from('sim_trades').insert({ symbol: trade.symbol, side: 'SELL', amount: trade.holding.amount, price: trade.price, pnl });

      const msg = `🚨 SOLD ${trade.symbol} @ $${trade.price.toFixed(2)} | PnL: $${pnl.toFixed(2)} | ${trade.reason}`;
      console.log(msg);
      await logActivity(msg);
      tradesMade = true;
      availableBalance += revenue; // Local update
      currentInvested -= (trade.holding.amount * trade.holding.avg_buy_price); // Remove cost basis
    }
  }

  // 5. SNAPSHOT HISTORY
  if (!tradesMade) {
      const msg = `Scanning complete. No setups found. Balance: $${availableBalance.toFixed(2)}`;
      console.log(msg);
      await logActivity(msg);
  }

  // Record Total Equity for the Graph
  const totalEquity = availableBalance + currentInvested;
  await supabase.from('sim_balance_history').insert({
      balance_usdt: availableBalance,
      total_equity_usdt: totalEquity,
      timestamp: new Date().toISOString()
  });

  console.log('🏁 Run Complete.\n');
}

runBot();
