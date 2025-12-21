import { createContext, useContext, useEffect, useState, useRef } from "react"
import type { Portfolio, Trade } from "@/types/index"
import { binanceService } from "@/api/binance-service"
// import { AVAILABLE_COINS } from "@/data/coins"
import { getTopCandidates } from "@/api/market-scanner"
import { useBinanceStream } from "@/hooks/useBinanceStream"
import { StrategyEngine, type TradeSignal } from "@/lib/strategy-engine"

interface BotConfig {
  isActive: boolean
  totalAllocated: number
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
  activeSymbols: string[]
  botStatus: string
  isConnected: boolean
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
  totalAllocated: 5000
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
  
  // Market Scanner & Data State
  const [activeSymbols, setActiveSymbols] = useState<string[]>([])
  const { streamData, isConnected } = useBinanceStream(activeSymbols)
  const [botStatus, setBotStatus] = useState<string>("Idle")
  
  // Strategy Engine Ref (Singleton per session)
  const strategyEngine = useRef(new StrategyEngine())
  
  // Pending Orders (Ghost Orders) - Map<Symbol, { side, price, amount, type: 'limit' | 'stop' }>
  // For this v2 spec, user mentioned "Ghost Orders" for limit orders.
  // We can implement a simple array for now.
  // const pendingOrders = useRef<any[]>([])

  // Refs for access inside callbacks/effects
  const portfolioRef = useRef(portfolio)
  useEffect(() => { portfolioRef.current = portfolio }, [portfolio])
  
  const botConfigRef = useRef(botConfig)
  useEffect(() => { botConfigRef.current = botConfig }, [botConfig])


  // --- 1. MARKET SCANNER LOOP ---
  useEffect(() => {
      // Basic initialization of symbols
      const initScanner = async () => {
          setBotStatus("Scanning Market for Opportunities...")
          console.log("Running Market Scanner...")
          const candidates = await getTopCandidates()
          setActiveSymbols(candidates)
          setBotStatus(`Monitoring ${candidates.length} Assets`)
      }

      initScanner()

      // Run scanner every 60 seconds
      const interval = setInterval(initScanner, 60000)
      return () => clearInterval(interval)
  }, [])


  // --- 2. DATA INGESTION & STRATEGY EXECUTION ---
  useEffect(() => {
      if (!streamData) return
      
      const { kline, trade } = streamData
      
      // Update Real-time Prices in Portfolio
      if (trade) {
          const currentPrice = parseFloat(trade.p)
          setPortfolio(prev => {
             const next = { ...prev }
             // Update if we hold this coin
             if (next.holdings[trade.s]) {
                 next.holdings[trade.s].currentPrice = currentPrice
                 // Recalculate PnL
                 const h = next.holdings[trade.s]
                 h.unrealizedPnL = (currentPrice - h.averageEntryPrice) * h.quantity
                 h.unrealizedPnLPercent = ((currentPrice - h.averageEntryPrice) / h.averageEntryPrice) * 100
             }
             return next
          })
          
          // Check Ghost Orders (Limit Orders) logic could go here if we had user placed limit orders
          // For now, the Spec says "Ghost Orders: if a user sets a Limit Order".
          // We'll skip complex user limit order implementation for the *bot* unless bot places limits.
          // The Bot in "Momentum" uses MARKET orders (Buy when price breaks high).
          // Strategy 2 uses MARKET orders on condition.
          // So Ghost Orders are primarily for if we add manual limit functionality later.
      }

      // STRATEGY ENGINE UPDATE
      if (kline && kline.kline.x) { // Only on CLOSED candle
          const symbol = kline.symbol
          const candle = kline.kline
          
          // Run Strategy
          if (mode === "simulator" && botConfig.isActive) {
              setBotStatus(`Analyzing ${symbol}...`)
              const signal = strategyEngine.current.evaluate(symbol, candle, true)
              
              if (signal.action === "BUY") {
                  setBotStatus(`SIGNAL FOUND: Buying ${symbol} (${signal.reason})`)
                  handleBotBuy(symbol, signal)
              } else if (signal.action === "HOLD") {
                  setBotStatus(`Scanning ${symbol}: ${signal.reason}`)
              } else if (signal.action === "SELL") {
                  // Strategy engine might return SELL signal if we built logic for it
                  // But currently logic is:
                  // Momentum: TP/SL handled by monitoring price (which we need to do on TICK, not just Candle close)
                  // For simplicity, we check TP/SL on candle close for now or add a "tick" checker.
              }
          }
      }
      
      // Monitor Open Positions for TP/SL (Run on every Price Update/Tick ideally, or every candle)
      // Doing it on candle close is safer for performance, but TP might need to be hit intraday.
      // Let's use Trade stream for TP/SL monitoring if available, or just use the kline close for now to save resources.
      if (trade && mode === "simulator" && botConfig.isActive) {
         checkExitConditions(trade.s, parseFloat(trade.p))
      }

  }, [streamData, mode, botConfig.isActive])


  // --- BOT TRADING ACTIONS ---

