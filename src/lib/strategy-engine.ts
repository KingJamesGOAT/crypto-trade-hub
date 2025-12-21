import type { BinanceKline } from "@/hooks/useBinanceStream"
import { calculateADX, calculateATR, calculateKellySize, type OHLC } from "@/lib/utils"

export interface TradeSignal {
  action: "BUY" | "SELL" | "HOLD"
  reason: string
  stopLoss?: number
  takeProfit?: number
  price: number
  strategy: "momentum" | "grid"
  orderType?: "MARKET" | "LIMIT"
  sizePercent?: number // For Kelly Criterion or Layering
}

interface ActiveOrder {
    id: string
    type: "BUY_LIMIT" | "STOP_LOSS"
    price: number
    size: number
}

export class StrategyEngine {
  private history: Map<string, BinanceKline[]> = new Map()
  private activeOrders: Map<string, ActiveOrder[]> = new Map() // Symbol -> Orders

  /**
   * Main Evaluation Loop (Tick/Candle Update)
   */
  public evaluate(symbol: string, kline: BinanceKline, _isNewCandle: boolean, sentimentMode: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL"): TradeSignal {
    // 1. Maintain History
    this.updateHistory(symbol, kline)
    const candles = this.history.get(symbol) || []
    if (candles.length < 50) return { action: "HOLD", reason: "Gathering Data", price: parseFloat(kline.c), strategy: "momentum" }

    const price = parseFloat(kline.c)
    
    // 2. CHECK GHOST ORDERS (Client-side Limit Orders)
    const ghostSignal = this.checkGhostOrders(symbol, kline)
    if (ghostSignal) return ghostSignal

    // 3. REGIME DETECTION (The "Quant" Filter)
    const ohlc = this.mapToOHLC(candles)
    const adx = calculateADX(ohlc, 14) // Trend Strength
    const isTrending = adx > 25

    // 4. ROUTE STRATEGY
    if (isTrending) {
        return this.evaluateSmartMomentum(symbol, candles, price, sentimentMode)
    } else {
        return this.evaluateDynamicGrid(symbol, candles, price, sentimentMode)
    }
  }

  // --- SUB-STRATEGIES ---

  /**
   * Strategy A: Smart Momentum (Liquidation Sniper)
   * Active when ADX > 25 (Trending)
   */
  private evaluateSmartMomentum(_symbol: string, candles: BinanceKline[], price: number, sentiment: "BULLISH" | "BEARISH" | "NEUTRAL"): TradeSignal {
      // 0. SENTIMENT CHECK (Fundamental Layer)
      if (sentiment === "BEARISH") {
          return { action: "HOLD", reason: "News Sentiment BEARISH (Defensive Mode)", price, strategy: "momentum" }
      }

      const closes = candles.map(k => parseFloat(k.c))
      const highs = candles.map(k => parseFloat(k.h))
      const volumes = candles.map(k => parseFloat(k.v))
      
      // 1. Volume Confirmation: Current Vol > 2.0 * avg vol
      const avgVol = volumes.slice(-20).reduce((a,b) => a+b, 0) / 20
      const currentVol = volumes[volumes.length - 1]
      const isHighVolume = currentVol > (avgVol * 2.0)

      // 2. Donchian Breakout: Price > Highest High of last 20
      const highestHigh = Math.max(...highs.slice(-21, -1)) // Exclude current
      const isBreakout = price > highestHigh

      // 3. Volatility Expansion (ATR Rising)
      const ohlc = this.mapToOHLC(candles)
      const atr = calculateATR(ohlc, 14)
      const prevAtr = calculateATR(ohlc.slice(0, -1), 14) // Rough check

      if (isHighVolume && isBreakout && atr > prevAtr) {
          // KELLY SIZING
          const winRate = 0.55 // Default conservative estimate
          const rr = 2.0 // Targeting big moves
          const size = calculateKellySize(winRate, rr)

          if (size <= 0) return { action: "HOLD", reason: `Kelly Low (${size})`, price, strategy: "momentum" }

          // TRAILING STOP: 20 EMA normally
          // If Sentiment is Neutral/Mixed, maybe look for tighter stop?
          // For now, Stick to 20 EMA.
          const ema20 = this.calculateEMA(closes, 20)

          return {
              action: "BUY",
              reason: "Smart Momentum Breakout",
              stopLoss: ema20, // Trailing stop
              takeProfit: undefined, // Let winners run
              price,
              strategy: "momentum",
              sizePercent: size
          }
      }

      return { action: "HOLD", reason: "Scanning Momentum...", price, strategy: "momentum" }
  }

