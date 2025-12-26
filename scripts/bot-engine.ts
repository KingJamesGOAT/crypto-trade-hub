import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { RSI, EMA, ADX } from 'technicalindicators';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load env vars if running locally
dotenv.config();

// Configuration
const COINS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "SUIUSDT", "TRXUSDT", "LINKUSDT"];
const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const binanceApiKey = process.env.BINANCE_API_KEY; // Optional but recommended

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Settings {
  id: number;
  balance_usdt: number;
  is_bot_active: boolean;
  config: {
    rsi_length: number;
    rsi_buy: number;
    rsi_sell: number;
    ema_period: number;
    adx_threshold: number;
  };
}

interface PortfolioItem {
  symbol: string;
  amount: number;
  avg_buy_price: number;
}

async function fetchCandles(symbol: string, interval: string = '15m', limit: number = 300) {
  try {
    const response = await axios.get(BINANCE_API_URL, {
      params: { symbol, interval, limit },
      headers: binanceApiKey ? { 'X-MBX-APIKEY': binanceApiKey } : undefined
    });
    // formatting: [open time, open, high, low, close, volume, ...]
    const candles = response.data.map((d: any[]) => ({
      close: parseFloat(d[4]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      open: parseFloat(d[1]), // Usually not needed for these indicators but keeping it
    }));
    return candles;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return [];
  }
}

async function runBot() {
  console.log(`[${new Date().toISOString()}] Starting Bot Run...`);

  // 1. Fetch Settings
  const { data: settingsData, error: settingsError } = await supabase
    .from('sim_settings')
    .select('*')
    .single();

  if (settingsError || !settingsData) {
    console.error('Error fetching settings:', settingsError);
    return;
  }

  const settings: Settings = settingsData;
  if (!settings.is_bot_active) {
    console.log('Bot is paused in settings.');
    return;
  }

  const { rsi_length, rsi_buy, rsi_sell, ema_period, adx_threshold } = settings.config;
  let currentBalance = parseFloat(settings.balance_usdt.toString());

  // 2. Fetch Portfolio
  const { data: portfolioData, error: portfolioError } = await supabase
    .from('sim_portfolio')
    .select('*');

  if (portfolioError) {
    console.error('Error fetching portfolio:', portfolioError);
    return;
  }

  const portfolioMap = new Map<string, PortfolioItem>();
  portfolioData?.forEach((item: PortfolioItem) => portfolioMap.set(item.symbol, item));

  // 3. Process each coin
  // We process sequentially or parallel? Parallel is faster.
  const promises = COINS.map(async (symbol) => {
    // Fetch candles
    const candles = await fetchCandles(symbol, '15m', 300);
    if (candles.length < Math.max(ema_period, rsi_length, 14) + 10) {
      console.warn(`Not enough data for ${symbol}`);
      return;
    }

    const closes = candles.map((c: any) => c.close);
    const highs = candles.map((c: any) => c.high);
    const lows = candles.map((c: any) => c.low);

    // Calculate Indicators
    // RSI
    const rsiValues = RSI.calculate({ values: closes, period: rsi_length });
    const currentRsi = rsiValues[rsiValues.length - 1];

    // EMA
    const emaValues = EMA.calculate({ values: closes, period: ema_period });
    const currentEma = emaValues[emaValues.length - 1];

    // ADX
    const adxValues = ADX.calculate({ close: closes, high: highs, low: lows, period: 14 });
    const currentAdx = adxValues[adxValues.length - 1]?.adx;

    const currentPrice = closes[closes.length - 1];

    console.log(`${symbol} | Price: ${currentPrice} | RSI: ${currentRsi.toFixed(2)} | EMA: ${currentEma.toFixed(2)} | ADX: ${currentAdx?.toFixed(2) || 'N/A'}`);

    if (currentAdx === undefined) return;

    // Check Logic
    const heldItem = portfolioMap.get(symbol);
    
    // BUY LOGIC
    // Rule: Close > EMA (Uptrend) AND RSI < 30 (Dip) AND ADX > 25 (Strong Trend)
    // We also check if we already hold it. For this simple bot, maybe we don't buy if we already hold?
    // User logic: "Buy: Use 10% of available USDT balance per trade"
    // So we can buy multiple times? Or only if not held?
    // "Sell 100% of the holding for that coin." suggests we treat it as "Position Open" / "Position Close".
    // So I assume: If NOT held, Check Buy. If Held, Check Sell.
    
    if (!heldItem) {
      if (currentPrice > currentEma && currentRsi < rsi_buy && currentAdx > adx_threshold) {
        // EXECUTE BUY
        const tradeAmountUsdt = currentBalance * 0.10; // 10% of balance
        if (tradeAmountUsdt < 10) {
           console.log(`${symbol}: Balance too low to trade ($${currentBalance})`);
           return;
        }
        
        const quantity = tradeAmountUsdt / currentPrice;

        console.log(`>>> BUY SIGNAL for ${symbol} at ${currentPrice}`);

        // Update DB
        // 1. Deduct Balance
        // 2. Add to Portfolio
        // 3. Log Trade
        // We do this in a "transaction" conceptually, but supabase-js via HTTP doesn't do strict transactions easily without RPC.
        // We'll just do sequential calls for now.

        // Optimistic update of local balance to prevent double usage in parallel loop?
        // Actually, since we are in a loop, 'currentBalance' is shared. We should run this loop sequentially or handle concurrency.
        // I will use a mutex or just run carefully. Since JS is single threaded event loop, we just need to be careful with 'await'.
        // BUT 'Promise.all' runs them "in parallel" (interleaved). So 'currentBalance' might be stale.
        // Ideally we shouldn't use 10% of STARTING balance for all coins.
        // I will refresh balance? Or just let it be slightly "off" for one run?
        // Let's protect against double spend by checking fresh balance? Or locking?
        // Simplest: Promise.all to fetch data, then process logic sequentially.
        
        return { action: 'BUY', symbol, price: currentPrice, quantity, cost: tradeAmountUsdt };
      }
    } else {
      // SELL LOGIC
      // Rule: RSI > 70 OR Close < EMA (Trend Broken)
      if (currentRsi > rsi_sell || currentPrice < currentEma) {
        // EXECUTE SELL
        console.log(`>>> SELL SIGNAL for ${symbol} at ${currentPrice} (Reason: ${currentRsi > rsi_sell ? 'Overbought' : 'Trend Broken'})`);
        
        // 1. Remove from Portfolio
        // 2. Add to Balance
        // 3. Log Trade with PnL
        const revenue = heldItem.amount * currentPrice;
        const pnl = revenue - (heldItem.amount * heldItem.avg_buy_price);
        
        return { action: 'SELL', symbol, price: currentPrice, quantity: heldItem.amount, revenue, pnl, avgBuy: heldItem.avg_buy_price };
      }
    }
    return null;
  });

  const results = await Promise.all(promises);

  // Execute Trades Sequentially to manage balance correctly
  for (const res of results) {
    if (!res) continue;

    // Refetch latest balance to be safe
    const { data: freshSettings } = await supabase.from('sim_settings').select('balance_usdt').single();
    if (!freshSettings) continue;
    let freshBalance = parseFloat(freshSettings.balance_usdt.toString());

    if (res.action === 'BUY') {
        const cost = res.cost;
        if (cost === undefined) continue; // Should not happen for BUY

        if (freshBalance < cost) {
            console.log(`Skipping BUY for ${res.symbol}, insufficient funds (Has: ${freshBalance}, Needs: ${cost})`);
            continue;
        }

        // 1. Update Balance
        const newBalance = freshBalance - cost;
        await supabase.from('sim_settings').update({ balance_usdt: newBalance }).eq('id', settings.id);

        // 2. Add to Portfolio
        await supabase.from('sim_portfolio').insert({
            symbol: res.symbol,
            amount: res.quantity,
            avg_buy_price: res.price
        });

        // 3. Log Trade
        await supabase.from('sim_trades').insert({
            symbol: res.symbol,
            side: 'BUY',
            amount: res.quantity,
            price: res.price,
            pnl: 0
        });
        
        console.log(`[EXECUTED] BOUGHT ${res.symbol}`);

    } else if (res.action === 'SELL') {
        // 1. Update Balance
        const newBalance = freshBalance + res.revenue!;
        await supabase.from('sim_settings').update({ balance_usdt: newBalance }).eq('id', settings.id);

        // 2. Remove from Portfolio
        await supabase.from('sim_portfolio').delete().eq('symbol', res.symbol);

        // 3. Log Trade
        await supabase.from('sim_trades').insert({
            symbol: res.symbol,
            side: 'SELL',
            amount: res.quantity,
            price: res.price,
            pnl: res.pnl
        });
         console.log(`[EXECUTED] SOLD ${res.symbol} (PnL: $${res.pnl?.toFixed(2)})`);
    }
  }

  console.log('Bot run finished.');
}

runBot().catch(err => console.error(err));
