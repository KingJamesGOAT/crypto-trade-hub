import { createContext, useContext, useEffect, useState } from "react"
import type { Portfolio, Trade } from "@/types/index"
import { binanceService } from "@/api/binance-service"

interface TradingContextType {
  portfolio: Portfolio
  mode: "simulator" | "real"
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

  // Listen for mode changes from Settings page
  useEffect(() => {
     const handleStorageChange = () => {
         const newMode = (localStorage.getItem("trading_mode") as "simulator" | "real") || "simulator"
         setMode(newMode)
         if (newMode === "real") refreshData()
     }
     
     // Storage event only fires for other windows, so we need a custom event or just poll/dependency
     // For this simple app, we can just rely on re-renders or window events if we want strict sync
     window.addEventListener('storage', handleStorageChange)
     
     // Custom event dispatcher from Settings could be better, but we'll stick to simple effect
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

  useEffect(() => {
    localStorage.setItem("crypto_simulator_portfolio", JSON.stringify(portfolio))
  }, [portfolio])

  const refreshData = async () => {
     if (mode === "real") {
         try {
             const balances = await binanceService.getAccountBalance()
             // Map binance balances to our Portfolio structure
             setPortfolio(prev => {
                 const newPort = { ...prev }
                 
                 // Update USDT Balance
                 const usdt = balances.find(b => b.asset === "USDT")
                 if (usdt) newPort.simulator.currentBalance = usdt.free // Hijacking simulator field for display simplicity

                 // Update Holdings (simplified sync)
                 balances.forEach(b => {
                     if (b.asset !== "USDT" && parseFloat(b.free as any) > 0) {
                         // We don't know entry price from simple balance fetch, so we keep existing or 0
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
    if (mode === "real") {
        // Execute Real Trade
        try {
            // Convert amount/cost to quantity if needed
             let quantity = 0
             if (isQuantity) {
                 quantity = amount
             } else {
                 quantity = amount / price
             }

            await binanceService.placeOrder(coin, side, quantity, price)
            
            // Optimistic update or refresh
            await refreshData()
            
            return { success: true, message: `REAL TRADE: ${side.toUpperCase()} ${coin} Filled` }
        } catch (e) {
            return { success: false, message: "Real Trade Failed: " + (e as Error).message }
        }
    }

    // SIMULATOR LOGIC
    // 1. Calculate Quantity and Total Cost
    let quantity = 0
    let totalCost = 0

    if (isQuantity) {
      quantity = amount
      totalCost = amount * price
    } else {
      totalCost = amount
      quantity = amount / price
    }

    // 2. Fees (0.1%)
    const fee = totalCost * 0.001
    const totalCostWithFee = totalCost + fee
    const totalProceedsAfterFee = totalCost - fee

    // 3. Validation
    if (side === "buy") {
      if (portfolio.simulator.currentBalance < totalCostWithFee) {
        return { success: false, message: "Insufficient CHF balance" }
      }
    } else {
      const currentHolding = portfolio.holdings[coin]?.quantity || 0
      if (currentHolding < quantity) {
        return { success: false, message: "Insufficient coin balance" }
      }
    }

    // 4. Execute Update
    setPortfolio((prev) => {
      const newPortfolio = { ...prev }
      const timestamp = Date.now()
      
      // Update Balance
      if (side === "buy") {
        newPortfolio.simulator.currentBalance -= totalCostWithFee
        newPortfolio.simulator.totalInvested += totalCostWithFee
      } else {
        newPortfolio.simulator.currentBalance += totalProceedsAfterFee
        newPortfolio.simulator.totalWithdrawn += totalProceedsAfterFee
      }

      // Update Holdings
      const existing = newPortfolio.holdings[coin] || { 
        coin, 
        quantity: 0, 
        averageEntryPrice: 0, 
        currentPrice: price, 
        unrealizedPnL: 0, 
        unrealizedPnLPercent: 0 
      }

      if (side === "buy") {
        // Weighted Average Entry Price
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
      
      if (newPortfolio.holdings[coin]) {
         newPortfolio.holdings[coin] = existing
      }

      // Add Trade
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
        status: "closed", // Instant setttlement in simulator
      }

      newPortfolio.trades = [trade, ...newPortfolio.trades]

      return newPortfolio
    })

    return { success: true, message: `Successfully ${side === "buy" ? "bought" : "sold"} ${coin}` }
  }

  const resetSimulator = () => {
    setPortfolio(DEFAULT_PORTFOLIO)
  }

  return (
    <TradingContext.Provider value={{ portfolio, mode, executeTrade, resetSimulator, refreshData }}>
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
