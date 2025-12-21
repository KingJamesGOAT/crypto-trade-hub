import { createContext, useContext, useEffect, useState, useRef } from "react"
import type { Portfolio, Trade } from "@/types/index"
import { binanceService } from "@/api/binance-service"
import { AVAILABLE_COINS } from "@/data/coins"
import { getSimplePrice } from "@/api/coingecko"

interface BotConfig {
  isActive: boolean
  totalAllocated: number
  strategies: {
    risky: number // Percentage 0-100
    moderate: number
    extreme: number
  }
}

interface PerformancePoint {
  timestamp: number
  totalValue: number
}

interface TradingContextType {
  portfolio: Portfolio
  mode: "simulator" | "real"
  botConfig: BotConfig
  performanceHistory: PerformancePoint[]
  updateBotConfig: (config: Partial<BotConfig>) => void
  addFunds: (amount: number) => void
  executeTrade: (coin: string, side: "buy" | "sell", amount: number, price: number, isQuantity: boolean) => Promise<{ success: boolean; message: string }>
  resetSimulator: () => void
  refreshData: () => Promise<void>
}

const TradingContext = createContext<TradingContextType | undefined>(undefined)

const INITIAL_CAPITAL = 10000

const DEFAULT_PORTFOLIO: Portfolio = {
  simulator: {
    initialCapital: INITIAL_CAPITAL,
    currentBalance: INITIAL_CAPITAL,
    totalInvested: 0,
    totalWithdrawn: 0,
  },
  holdings: {},
  trades: [],
}