  /**
   * Strategy B: Dynamic Grid (Mean Reversion)
   * Active when ADX < 25 (Ranging)
   */
  private evaluateDynamicGrid(symbol: string, candles: BinanceKline[], price: number, sentiment: "BULLISH" | "BEARISH" | "NEUTRAL"): TradeSignal {
      const closes = candles.map(k => parseFloat(k.c))
      const rsi = this.calculateRSI(closes, 14)
      const bb = this.calculateBollinger(closes, 20, 2)

      // EXIT LOGIC: Close all layers if RSI > 50 or Price > Upper BB
      if (rsi > 50 || price >= bb.upper) {
          return { action: "SELL", reason: "Grid Take Profit (RSI > 50)", price, strategy: "grid" }
      }

      // ENTRY LOGIC: Oversold
      // SENTIMENT ADJUSTMENT:
      // Bullish: RSI < 40 (Aggressive)
      // Bearish: RSI < 20 (Defensive)
      // Neutral: RSI < 30
      
      let rsiThreshold = 30
      if (sentiment === "BULLISH") rsiThreshold = 40
      if (sentiment === "BEARISH") rsiThreshold = 20

      if (rsi < rsiThreshold && price < bb.lower) {
           // We initiate the Grid. 
           // In a real grid, we place 3 limit orders. 
           // Since we can only send one actions 'BUY', we buy Layer 1 now, 
           // and register Layer 2 & 3 as Ghost Orders.
           
           this.registerGhostOrder(symbol, price * 0.985, 0.30) // -1.5%
           this.registerGhostOrder(symbol, price * 0.970, 0.40) // -3.0%
           
           return {
               action: "BUY",
               reason: `Grid Layer 1 (RSI < ${rsiThreshold} [${sentiment}])`,
               price,
               strategy: "grid",
               sizePercent: 0.30 // 30% of capital assigned to this trade
           }
      }

      return { action: "HOLD", reason: `Grid Scanning (RSI ${rsi.toFixed(0)})`, price, strategy: "grid" }
  }

  // --- GHOST ORDER SYSTEM ---

  private registerGhostOrder(symbol: string, targetPrice: number, size: number) {
      if (!this.activeOrders.has(symbol)) this.activeOrders.set(symbol, [])
      
      const orders = this.activeOrders.get(symbol)!
      // Avoid duplicate levels close to each other
      const exists = orders.some(o => Math.abs(o.price - targetPrice) / targetPrice < 0.005)
      
      if (!exists) {
          orders.push({
              id: Date.now().toString() + Math.random(),
              type: "BUY_LIMIT",
              price: targetPrice,
              size
          })
          console.log(`[Ghost] Registered Layer at ${targetPrice}`)
      }
  }

  private checkGhostOrders(symbol: string, kline: BinanceKline): TradeSignal | null {
      const orders = this.activeOrders.get(symbol)
      if (!orders || orders.length === 0) return null

      const low = parseFloat(kline.l)
      // const high = parseFloat(kline.h)

      // CHECK BUY LIMITS
      // If candle Low went below our Limit Price, we filled!
      const filledIndex = orders.findIndex(o => o.type === "BUY_LIMIT" && low <= o.price)
      
      if (filledIndex !== -1) {
          const order = orders[filledIndex]
          // Remove it
          orders.splice(filledIndex, 1)
          
          return {
              action: "BUY",
              reason: `Grid Layer Filled @ ${order.price}`,
              price: order.price, // We assume filled at limit price
              strategy: "grid",
              sizePercent: order.size
          }
      }

      return null
  }


  // --- HELPERS ---

  private updateHistory(symbol: string, kline: BinanceKline) {
      if (!this.history.has(symbol)) this.history.set(symbol, [])
      const arr = this.history.get(symbol)!
      
      const last = arr[arr.length - 1]
      if (last && last.t === kline.t) {
          arr[arr.length - 1] = kline
      } else {
          arr.push(kline)
          if (arr.length > 200) arr.shift() // Keep more history for ADX
      }
  }

  private mapToOHLC(candles: BinanceKline[]): OHLC[] {
      return candles.map(c => ({
          high: parseFloat(c.h),
          low: parseFloat(c.l),
          close: parseFloat(c.c)
      }))
  }

  // (Existing Indicators Copied/Maintained for internal use if needed, 
  // though we could move them to utils too to keep it clean. 
  // keeping simple ones here for now to avoid breaking too much refactor at once)
  
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
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1]
        const gain = change > 0 ? change : 0
        const loss = change < 0 ? Math.abs(change) : 0
        avgGain = ((avgGain * (period - 1)) + gain) / period
        avgLoss = ((avgLoss * (period - 1)) + loss) / period
    }
    return avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss))
  }

  private calculateBollinger(prices: number[], period: number, multiplier: number) {
      if (prices.length < period) return { lower: 0, upper: 0, mid: 0 }
      const slice = prices.slice(prices.length - period)
      const mean = slice.reduce((a, b) => a + b, 0) / period
      const variance = slice.map(p => Math.pow(p - mean, 2)).reduce((a, b) => a + b, 0) / period
      const stdDev = Math.sqrt(variance)
      return {
          upper: mean + (multiplier * stdDev),
          lower: mean - (multiplier * stdDev),
          mid: mean
      }
  }
}
