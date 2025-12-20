import type { Candle } from "@/types/backtest"

export type MarketTrend = "bull" | "bear" | "range" | "volatile"

export function generateHistoricalData(days: number, trend: MarketTrend, startPrice = 50000): Candle[] {
  const candles: Candle[] = []
  let currentPrice = startPrice
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000
  // 5 minute intervals
  const totalCandles = (days * 24 * 60) / 5 

  for (let i = 0; i < totalCandles; i++) {
    const time = startTime + i * 5 * 60 * 1000
    
    // Random walk factors based on trend
    let change = (Math.random() - 0.5) * 0.002 // Base volatility 0.2%
    
    if (trend === "bull") change += 0.0001 // Slight upward drift
    if (trend === "bear") change -= 0.0001 // Slight downward drift
    
    // In range, push back if deviating too far
    if (trend === "range") {
      const deviation = (currentPrice - startPrice) / startPrice
      if (deviation > 0.1) change -= 0.0005
      if (deviation < -0.1) change += 0.0005
    }

    // High volatility multiplier
    if (trend === "volatile") change *= 3

    const open = currentPrice
    const close = currentPrice * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.001)
    const low = Math.min(open, close) * (1 - Math.random() * 0.001)
    const volume = Math.random() * 100 + 10

    currentPrice = close

    candles.push({ time, open, high, low, close, volume })
  }

  return candles
}
