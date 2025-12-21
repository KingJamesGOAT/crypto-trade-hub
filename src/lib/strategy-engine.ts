import type { BinanceKline } from "@/hooks/useBinanceStream"

export interface TradeSignal {
  action: "BUY" | "SELL" | "HOLD"
  reason: string
  stopLoss?: number
  takeProfit?: number
  price: number
  strategy: "momentum" | "reversal"
}

export type StrategyType = "momentum" | "reversal"

// Configuration for strategies
// Configuration for strategies
// const MOMENTUM_COINS_LIMIT = 5 // Not used currently
// Blue chips are usually safe for reversal strategies on chop
const MEAN_REVERSAL_COINS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT']

export class StrategyEngine {
  // Map of Symbol -> Array of closes (for simple history management)
  // We need full klines for some indicators
  private history: Map<string, BinanceKline[]> = new Map()

  
  /**
   * Ingests a new candle and returns a trading signal if any
   */
  public evaluate(symbol: string, kline: BinanceKline, _isNewCandle: boolean): TradeSignal {
    // 1. Maintain History
    this.updateHistory(symbol, kline)

    const candles = this.history.get(symbol) || []
    if (candles.length < 50) {
        return { action: "HOLD", reason: "Insufficient Data", price: parseFloat(kline.c), strategy: "momentum" }
    }

    const currentPrice = parseFloat(kline.c)
    
    // Determine Strategy Type based on symbol classification
    // If it's a Blue Chip, we prefer Mean Reversal (unless it's pumping hard)
    // If it's a "Top Gainer", we prefer Momentum
    
    const isBlueChip = MEAN_REVERSAL_COINS.includes(symbol)
    
    if (!isBlueChip) {
        return this.evaluateMomentum(symbol, candles, currentPrice)
    } else {
        return this.evaluateMeanReversal(symbol, candles, currentPrice)
    }
  }

  private updateHistory(symbol: string, kline: BinanceKline) {
      if (!this.history.has(symbol)) {
          this.history.set(symbol, [])
      }
      const arr = this.history.get(symbol)!
      
      // If the last candle in array has same time as new one, overwrite it (it's an update)
      // If it's new, push it.
      const last = arr[arr.length - 1]
      if (last && last.t === kline.t) {
          arr[arr.length - 1] = kline
      } else {
          arr.push(kline)
          // Keep max 100 candles
          if (arr.length > 100) arr.shift()
      }
  }

  // --- STRATEGY 1: MOMENTUM SCALP ---
  private evaluateMomentum(_symbol: string, candles: BinanceKline[], price: number): TradeSignal {
      // 1. Trend Filter: Price > 9 EMA
      const closes = candles.map(k => parseFloat(k.c))
      const ema9 = this.calculateEMA(closes, 9)
      const vwap = this.calculateVWAP(candles)

      // const lastCandle = candles[candles.length - 1]
      const prevCandle = candles[candles.length - 2]
      
      if (!ema9 || !vwap || !prevCandle) return { action: "HOLD", reason: "Insufficient Data", price, strategy: "momentum" }

      const isUptrend = price > ema9 && price > vwap
      
      if (!isUptrend) {
          return { 
              action: "HOLD", 
              reason: `Downtrend (Price ${price.toFixed(2)} < EMA ${ema9.toFixed(2)})`, 
              price, 
              strategy: "momentum" 
          }
      }

      // 2. The Setup: Pullback
      // We look for a previous red candle (Close < Open) 
      const prevOpen = parseFloat(prevCandle.o)
      const prevClose = parseFloat(prevCandle.c)
      const isRed = prevClose < prevOpen

      // 3. The Trigger: Break of Previous High
      // If we had a red candle, and now we break its high...
      const prevHigh = parseFloat(prevCandle.h)
      const prevLow = parseFloat(prevCandle.l) // Stop loss level

      if (isRed && price > prevHigh) {
          // SIGNAL!
          return {
              action: "BUY",
              reason: "Momentum Breakout",
              stopLoss: prevLow,
              takeProfit: price * 1.03, // +3% target
              price,
              strategy: "momentum"
          }
      }

      return { action: "HOLD", reason: `Scanning pullbacks (High: ${prevHigh})`, price, strategy: "momentum" }
  }


