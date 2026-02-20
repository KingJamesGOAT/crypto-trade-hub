import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Trophy, TrendingDown, Target, BarChart2 } from "lucide-react"

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface PerformanceMetrics {
    winRate: number
    profitFactor: number
    bestPair: { symbol: string, pnl: number } | null
    worstPair: { symbol: string, pnl: number } | null
    totalTrades: number
}

export function TradePerformance() {
    const [stats, setStats] = useState([
        { name: 'Wins', value: 0 },
        { name: 'Losses', value: 0 },
    ])
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        winRate: 0,
        profitFactor: 0,
        bestPair: null,
        worstPair: null,
        totalTrades: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
             const { data } = await supabase
                .from('sim_trades')
                .select('*') // Need symbol and pnl
                .eq('side', 'SELL') // Only closed trades (conceptually, assuming SELL closes BUYs or track by trade groups)
             
             if (data && data.length > 0) {
                 const wins = data.filter(t => t.pnl > 0)
                 const losses = data.filter(t => t.pnl <= 0)
                 
                 const winCount = wins.length
                 const lossCount = losses.length
                 const total = winCount + lossCount
                 
                 // Profit Factor
                 const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0)
                 const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0))
                 const pf = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss)

                 // Best/Worst Pair
                 // Group by symbol first? Or just single trade? Let's do single trade for now for simplicity or group if we have time.
                 // Let's do simplistic "Best Single Trade" to keep it fast, or aggregation.
                 // Aggregation is better for "Best Coin".
                 const pnlByCoin: Record<string, number> = {}
                 data.forEach(t => {
                     pnlByCoin[t.symbol] = (pnlByCoin[t.symbol] || 0) + t.pnl
                 })
                 
                 let bestSymbol = null
                 let maxPnl = -Infinity
                 let worstSymbol = null
                 let minPnl = Infinity
                 
                 Object.entries(pnlByCoin).forEach(([sym, pnl]) => {
                     if (pnl > maxPnl) { maxPnl = pnl; bestSymbol = sym; }
                     if (pnl < minPnl) { minPnl = pnl; worstSymbol = sym; }
                 })

                 setStats([
                     { name: 'Wins', value: winCount },
                     { name: 'Losses', value: lossCount }
                 ])

                 setMetrics({
                     winRate: total === 0 ? 0 : (winCount / total) * 100,
                     profitFactor: pf,
                     bestPair: bestSymbol ? { symbol: bestSymbol, pnl: maxPnl } : null,
                     worstPair: worstSymbol ? { symbol: worstSymbol, pnl: minPnl } : null,
                     totalTrades: total
                 })
             }
        }
        fetchStats()
    }, [])
    
    const COLORS = ['#10b981', '#ef4444'];

    return (
        <Card className="h-full border-border bg-card/50 backdrop-blur">
            <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-400 uppercase tracking-wider">
                    <BarChart2 className="h-4 w-4" /> Neural Journal
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] p-0 flex">
                
                {/* 1. Chart Section */}
                <div className="w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }} />
                            <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Win Rate */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">{metrics.winRate.toFixed(0)}%</div>
                            <div className="text-[10px] text-muted-foreground uppercase">Win Rate</div>
                        </div>
                    </div>
                </div>

                {/* 2. Metrics Grid */}
                <div className="w-1/2 h-full border-l border-white/5 p-4 flex flex-col justify-center space-y-4">
                    
                    {/* Profit Factor */}
                    <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                            <Target className="h-3 w-3" /> Profit Factor
                        </div>
                        <div className={`text-xl font-mono font-bold ${metrics.profitFactor >= 1.5 ? "text-emerald-400" : metrics.profitFactor >= 1 ? "text-yellow-400" : "text-red-400"}`}>
                            {metrics.profitFactor.toFixed(2)}
                        </div>
                    </div>

                    {/* Best Asset */}
                    {metrics.bestPair && (
                        <div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                                <Trophy className="h-3 w-3 text-yellow-500" /> Best Asset
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{metrics.bestPair.symbol.replace("USDT","")}</span>
                                <span className="text-xs font-mono text-emerald-400">+{metrics.bestPair.pnl < 0 ? "-" : "$"}{Math.abs(metrics.bestPair.pnl).toFixed(0)}</span>
                            </div>
                        </div>
                    )}

                    {/* Worst Asset */}
                    {metrics.worstPair && (
                        <div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                                <TrendingDown className="h-3 w-3 text-red-500" /> Worst Asset
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{metrics.worstPair.symbol.replace("USDT","")}</span>
                                <span className="text-xs font-mono text-red-400">-{metrics.worstPair.pnl < 0 ? "$" : ""}{Math.abs(metrics.worstPair.pnl).toFixed(0)}</span>
                            </div>
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    )
}
