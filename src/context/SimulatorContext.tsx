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

interface SimulatorContextType {
  balance: number
  portfolio: PortfolioItem[]
  isLoading: boolean
  isBotActive: boolean
  toggleBot: () => void
  resetSimulator: () => void
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined)

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [isBotActive, setIsBotActive] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { toast } = useToast()

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
    if (holdings) {
      setPortfolio(holdings)
    }
    
    setIsLoading(false)
  }

  // 2. Realtime Subscription (The "Live TV" effect)
  useEffect(() => {
    if (!supabase) return

    fetchData()

    // Listen for ANY changes to the DB (Buy/Sell by Bot)
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sim_settings' }, (payload) => {
        // Update balance instantly
        if(payload.new) {
            setBalance(Number((payload.new as any).balance_usdt))
            setIsBotActive((payload.new as any).is_bot_active)
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sim_portfolio' }, () => {
        // Reload portfolio if coins change
        supabase.from('sim_portfolio').select('*').then(({ data }) => {
            if(data) setPortfolio(data)
        })
        toast({ title: "Bot Activity Detected", description: "Portfolio updated from cloud." })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // 3. User Actions (Manual Overrides)
  const toggleBot = async () => {
    if (!supabase) return
    const newState = !isBotActive
    setIsBotActive(newState)
    await supabase.from('sim_settings').update({ is_bot_active: newState }).gt('id', 0) // Updates all rows
    toast({ title: newState ? "Bot Resumed" : "Bot Paused" })
  }

  const resetSimulator = async () => {
    if (!supabase) return
    if (!confirm("Are you sure? This deletes all trade history.")) return
    
    setIsLoading(true)
    await supabase.from('sim_trades').delete().neq('id', 0)
    await supabase.from('sim_portfolio').delete().neq('symbol', '0')
    await supabase.from('sim_settings').update({ balance_usdt: 10000.00 }).gt('id', 0)
    
    await fetchData()
    toast({ title: "Simulator Reset", description: "Balance restored to $10,000" })
  }

  if (!supabase) {
      return <div className="p-10 text-red-500">Error: Supabase Keys missing in .env</div>
  }

  return (
    <SimulatorContext.Provider value={{ balance, portfolio, isLoading, isBotActive, toggleBot, resetSimulator }}>
      {children}
    </SimulatorContext.Provider>
  )
}

export function useSimulator() {
  const context = useContext(SimulatorContext)
  if (context === undefined) throw new Error("useSimulator must be used within SimulatorProvider")
  return context
}
