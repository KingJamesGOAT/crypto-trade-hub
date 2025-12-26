import React, { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

// Initialize Supabase Client (Frontend)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Safety check for keys
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

interface PortfolioItem {
  symbol: string
  amount: number
  avg_buy_price: number
}

interface LogItem {
  id: number
  timestamp: string
  message: string
}

interface HistoryItem {
  timestamp: string
  total_equity_usdt: number
}

interface SimulatorContextType {
  balance: number
  portfolio: PortfolioItem[]
  logs: LogItem[]
  history: HistoryItem[]
  isLoading: boolean
  isBotActive: boolean
  toggleBot: () => void
  resetSimulator: () => void
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined)

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [logs, setLogs] = useState<LogItem[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isBotActive, setIsBotActive] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const isConnected = !!supabase

  // 1. Initial Data Fetch
  const fetchData = async () => {
    if (!supabase) return
    setIsLoading(true)
    
    // Fetch Settings (Balance)
    const { data: settings } = await supabase.from('sim_settings').select('*').single()
    if (settings) {
      setBalance(Number(settings.balance_usdt))
      setIsBotActive(settings.is_bot_active)
    }

    // Fetch Portfolio
    const { data: holdings } = await supabase.from('sim_portfolio').select('*')
    if (holdings) setPortfolio(holdings)

    // Fetch Recent Logs
    const { data: recentLogs } = await supabase.from('sim_logs').select('*').order('id', { ascending: false }).limit(50)
    if (recentLogs) setLogs(recentLogs)

    // Fetch History (for graph)
    const { data: historyData } = await supabase.from('sim_balance_history').select('timestamp, total_equity_usdt').order('id', { ascending: true }).limit(100)
    if (historyData) setHistory(historyData)
    
    setIsLoading(false)
  }

  // 2. Realtime Subscription (The "Live TV" effect)
  useEffect(() => {
    if (!isConnected) {
        console.warn("Supabase keys missing. Simulator features disabled.")
        return
    }

    fetchData()

    // Listen for ANY changes to the DB (Buy/Sell by Bot)
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sim_settings' }, (payload) => {
        if(payload.new) {
            setBalance(Number((payload.new as any).balance_usdt))
            setIsBotActive((payload.new as any).is_bot_active)
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sim_portfolio' }, () => {
        supabase.from('sim_portfolio').select('*').then(({ data }) => {
            if(data) setPortfolio(data)
        })
        toast({ title: "Bot Activity Detected", description: "Portfolio updated from cloud." })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sim_logs' }, (payload) => {
          const newLog = payload.new as LogItem
          setLogs(prev => [newLog, ...prev])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sim_balance_history' }, (payload) => {
          const newPoint = payload.new as HistoryItem
          setHistory(prev => [...prev, newPoint])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // 3. User Actions (Manual Overrides)
  const toggleBot = async () => {
    if (!supabase) {
        toast({ title: "Connection Error", description: "Supabase keys missing.", variant: "destructive" })
        return
    }
    const newState = !isBotActive
    setIsBotActive(newState)
    await supabase.from('sim_settings').update({ is_bot_active: newState }).gt('id', 0) 
    toast({ title: newState ? "Bot Resumed" : "Bot Paused" })
  }

  const resetSimulator = async () => {
    if (!supabase) {
        toast({ title: "Connection Error", description: "Supabase keys missing.", variant: "destructive" })
        return
    }
    if (!confirm("Are you sure? This deletes all trade history.")) return
    
    setIsLoading(true)
    await supabase.from('sim_trades').delete().neq('id', 0)
    await supabase.from('sim_portfolio').delete().neq('symbol', '0')
    await supabase.from('sim_logs').delete().neq('id', 0) // Clear logs too
    await supabase.from('sim_balance_history').delete().neq('id', 0) // Clear history
    await supabase.from('sim_settings').update({ balance_usdt: 10000.00 }).gt('id', 0)
    
    await fetchData()
    toast({ title: "Simulator Reset", description: "Balance restored to $10,000" })
  }

  return (
    <SimulatorContext.Provider value={{ balance, portfolio, logs, history, isLoading, isBotActive, toggleBot, resetSimulator }}>
      {children}
    </SimulatorContext.Provider>
  )
}

export function useSimulator() {
  const context = useContext(SimulatorContext)
  if (context === undefined) throw new Error("useSimulator must be used within SimulatorProvider")
  return context
}
