import type { BacktestResult, Candle, StrategyConfig, BacktestTrade } from "@/types/backtest"

// --- MATH HELPERS ---
function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return 0
  const slice = data.slice(-period)
  const sum = slice.reduce((a, b) => a + b, 0)
  return sum / period
}

function calculateEMA(data: number[], period: number, prevEMA?: number): number {
    if (data.length < period) return 0
    const close = data[data.length - 1]
    
    // Initial SMA fallback
    if (prevEMA === undefined || prevEMA === 0) {
        return calculateSMA(data, period)
    }
    
    const k = 2 / (period + 1)
    return (close - prevEMA) * k + prevEMA
}

function calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50 // Not enough data
    
    // Simple RSI implementation
    let gains = 0
    let losses = 0
    
    // Calculate initial avg gain/loss
    for (let i = closes.length - period; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1]
        if (change >= 0) gains += change
        else losses -= change
    }
    
    if (losses === 0) return 100
    
    const rs = (gains / period) / (losses / period)
    return 100 - (100 / (1 + rs))
}

function calculateBollinger(closes: number[], period: number = 20, stdDev: number = 2) {
    const sma = calculateSMA(closes, period)
    if (closes.length < period) return { upper: 0, middle: 0, lower: 0 }

    const slice = closes.slice(-period)
    const squaredDiffs = slice.map(val => Math.pow(val - sma, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period
    const std = Math.sqrt(variance)
    
    return {
        middle: sma,
        upper: sma + (std * stdDev),
        lower: sma - (std * stdDev)
    }
}


export function runBacktest(candles: Candle[], config: StrategyConfig): BacktestResult {
  let balance = config.initialCapital
  let holdings = 0
  let equity = balance
  
  const trades: BacktestTrade[] = []
  const equityCurve: { time: number; value: number }[] = []
  const closePrices: number[] = []
  
  // -- CONSTANTS --
  const FEE_RATE = 0.001 // 0.1% Binance Fee
  const SLIPPAGE = config.type === "Momentum" ? 0.002 : 0 // 0.2% Slippage for Market orders on breakouts
  
  // -- STATE --
  let inPosition = false
  let entryPrice = 0
  let entryIndex = 0
  let emaShort = 0
  let emaLong = 0 // Not effectively used yet but placeholder

  // Iterate Candles
  // Start from suitable index to allow indicators to warm up
  const warmupParams = Math.max(config.shortPeriod || 20, config.rsiPeriod || 14) + 1
  
  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i]
    closePrices.push(candle.close)
    
    // Fill Equity Curve (Sample every step? efficient enough for <5000 points)
    equity = balance + (holdings * candle.close)
    equityCurve.push({ time: candle.time, value: equity })

    // Skip warmup
    if (i < warmupParams) continue;

    // --- STRATEGY: MOMENTUM SCALP (Bot Logic) ---
    if (config.type === "Momentum") {
        // 1. Update Indicators
        const prevEMA = emaShort // Use previous step's EMA for continuity
        emaShort = calculateEMA(closePrices, config.shortPeriod || 9, prevEMA)
        
        // 2. ENTRY Logic
        if (!inPosition) {
            // Logic: Close > EMA
            const isUptrend = candle.close > emaShort
            
            // Check Pullback (Prev 2 candles Red? Simplified: Close < Open)
            // Need historical access
            const prev1 = candles[i-1]
            const prev2 = candles[i-2]
            const isPullback = prev1.close < prev1.open // Simple 1-candle pullback check for MVP
            
            // Breakout Check: Current High > Prev High
            const isBreakout = candle.high > prev1.high
            
            if (isUptrend && isPullback && isBreakout) {
                // BUY
                const buyPrice = candle.close * (1 + SLIPPAGE) // Simulate slippage
                const cost = balance // All in
                const fee = cost * FEE_RATE
                const netCost = cost - fee
                
                holdings = netCost / buyPrice
                balance = 0
                inPosition = true
                entryPrice = buyPrice
                entryIndex = i
                
                trades.push({
                    id: i.toString(),
                    entryTime: candle.time,
                    side: "buy",
                    price: buyPrice,
                    quantity: holdings,
                    status: "open"
                })
            }
        } 
        
        // 3. EXIT Logic
        else if (inPosition) {
            const takeProfitPrice = entryPrice * 1.02 // 2% TP
            const stopLossPrice = candles[entryIndex].low // Stop at low of entry candle
            
            // Check if hit
            let exitPrice = 0
            let reason = ""
            
            if (candle.high >= takeProfitPrice) {
                exitPrice = takeProfitPrice
                reason = "TP"
            } else if (candle.low <= stopLossPrice) {
                exitPrice = stopLossPrice
                reason = "SL"
            } else if (candle.close < emaShort && i - entryIndex > 5) {
                // Exit on Trend Reversal (Close below EMA) after some grace period
                exitPrice = candle.close
                reason = "TrendRev"
            }
            
            if (exitPrice > 0) {
                // SELL
                const grossValue = holdings * exitPrice
                const fee = grossValue * FEE_RATE
                balance = grossValue - fee
                
                const lastTrade = trades[trades.length - 1]
                lastTrade.status = "closed"
                lastTrade.exitTime = candle.time
                lastTrade.pnl = balance - (lastTrade.quantity * entryPrice) // Approx PnL
                lastTrade.pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100
                
                holdings = 0
                inPosition = false
            }
        }
    }
    
    // --- STRATEGY: MEAN REVERSAL (Swing Logic) ---
    else if (config.type === "Grid") { // Re-using "Grid" tab as the Mean Reversal/Swing tab in engine mapping for now
        const rsi = calculateRSI(closePrices, config.rsiPeriod || 14)
        const bb = calculateBollinger(closePrices, 20, 2)
        
        // ENTRY: Oversold
        if (!inPosition) {
            if (rsi < (config.rsiLimit || 30) && candle.close < bb.lower) {
                // BUY
                const buyPrice = candle.close
                const cost = balance
                const fee = cost * FEE_RATE
                holdings = (cost - fee) / buyPrice
                balance = 0
                inPosition = true
                entryPrice = buyPrice
                
                 trades.push({
                    id: i.toString(),
                    entryTime: candle.time,
                    side: "buy",
                    price: buyPrice,
                    quantity: holdings,
                    status: "open"
                })
            }
        }
        
        // EXIT: Mean Reversion
        else if (inPosition) {
            if (rsi > 50 || candle.close >= bb.middle) {
                // SELL
                const exitPrice = candle.close
                const grossValue = holdings * exitPrice
                const fee = grossValue * FEE_RATE
                balance = grossValue - fee
                
                const lastTrade = trades[trades.length - 1]
                
                const tradeRevenue = grossValue - fee 
                // Initial cost was (EntryPrice * Holdings) / (1-Fee) approx.. simplifying:
                // Just use balance change
                const initialBalanceBeforeTrade = (lastTrade.quantity * lastTrade.price) / (1 - FEE_RATE)
                
                lastTrade.status = "closed"
                lastTrade.exitTime = candle.time
                lastTrade.pnl = balance - initialBalanceBeforeTrade
                lastTrade.pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100
                
                holdings = 0
                inPosition = false
            }
        }
    }
    
    // --- STRATEGY: DCA (Simple) ---
    else if (config.type === "DCA") {
        // Buy every X candles (Daily? 1h data -> 24 candles)
        const freq = 24 // Buy every 24 hours
        if (i % freq === 0 && balance >= config.buyAmount) {
             const cost = config.buyAmount
             const fee = cost * FEE_RATE
             const qty = (cost - fee) / candle.close
             
             balance -= cost
             holdings += qty
             
             trades.push({
                id: i.toString(),
                entryTime: candle.time,
                side: "buy",
                price: candle.close,
                quantity: qty,
                status: "closed"
             })
        }
    }
  }

  // Force close at end
  if (holdings > 0) {
      const lastPrice = candles[candles.length - 1].close
      balance += holdings * lastPrice
      holdings = 0
  }

  // --- METRICS ---
  const totalReturn = balance - config.initialCapital
  const totalReturnPercent = (totalReturn / config.initialCapital) * 100
  
  // Win Rate
  const completedStatsTrades = trades.filter(t => t.side === "buy" && t.status === "closed" && t.pnl !== undefined) // Momentum buys/sells are paired
  // Actually DCA doesn't have PnL per trade seamlessly..
  
  // For Momentum/Reversal:
  const winningTrades = completedStatsTrades.filter(t => (t.pnl || 0) > 0)
  const winRate = completedStatsTrades.length > 0 
      ? (winningTrades.length / completedStatsTrades.length) * 100 
      : 0
      
  const grossProfit = completedStatsTrades.reduce((acc, t) => acc + (t.pnl && t.pnl > 0 ? t.pnl : 0), 0)
  const grossLoss = completedStatsTrades.reduce((acc, t) => acc + (t.pnl && t.pnl < 0 ? Math.abs(t.pnl) : 0), 1) // Avoid div 0
  const profitFactor = grossProfit / grossLoss

  // Max Drawdown
  let peak = -Infinity
  let maxDd = 0
  equityCurve.forEach(p => {
      if (p.value > peak) peak = p.value
      const dd = (peak - p.value) / peak
      if (dd > maxDd) maxDd = dd
  })
  
  // Benchmark
  const initialPrice = candles[0].close
  const finalPrice = candles[candles.length - 1].close
  const benchmarkReturnPercent = ((finalPrice - initialPrice) / initialPrice) * 100
  const benchmarkReturn = config.initialCapital * (benchmarkReturnPercent / 100)

  return {
    totalReturn,
    totalReturnPercent,
    maxDrawdown: maxDd * 100,
    benchmarkReturn,
    benchmarkReturnPercent,
    winRate,
    trades,
    equityCurve
  }
}