const DEFAULT_BOT_CONFIG: BotConfig = {
  isActive: false,
  totalAllocated: 5000,
  strategies: {
    moderate: 60,
    risky: 30,
    extreme: 10
  }
}

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  // Mode State
  const [mode, setMode] = useState<"simulator" | "real">(() => {
     return (localStorage.getItem("trading_mode") as "simulator" | "real") || "simulator"
  })

  // Portfolio State
  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    const saved = localStorage.getItem("crypto_simulator_portfolio")
    return saved ? JSON.parse(saved) : DEFAULT_PORTFOLIO
  })

  // Bot State
  const [botConfig, setBotConfig] = useState<BotConfig>(() => {
    const saved = localStorage.getItem("crypto_simulator_bot_config")
    return saved ? JSON.parse(saved) : DEFAULT_BOT_CONFIG
  })

  const [performanceHistory, setPerformanceHistory] = useState<PerformancePoint[]>([])
  
  // --- ADD FUNDS ---
  const addFunds = (amount: number) => {
      setPortfolio(prev => ({
          ...prev,
          simulator: {
              ...prev.simulator,
              currentBalance: prev.simulator.currentBalance + amount,
              initialCapital: prev.simulator.initialCapital + amount // Treat as capital injection
          }
      }))
  }

  // Listen for mode changes from Settings page
  useEffect(() => {
     const handleStorageChange = () => {
         const newMode = (localStorage.getItem("trading_mode") as "simulator" | "real") || "simulator"
         setMode(newMode)
         if (newMode === "real") refreshData()
     }
     
     window.addEventListener('storage', handleStorageChange)
     
     const interval = setInterval(() => {
         const current = localStorage.getItem("trading_mode") as "simulator" | "real" || "simulator"
         if (current !== mode) {
             setMode(current)
             if (current === "real") refreshData()
         }
     }, 1000)

     return () => {
         window.removeEventListener('storage', handleStorageChange)
         clearInterval(interval)
     }
  }, [mode])

  // Save Portfolio & Bot Config
  useEffect(() => {
    localStorage.setItem("crypto_simulator_portfolio", JSON.stringify(portfolio))
  }, [portfolio])

  useEffect(() => {
    localStorage.setItem("crypto_simulator_bot_config", JSON.stringify(botConfig))
  }, [botConfig])


  const portfolioRef = useRef(portfolio)
  useEffect(() => {
      portfolioRef.current = portfolio
  }, [portfolio])

  // --- BOT ENGINE ---
  const botIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (botConfig.isActive && mode === "simulator") {
        if (!botIntervalRef.current) {
            // Run bot logic every 3 seconds
            botIntervalRef.current = setInterval(runBotCycle, 3000)
        }
    } else {
        if (botIntervalRef.current) {
            clearInterval(botIntervalRef.current)
            botIntervalRef.current = null
        }
    }
    return () => {
        if (botIntervalRef.current) clearInterval(botIntervalRef.current)
    }
  }, [botConfig.isActive, mode])

  // Performance Tracking
  useEffect(() => {
      const trackPerformance = () => {
          const currentPort = portfolioRef.current
          const holdingsValue = Object.values(currentPort.holdings).reduce((acc, output) => {
             return acc + (output.quantity * output.currentPrice)
          }, 0)
          
          const totalValue = currentPort.simulator.currentBalance + holdingsValue
          
          setPerformanceHistory(prev => {
              const newHistory = [...prev, { timestamp: Date.now(), totalValue }]
              if (newHistory.length > 500) return newHistory.slice(newHistory.length - 500)
              return newHistory
          })
      }
      
      const perfInterval = setInterval(trackPerformance, 5000)
      return () => clearInterval(perfInterval)
  }, []) // Empty dependency, uses ref


  const runBotCycle = async () => {
      const currentPort = portfolioRef.current
      
      // 1. Fetch Prices
      const ids = AVAILABLE_COINS.map(c => c.id)
      const prices = await getSimplePrice(ids)
      if (!prices) return

      // Decision Phase
      const totalAllocated = botConfig.totalAllocated
      
      // Calculate how much the bot has currently invested (approximate cost basis for limit check)
      // Ideally we track "Allocated Funds Used", but for now we can sum up Cost Basis of active holdings.
      const holdingsArr = Object.values(currentPort.holdings).filter(h => h.quantity > 0)
      const currentInvestedCost = holdingsArr.reduce((acc, h) => acc + (h.quantity * h.averageEntryPrice), 0)
      
      const availableToBuy = totalAllocated - currentInvestedCost
      
      const canBuy = availableToBuy > 10 // Minimum 10 CHF to trade
      const canSell = holdingsArr.length > 0
      
      if (!canBuy && !canSell) return 

      // 2. Intelligent Pacing & Logic
      // The user wants "logic and maths", not just random buying.
      
      // A. Reduced Action Probability (Slower Pacing)
      // Was 0.8 (too aggressive), now 0.3 (more patient)
      const rand = Math.random()
      // Only act 30% of the time
      if (rand > 0.3) { 
          // 70% of the time, just update prices and hold
          setPortfolio(prev => {
              const next = { ...prev }
              Object.keys(next.holdings).forEach(symbol => {
                 const coinDef = AVAILABLE_COINS.find(c => c.symbol === symbol)
                 if (coinDef && prices[coinDef.id]) {
                     next.holdings[symbol].currentPrice = prices[coinDef.id].usd
                 }
              })
              return next
          })
          return
      }

      // B. Determine Action Phase
      // If we have "Available to Buy", we lean towards buying, but selectively.
      // If we are fully invested, we look for profit taking.
      
      let action: "buy" | "sell" = "buy"

      if (canBuy && canSell) {
          // If we have both cash and coins, balance logic.
          // If available > 20% of total allocated, lean Buy.
          // If available is low, lean Sell.
          const utilizationRate = currentInvestedCost / totalAllocated
          if (utilizationRate < 0.5) action = "buy" 
          else if (utilizationRate > 0.9) action = "sell"
          else action = Math.random() > 0.5 ? "buy" : "sell"
      } else if (canBuy) {
         action = "buy"
      } else {
         action = "sell"
      }

      if (action === "buy") {
          const strategyRoll = Math.random() * 100
          let category = "moderate"
          if (strategyRoll < botConfig.strategies.extreme) category = "extreme"
          else if (strategyRoll < botConfig.strategies.extreme + botConfig.strategies.risky) category = "risky"
          
          const candidates = AVAILABLE_COINS.filter(c => c.category === category)
          // Smart Selection: Prefer coins that haven't pumped too hard (Buy Dips)
          // We look for 24h change. If > +5%, avoid (FOMO protection).
          // If < -5%, good dip buy potential.
          
          const smartCandidates = candidates.filter(c => {
             const pData = prices[c.id]
             if (!pData) return false
             const change = pData.usd_24h_change || 0
             return change < 5 // Avoid buying tops > 5% pump
          })
          
          const pool = smartCandidates.length > 0 ? smartCandidates : candidates
          const coinToBuy = pool[Math.floor(Math.random() * pool.length)]

          if (!coinToBuy || !prices[coinToBuy.id]) return

          // C. Slower Deployment (DCA)
          // Instead of 5-20% chunks, use 1-3% chunks. 
          // This makes the bot build positions slowly over time ("don't buy at exact second")
          const allocatePct = 0.01 + (Math.random() * 0.02) 
          let amount = availableToBuy * allocatePct
          
          // Minimum trade size constraint (e.g. 10 CHF)
          if (amount < 10) amount = 10 
          
          // Clamp to actual wallet balance 
          if (amount > currentPort.simulator.currentBalance) amount = currentPort.simulator.currentBalance
          if (amount > availableToBuy) amount = availableToBuy // Hard Cap enforcement

          if (amount < 10) return 
          
          await executeTrade(coinToBuy.symbol, "buy", amount, prices[coinToBuy.id].usd, false)
      } 
      else if (action === "sell") {
          const holding = holdingsArr[Math.floor(Math.random() * holdingsArr.length)]
          const coinDef = AVAILABLE_COINS.find(c => c.symbol === holding.coin)
          if (!coinDef || !prices[coinDef.id]) return

          const currentPrice = prices[coinDef.id].usd
          const pnlPercent = ((currentPrice - holding.averageEntryPrice) / holding.averageEntryPrice) * 100
          
          let shouldSell = false
          // Logic: Take Profit or Stop Loss
          if (pnlPercent > 8) shouldSell = true // Take profit at +8%
          if (pnlPercent < -10) shouldSell = true // Stop loss at -10%
          
          // Random partial sells if we need liquidity
          if (!shouldSell && Math.random() > 0.8) shouldSell = true

          if (shouldSell) {
             const sellPct = 0.25 + (Math.random() * 0.50) // Sell 25-75% of position
             const qty = holding.quantity * sellPct
             await executeTrade(holding.coin, "sell", qty, currentPrice, true)
          }
      }
  }


  const refreshData = async () => {
     if (mode === "real") {
         try {
             const balances = await binanceService.getAccountBalance()
             setPortfolio(prev => {
                 const newPort = { ...prev }
                 const usdt = balances.find(b => b.asset === "USDT")
                 if (usdt) newPort.simulator.currentBalance = usdt.free 

                 balances.forEach(b => {
                     if (b.asset !== "USDT" && parseFloat(b.free as any) > 0) {
                         const qty = parseFloat(b.free as any)
                         if (!newPort.holdings[b.asset]) {
                             newPort.holdings[b.asset] = {
                                 coin: b.asset,
                                 quantity: qty,
                                 averageEntryPrice: 0,
                                 currentPrice: 0,
                                 unrealizedPnL: 0,
                                 unrealizedPnLPercent: 0
                             }
                         } else {
                             newPort.holdings[b.asset].quantity = qty
                         }
                     }
                 })
                 return newPort
             })
         } catch (e) {
             console.error("Failed to fetch real data", e)
         }
     }
  }

  const executeTrade = async (coin: string, side: "buy" | "sell", amount: number, price: number, isQuantity: boolean) => {
    // Updates rely on setPortfolio(prev => ...) so they are concurrency-safe.
    // However, validation needs current state.
    const currentPort = portfolioRef.current // USE FRESH STATE FOR VALIDATION

    if (mode === "real") {
         // ... real logic ...
         try {
             let quantity = 0
             if (isQuantity) quantity = amount
             else quantity = amount / price
             await binanceService.placeOrder(coin, side, quantity, price)
             await refreshData()
             return { success: true, message: `REAL TRADE: ${side.toUpperCase()} ${coin} Filled` }
         } catch (e) {
             return { success: false, message: "Real Trade Failed: " + (e as Error).message }
         }
    }

    let quantity = 0
    let totalCost = 0

    if (isQuantity) {
      quantity = amount
      totalCost = amount * price
    } else {
      totalCost = amount
      quantity = amount / price
    }

    const fee = totalCost * 0.001
    const totalCostWithFee = totalCost + fee
    const totalProceedsAfterFee = totalCost - fee

    // Validation using FRESH REF
    if (side === "buy") {
      if (currentPort.simulator.currentBalance < totalCostWithFee) {
        return { success: false, message: "Insufficient CHF balance" }
      }
    } else {
      const currentHolding = currentPort.holdings[coin]?.quantity || 0
      if (currentHolding < quantity) {
        return { success: false, message: "Insufficient coin balance" }
      }
    }

    setPortfolio((prev) => {
      const newPortfolio = { ...prev }
      const timestamp = Date.now()
      
      if (side === "buy") {
        newPortfolio.simulator.currentBalance -= totalCostWithFee
        newPortfolio.simulator.totalInvested += totalCostWithFee
      } else {
        newPortfolio.simulator.currentBalance += totalProceedsAfterFee
        newPortfolio.simulator.totalWithdrawn += totalProceedsAfterFee
      }

      const existing = newPortfolio.holdings[coin] || { 
        coin, 
        quantity: 0, 
        averageEntryPrice: 0, 
        currentPrice: price, 
        unrealizedPnL: 0, 
        unrealizedPnLPercent: 0 
      }

      if (side === "buy") {
        const totalOldCost = existing.quantity * existing.averageEntryPrice
        const newQuantity = existing.quantity + quantity
        existing.averageEntryPrice = (totalOldCost + totalCost) / newQuantity
        existing.quantity = newQuantity
      } else {
        existing.quantity -= quantity
        if (existing.quantity <= 0.0000001) {
             delete newPortfolio.holdings[coin]
        }
      }
      
      // Update map if it exists, or set it if new
      if (existing.quantity > 0) {
         newPortfolio.holdings[coin] = existing
      } else {
         delete newPortfolio.holdings[coin]
      }

      const trade: Trade = {
        id: crypto.randomUUID(),
        timestamp,
        type: "simulator",
        coin,
        side,
        entryPrice: price,
        quantity,
        totalValue: totalCost,
        fee,
        status: "closed",
      }

      newPortfolio.trades = [trade, ...newPortfolio.trades]
      return newPortfolio
    })

    return { success: true, message: `Successfully ${side === "buy" ? "bought" : "sold"} ${coin}` }
  }

  const resetSimulator = () => {
    setPortfolio(DEFAULT_PORTFOLIO)
    setPerformanceHistory([])
  }

  const updateBotConfig = (config: Partial<BotConfig>) => {
      setBotConfig(prev => ({ ...prev, ...config }))
  }

  return (
    <TradingContext.Provider value={{ 
        portfolio, 
        mode, 
        botConfig,
        performanceHistory,
        executeTrade, 
        resetSimulator, 
        refreshData,
        updateBotConfig,
        addFunds
    }}>
      {children}
    </TradingContext.Provider>
  )
}

export function useSimulator() {
  const context = useContext(TradingContext)
  if (context === undefined) {
    throw new Error("useSimulator must be used within a SimulatorProvider")
  }
  return context
}
