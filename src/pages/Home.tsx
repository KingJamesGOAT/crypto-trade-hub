import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { MarketIntelligence } from "@/components/MarketIntelligence"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Wallet, TrendingUp, Power, AlertCircle } from "lucide-react"
import { useSimulator } from "@/context/SimulatorContext"

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

export function Home() {
    const { portfolio, balance } = useSimulator()
    const [botActive, setBotActive] = useState(false)
    const [totalPnL, setTotalPnL] = useState(0)
    const [winRate, setWinRate] = useState(0)

    useEffect(() => {
        if (!supabase) return

        const fetchExecutiveData = async () => {
             // 1. Bot Status
             const { data: settings } = await supabase.from('sim_settings').select('is_bot_active').single()
             if (settings) setBotActive(settings.is_bot_active)

             // 2. PnL Stats
             const { data: trades } = await supabase.from('sim_trades').select('pnl')
             if (trades && trades.length > 0) {
                 const total = trades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
                 setTotalPnL(total)
                 
                 const wins = trades.filter(t => (Number(t.pnl) || 0) > 0).length
                 const rate = (wins / trades.length) * 100
                 setWinRate(rate)
             }
        }

        fetchExecutiveData()
    }, [])

    return (
        <div className="space-y-6 pb-10 max-w-[1600px] mx-auto p-4 md:p-8 pt-6 min-h-screen">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight uppercase font-mono text-foreground border-l-4 border-blue-500 pl-4">
                        Executive Dashboard
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm pl-4 mt-1">
                        Global Command Overview
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${botActive ? "border-green-500/30 bg-green-500/10 text-green-500" : "border-red-500/30 bg-red-500/10 text-red-500"}`}>
                    <Power className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{botActive ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}</span>
                </div>
            </div>

            {/* TOP SECTION: INTELLIGENCE & STATUS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Market Intelligence (Left - 8 cols) */}
                <div className="lg:col-span-8 h-[360px] md:h-[320px]">
                    <MarketIntelligence />
                </div>

                {/* 2. Status Cards (Right - 4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-4 h-auto md:h-[320px]">
                    
                    {/* Active Positions */}
                    <Card className="flex-1 bg-card/40 border-border backdrop-blur-md">
                        <CardHeader className="py-3 pb-1">
                             <CardTitle className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-500" />
                                Active Vectors
                             </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-mono text-foreground">
                                {portfolio.length} <span className="text-xs text-muted-foreground font-normal">Open Positions</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total PnL */}
                    <Card className="flex-1 bg-card/40 border-border backdrop-blur-md">
                        <CardHeader className="py-3 pb-1">
                             <CardTitle className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                Realized PnL
                             </CardTitle>
                        </CardHeader>
                         <CardContent>
                            <div className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                                Win Rate: {winRate.toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>

                     {/* Balance */}
                     <Card className="flex-1 bg-card/40 border-border backdrop-blur-md">
                        <CardHeader className="py-3 pb-1">
                             <CardTitle className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-purple-500" />
                                Capital Allocation
                             </CardTitle>
                        </CardHeader>
                         <CardContent>
                            <div className="text-2xl font-bold font-mono text-foreground">
                                ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* MIDDLE SECTION: QUICK ACTIONS / ALERTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-4">
                    <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-yellow-500 text-sm uppercase mb-1">System Notice</h3>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed font-mono">
                            Market volatility is high. The AI Agent has switched to defensive protocols (Tight Stop Loss).
                            Monitor the "Paper Trading" terminal for real-time adjustments.
                        </p>
                    </div>
                </div>
                 <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 flex items-start gap-4">
                    <Activity className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-blue-500 text-sm uppercase mb-1">Active Session</h3>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed font-mono">
                            Ghost Engine is currently scanning markets in real-time. 
                            Next sentiment analysis update strictly follows market close/open cycles.
                        </p>
                    </div>
                </div>
            </div>
            
        </div>
    )
}
