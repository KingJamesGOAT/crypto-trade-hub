import { createContext, useContext, useEffect, useState, useRef } from "react"
import type { Portfolio, Trade } from "@/types/index"
import { binanceService } from "@/api/binance-service"
// import { AVAILABLE_COINS } from "@/data/coins"
import { getTopCandidates } from "@/api/market-scanner"
import { useBinanceStream } from "@/hooks/useBinanceStream"
import { StrategyEngine, type TradeSignal } from "@/lib/strategy-engine"
import { fetchCryptoNews } from "@/api/news-service"
import { analyzeMarketSentiment, type SentimentMode } from "@/lib/news-sentiment"

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
  executeTrade: (
      coin: string, 
      side: "buy" | "sell", 
      amount: number, 
      price: number, 
      isQuantity: boolean,
      stopLoss?: number,
      takeProfit?: number,
      strategy?: string
  ) => Promise<{ success: boolean; message: string }>
  resetSimulator: () => void
  refreshData: () => Promise<void>
  activeSymbols: string[]
  botStatus: string
  isConnected: boolean
  latestPrices: Record<string, number>
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

  const [performanceHistory, setPerformanceHistory] = useState<PerformancePoint[]>(() => {
    const saved = localStorage.getItem("crypto_simulator_perf_history")
    return saved ? JSON.parse(saved) : []
  })

  // Persist Performance History
  useEffect(() => {
    localStorage.setItem("crypto_simulator_perf_history", JSON.stringify(performanceHistory))
  }, [performanceHistory])
  
  // Market Scanner & Data State
  const [activeSymbols, setActiveSymbols] = useState<string[]>([])
  const { streamData, isConnected } = useBinanceStream(activeSymbols)
  const [botStatus, setBotStatus] = useState<string>("Idle")
  const [latestPrices, setLatestPrices] = useState<Record<string, number>>({})

  // Sentiment State
  const [sentiment, setSentiment] = useState<{ mode: SentimentMode, score: number }>({ mode: "NEUTRAL", score: 0 })
  const sentimentRef = useRef(sentiment)
  useEffect(() => { sentimentRef.current = sentiment }, [sentiment])
  
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