  const handleBotBuy = async (symbol: string, signal: TradeSignal) => {
      const currentPort = portfolioRef.current
      const config = botConfigRef.current
      
      // 1. Check constraints
      const activeHoldings = Object.values(currentPort.holdings).filter(h => h.quantity > 0)
      const investedAmount = activeHoldings.reduce((sum, h) => sum + (h.quantity * h.averageEntryPrice), 0)
      
      const availableAllocated = config.totalAllocated - investedAmount
      if (availableAllocated < 10) return // No funds

      // 2. Sizing
      // Momentum: 5% of allocation per trade? Or fixed?
      // Let's go with 10% of available allocation for diversification
      let tradeAmount = availableAllocated * 0.10
      
      // Cap at actual balance
      if (tradeAmount > currentPort.simulator.currentBalance) tradeAmount = currentPort.simulator.currentBalance
      if (tradeAmount < 10) return

      // 3. Execute with Slippage (via executeTrade)
      await executeTrade(symbol, "buy", tradeAmount, signal.price, false)
      
      // 4. Register TP/SL (In V2 we could store this in the Holding or a separate state)
      // For now, we'll just let the "checkExitConditions" logic handle generic TP/SL or if we want specific:
      // We can attach metadata to the holding? The current Holding interface doesn't supported metadata.
      // We'll trust the generic logic for now, or assume 3%/2% rules apply globally.
  }

  const checkExitConditions = async (symbol: string, currentPrice: number) => {
      const currentPort = portfolioRef.current
      const holding = currentPort.holdings[symbol]
      
      if (!holding || holding.quantity <= 0) return

      const pnlStats = ((currentPrice - holding.averageEntryPrice) / holding.averageEntryPrice) * 100
      
      // Blue Chip / Reversal Strategy Exit
      // Uses generic +4% TP, -2% SL from spec
      // Momentum Exit
      // Uses +3% TP, SL at prev candle low. 
      // Since we don't track "Strategy Type" per holding, we'll use a blended approach or try to guess.
      
      // Simple blended rules for V2 MVP:
      // Hard TP: +4%
      // Hard SL: -2% 
      // (This matches Strategy 2, and is close to Strategy 1's 3%)
      
      let shouldSell = false
      if (pnlStats >= 4) shouldSell = true
      if (pnlStats <= -2) shouldSell = true
      
      if (shouldSell) {
          await executeTrade(symbol, "sell", holding.quantity, currentPrice, true)
      }
  }


  // --- STANDARD ACTIONS ---

  const addFunds = (amount: number) => {
      setPortfolio(prev => ({
          ...prev,
          simulator: {
              ...prev.simulator,
              currentBalance: prev.simulator.currentBalance + amount,
              initialCapital: prev.simulator.initialCapital + amount
          }
      }))
  }

  // Monitor storage changes for Mode
  useEffect(() => {
     const handleStorageChange = () => {
         const newMode = (localStorage.getItem("trading_mode") as "simulator" | "real") || "simulator"
         setMode(newMode)
         if (newMode === "real") refreshData()
     }
     window.addEventListener('storage', handleStorageChange)
     return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Persist Portfolio
  useEffect(() => {
    localStorage.setItem("crypto_simulator_portfolio", JSON.stringify(portfolio))
  }, [portfolio])
  
  // Persist Config
  useEffect(() => {
    localStorage.setItem("crypto_simulator_bot_config", JSON.stringify(botConfig))
  }, [botConfig])

  // Performance Tracking
  useEffect(() => {
      const trackPerformance = () => {
          const currentPort = portfolioRef.current
          const holdingsValue = Object.values(currentPort.holdings).reduce((acc, h) => {
             return acc + (h.quantity * h.currentPrice)
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
  }, [])


  const executeTrade = async (coin: string, side: "buy" | "sell", amount: number, price: number, isQuantity: boolean) => {
    const currentPort = portfolioRef.current 

    if (mode === "real") {
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

    // --- SIMULATION LOGIC ---
    
    // 1. Apply Friction (Realism)
    // Slippage: 0.15% on Market Buys (simulating chasing the price)
    let executionPrice = price
    if (side === "buy") {
        executionPrice = price * 1.0015 
    } else {
        executionPrice = price * 0.9985 // Slippage on sell too
    }

    let quantity = 0
    let totalCost = 0

    if (isQuantity) {
      quantity = amount
      totalCost = amount * executionPrice
    } else {
      totalCost = amount
      quantity = amount / executionPrice
    }

    // Fee: 0.1%
    const fee = totalCost * 0.001
    const totalCostWithFee = totalCost + fee
    const totalProceedsAfterFee = totalCost - fee

    // Validation
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

    // Update State
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
        currentPrice: executionPrice, 
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
      
      if (existing.quantity > 0) {
         newPortfolio.holdings[coin] = existing
      } else if (side === 'sell' && existing.quantity <= 0.0000001) {
         delete newPortfolio.holdings[coin]
      }

      const trade: Trade = {
        id: crypto.randomUUID(),
        timestamp,
        type: "simulator",
        coin,
        side,
        entryPrice: executionPrice,
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

  const refreshData = async () => {
     // For Real mode only, simulator data is streamed
     if (mode === "real") {
         try {
             // const balances = await binanceService.getAccountBalance()
             // ... existing real mode logic if needed ...
         } catch (e) {
             console.error(e)
         }
     }
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
        addFunds,
        activeSymbols,
        botStatus,
        isConnected
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