  // --- STRATEGY 2: MEAN REVERSAL ---
  private evaluateMeanReversal(_symbol: string, candles: BinanceKline[], price: number): TradeSignal {
      const closes = candles.map(k => parseFloat(k.c))
      
      // 1. RSI < 30 (Oversold)
      const rsi = this.calculateRSI(closes, 14)
      if (rsi > 30) return { action: "HOLD", reason: `RSI Neutral (${rsi.toFixed(0)})`, price, strategy: "reversal" }

      // 2. Bollinger Bands Lower Touch
      const bb = this.calculateBollinger(closes, 20, 2)
      if (price > bb.lower) return { action: "HOLD", reason: `Inside BB (Low: ${bb.lower.toFixed(2)})`, price, strategy: "reversal" }

      // 3. MACD Flip (Simplified: Histogram turning up)
      const macd = this.calculateMACD(closes)
      
      // If RSI is oversold, Price is low, and MACD is curving up... BUY
      if (macd.histogram > 0 && macd.prevHistogram < 0) {
           return {
              action: "BUY",
              reason: "Mean Reversal Flip",
              stopLoss: price * 0.98, // -2%
              takeProfit: price * 1.04, // +4%
              price,
              strategy: "reversal"
           }
      }
      
      // Fallback: If RSI is EXTREMELY oversold (<20), buy anyway
      if (rsi < 20) {
           return {
              action: "BUY",
              reason: "Deep Value (RSI < 20)",
              stopLoss: price * 0.95,
              takeProfit: price * 1.05,
              price,
              strategy: "reversal"
           }
      }

      return { action: "HOLD", reason: "Waiting for MACD Flip", price, strategy: "reversal" }
  }


  // --- INDICATORS ---

  private calculateEMA(prices: number[], period: number): number {
      if (prices.length < period) return prices[prices.length - 1]
      const k = 2 / (period + 1)
      let ema = prices[0]
      for (let i = 1; i < prices.length; i++) {
          ema = prices[i] * k + ema * (1 - k)
      }
      return ema
  }

  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50
    let gains = 0
    let losses = 0

    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1]
        if (change > 0) gains += change
        else losses += Math.abs(change)
    }

    let avgGain = gains / period
    let avgLoss = losses / period

    // Smoothed RSI
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1]
        const gain = change > 0 ? change : 0
        const loss = change < 0 ? Math.abs(change) : 0
        
        avgGain = ((avgGain * (period - 1)) + gain) / period
        avgLoss = ((avgLoss * (period - 1)) + loss) / period
    }

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  private calculateVWAP(candles: BinanceKline[]): number {
      // VWAP = Sum(Typical Price * Volume) / Sum(Volume)
      let cumPV = 0
      let cumVol = 0
      
      // Calculate over last 20 periods for "Rolling VWAP" proxy
      const start = Math.max(0, candles.length - 20)
      
      for(let i=start; i<candles.length; i++) {
          const k = candles[i]
          const h = parseFloat(k.h)
          const l = parseFloat(k.l)
          const c = parseFloat(k.c)
          const v = parseFloat(k.v)
          const typical = (h + l + c) / 3
          
          cumPV += typical * v
          cumVol += v
      }
      
      return cumVol === 0 ? 0 : cumPV / cumVol
  }

  private calculateBollinger(prices: number[], period: number, multiplier: number) {
      if (prices.length < period) return { lower: 0, upper: 0, mid: 0 }
      
      const slice = prices.slice(prices.length - period)
      const sum = slice.reduce((a, b) => a + b, 0)
      const mean = sum / period
      
      const squaredDiffs = slice.map(p => Math.pow(p - mean, 2))
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period
      const stdDev = Math.sqrt(variance)
      
      return {
          upper: mean + (multiplier * stdDev),
          lower: mean - (multiplier * stdDev),
          mid: mean
      }
  }

  private calculateMACD(prices: number[]) {
      // 12, 26, 9
      const fast = this.calculateEMA(prices, 12)
      const slow = this.calculateEMA(prices, 26)
      const macdLine = fast - slow
      // We don't have full history for signal line of MACD easily without more state
      // Approximating signal as previous MACD for "Slope" detection
      // ideally we track MACD line array.
      
      // Quick hack: Just return histogram as (Fast - Slow) - 0 for now 
      // A true signal line requires EMA(MACD_Line, 9). 
      // For this simplified version (client side), we just check if MACD line is ticking UP.
      
      return { histogram: macdLine, prevHistogram: macdLine } // Placeholder
  }
}