// Imports updated at top of file separately

  // --- 1. MARKET SCANNER & NEWS LOOP ---
  useEffect(() => {
      // Basic initialization of symbols
      const initScanner = async () => {
          setBotStatus("Scanning Market & News...")
          console.log("Running Market Scanner & News...")
          
          // 1. Fetch News & Sentiment
          try {
              const articles = await fetchCryptoNews()
              const sentimentResult = analyzeMarketSentiment(articles)
              setSentiment(sentimentResult)
              if (sentimentResult.mode !== "NEUTRAL") {
                   console.log(`[News] Sentiment is ${sentimentResult.mode} (Score: ${sentimentResult.score})`)
              }
          } catch (e) {
              console.error("Failed to fetch news in scanner", e)
          }

          // 2. Scan Market Candidates
          const candidates = await getTopCandidates()
          
          // Ensure we always track coins we hold, even if they drop from top 10
          const heldCoins = Object.keys(portfolioRef.current.holdings).filter(
              k => portfolioRef.current.holdings[k].quantity > 0
          )
          
          const combined = Array.from(new Set([...candidates, ...heldCoins]))
          
          setActiveSymbols(combined)
          setBotStatus(`Monitoring ${combined.length} Assets | Sentiment: ${sentimentRef.current.mode}`)
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
          
          setLatestPrices(prev => ({ ...prev, [trade.s]: currentPrice }))

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
      }

      // STRATEGY ENGINE UPDATE
      if (kline && kline.kline.x) { // Only on CLOSED candle
          const symbol = kline.symbol
          const candle = kline.kline
          
          // Run Strategy
          if (mode === "simulator" && botConfig.isActive) {
              setBotStatus(`Analyzing ${symbol}...`)
              // PASS SENTIMENT MODE HERE
              const signal = strategyEngine.current.evaluate(symbol, candle, true, sentimentRef.current.mode)
              
              if (signal.action === "BUY") {
                  setBotStatus(`SIGNAL FOUND: Buying ${symbol} (${signal.reason})`)
                  handleBotBuy(symbol, signal)
              } else if (signal.action === "HOLD") {
                  setBotStatus(`Scanning ${symbol}: ${signal.reason}`)
              }
          }
      }
      
      // Monitor Open Positions for TP/SL (Run on every Price Update/Tick ideally, or every candle)
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
      // Use the Strategy Engine's calculated size (Kelly or Grid Layer)
      // Default to 10% if not provided
      const sizePercent = signal.sizePercent || 0.10 
      
      let tradeAmount = availableAllocated * sizePercent
      
      // Cap at actual balance
      if (tradeAmount > currentPort.simulator.currentBalance) tradeAmount = currentPort.simulator.currentBalance
      if (tradeAmount < 10) return

      // 3. Execute with Slippage (via executeTrade)
      await executeTrade(
        symbol, 
        "buy", 
        tradeAmount, 
        signal.price, 
        false,
        signal.stopLoss,
        signal.takeProfit,
        signal.strategy
      )
      
      // 4. Register TP/SL (Now handled inside executeTrade logic)
  }

  const checkExitConditions = async (symbol: string, currentPrice: number) => {
      const currentPort = portfolioRef.current
      const holding = currentPort.holdings[symbol]
      
      if (!holding || holding.quantity <= 0) return

      let shouldSell = false
      let reason = ""

      // 1. SMART CHECK: Do we have specific strategy levels?
      if (holding.stopLossPrice && currentPrice <= holding.stopLossPrice) {
          shouldSell = true
          reason = `Stop Loss Hit (@${holding.stopLossPrice})`
      }
      else if (holding.takeProfitPrice && currentPrice >= holding.takeProfitPrice) {
          shouldSell = true
          reason = `Take Profit Hit (@${holding.takeProfitPrice})`
      }
      
      // 2. FALLBACK CHECK: If no specific levels, use the generic safety net
      else {
          const pnlPercent = ((currentPrice - holding.averageEntryPrice) / holding.averageEntryPrice) * 100
          if (pnlPercent >= 4) { shouldSell = true; reason = "Hard TP (+4%)" }
          if (pnlPercent <= -2) { shouldSell = true; reason = "Hard SL (-2%)" }
      }
      
      if (shouldSell) {
          await executeTrade(symbol, "sell", holding.quantity, currentPrice, true)
          console.log(`[Simulator] Sold ${symbol}: ${reason}`)
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


  const executeTrade = async (
    coin: string, 
    side: "buy" | "sell", 
    amount: number, 
    price: number, 
    isQuantity: boolean,
    stopLoss?: number,
    takeProfit?: number,
    strategy?: string
  ) => {
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
        // Weighted Average Entry Price Formula:
        // ((OldQty * OldAvg) + (NewQty * BuyPrice)) / (OldQty + NewQty)
        const totalOldCost = existing.quantity * existing.averageEntryPrice
        const totalNewCost = quantity * executionPrice // Cost excluding fee for asset price avg
        
        const newQuantity = existing.quantity + quantity
        
        if (newQuantity > 0) {
            existing.averageEntryPrice = (totalOldCost + totalNewCost) / newQuantity
        } else {
            existing.averageEntryPrice = executionPrice
        }
        
        existing.quantity = newQuantity

        // SAVE SMART LEVELS
        if (stopLoss) existing.stopLossPrice = stopLoss
        if (takeProfit) existing.takeProfitPrice = takeProfit
        if (strategy) existing.strategy = strategy

      } else {
        existing.quantity -= quantity
        if (existing.quantity <= 0.0000001) {
             delete newPortfolio.holdings[coin]
        }
      }
      
      if (existing.quantity > 0) {
         newPortfolio.holdings[coin] = existing
      } else if (side === 'sell' && (!newPortfolio.holdings[coin] || newPortfolio.holdings[coin].quantity <= 0.0000001)) {
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
        isConnected,
        latestPrices
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
