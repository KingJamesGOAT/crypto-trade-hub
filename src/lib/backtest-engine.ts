import type { BacktestResult, Candle, StrategyConfig, BacktestTrade } from "@/types/backtest"

// Helper to calculate simple moving average
function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return 0
  const slice = data.slice(-period)
  const sum = slice.reduce((a, b) => a + b, 0)
  return sum / period
}

export function runBacktest(candles: Candle[], config: StrategyConfig): BacktestResult {
  let balance = config.initialCapital
  let holdings = 0
  const trades: BacktestTrade[] = []
  const equityCurve: { time: number; value: number }[] = []
  
  // Strategy Specific State
  // Momentum
  const closePrices: number[] = []
  let momentumPosition: "none" | "long" = "none"

  // Grid
  // Simple Grid: buy orders at levels below price, sell orders above
  // In this simplified engine, we just check if price crossed level
  // const activeGridOrders: { price: number; type: "buy" | "sell" }[] = []

  // Iterate Candles
  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i]
    const currentPrice = candle.close
    closePrices.push(currentPrice)

    // --- STRATEGY LOGIC ---

    if (config.type === "DCA") {
      // Simple daily check (assuming 5 min data, 288 candles/day)
      if (i % 288 === 0) {
         const cost = config.buyAmount
         if (balance >= cost) {
            const quantity = cost / currentPrice
            balance -= cost
            holdings += quantity
            // totalInvested += cost

            trades.push({
               id: crypto.randomUUID(),
               entryTime: candle.time,
               side: "buy",
               price: currentPrice,
               quantity,
               status: "closed" // DCA "buys" are just accumulation
            })
         }
      }
    }

    else if (config.type === "Momentum") {
       const shortSMA = calculateSMA(closePrices, config.shortPeriod)
       const longSMA = calculateSMA(closePrices, config.longPeriod)

       if (shortSMA > 0 && longSMA > 0) {
          // Buy Signal: Short crosses above Long
          if (shortSMA > longSMA && momentumPosition === "none") {
             const quantity = balance / currentPrice
             if (quantity > 0) {
                balance = 0
                holdings = quantity
                momentumPosition = "long"
                trades.push({
                   id: crypto.randomUUID(),
                   entryTime: candle.time,
                   side: "buy",
                   price: currentPrice,
                   quantity,
                   status: "open"
                })
             }
          }
          // Sell Signal: Short crosses below Long
          else if (shortSMA < longSMA && momentumPosition === "long") {
             const value = holdings * currentPrice
             const lastTrade = trades.filter(t => t.status === "open")[0]
             if (lastTrade) {
                 lastTrade.status = "closed"
                 lastTrade.exitTime = candle.time
                 lastTrade.pnl = value - (lastTrade.quantity * lastTrade.price)
                 lastTrade.pnlPercent = (lastTrade.pnl / (lastTrade.quantity * lastTrade.price)) * 100
             }
             
             trades.push({
                 id: crypto.randomUUID(),
                 entryTime: candle.time,
                 side: "sell",
                 price: currentPrice,
                 quantity: holdings,
                 status: "closed"
             })

             balance = value
             holdings = 0
             momentumPosition = "none"
          }
       }
    }

    else if (config.type === "Grid") {
      // Simplified Grid: buy if price < lower, sell if price > higher?
      // Real grid is complex state. 
      // MVP: Simply simulating rebalancing within range.
      // If price drops X%, buy. If price rises X%, sell.
      
      // const gridStep = (config.upperBound - config.lowerBound) / config.grids
      // Check if we crossed a grid line
      // ... (Grid logic is complex for MVP, putting placeholder simple logic)
      
      // FALLBACK: Simple Rebalance Grid
      // Keep 50% Asset / 50% Cash. Rebalance if deviation > 1%
      const totalPortfolioValue = balance + (holdings * currentPrice)
      const targetHoldingValue = totalPortfolioValue * 0.5
      const currentHoldingValue = holdings * currentPrice
      const diff = currentHoldingValue - targetHoldingValue

      if (diff > totalPortfolioValue * 0.02) { // Sell 2% deviation
          const sellAmount = diff
          const qty = sellAmount / currentPrice
          holdings -= qty
          balance += sellAmount
          trades.push({ id: crypto.randomUUID(), entryTime: candle.time, side: "sell", price: currentPrice, quantity: qty, status: "closed" })
      } else if (diff < -totalPortfolioValue * 0.02) { // Buy
          const buyAmount = -diff
          if (balance >= buyAmount) {
             const qty = buyAmount / currentPrice
             holdings += qty
             balance -= buyAmount
             trades.push({ id: crypto.randomUUID(), entryTime: candle.time, side: "buy", price: currentPrice, quantity: qty, status: "closed" })
          }
      }
    }

    // --- TRACKING ---
    const equity = balance + (holdings * currentPrice)
    // Downsample for chart (every day or every 4 hours)
    if (i % 48 === 0) { // Every 4 hours approx
       equityCurve.push({ time: candle.time, value: equity })
    }
  }

  // Close open positions at end
  if (holdings > 0) {
      const lastPrice = candles[candles.length - 1].close
      balance += holdings * lastPrice
      holdings = 0
  }

  const finalEquity = balance
  const totalReturn = finalEquity - config.initialCapital
  const totalReturnPercent = (totalReturn / config.initialCapital) * 100

  // Calculate Max Drawdown
  let peak = -Infinity
  let maxDrawdown = 0
  equityCurve.forEach(p => {
      if (p.value > peak) peak = p.value
      const dd = (peak - p.value) / peak
      if (dd > maxDrawdown) maxDrawdown = dd
  })

  // Benchmark: Buy & Hold
  const initialPrice = candles[0].close
  const finalPrice = candles[candles.length - 1].close
  const benchmarkReturnPercent = ((finalPrice - initialPrice) / initialPrice) * 100
  const benchmarkReturn = (config.initialCapital * (benchmarkReturnPercent / 100))

  return {
    totalReturn,
    totalReturnPercent,
    maxDrawdown: maxDrawdown * 100, // as percent
    benchmarkReturn,
    benchmarkReturnPercent,
    winRate: 0, // TODO: Calc from trades
    trades,
    equityCurve
  }
}
