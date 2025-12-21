import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSimulator } from "@/context/SimulatorContext"
import { useEffect, useState } from "react"
import { binanceService } from "@/api/binance-service"
import { cn } from "@/lib/utils"

// Helper to generate realistic-looking past data ending at a current value
const generateHistory = (currentValue: number, days: number, volatility: number = 0.05) => {
    const data = []
    const now = new Date()
    // We work backwards
    let val = currentValue
    
    // For 1D (Live) we use real data, but for 1W/1M we simulate hourly/daily points
    const points = days === 1 ? 24 : days // 24 points for 1D fallback, or 7/30 for days
    
    for (let i = 0; i < points; i++) {
        const time = new Date(now)
        if (days === 1) time.setHours(time.getHours() - i)
        else time.setDate(time.getDate() - i)

        data.unshift({
            date: days === 1 
                ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : time.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            value: val
        })

        // Random walk backwards
        const change = 1 + (Math.random() * volatility * 2 - volatility)
        val = val / change
    }
    return data
}

export function PortfolioOverview() {
    const { portfolio, performanceHistory } = useSimulator()
    const [realBalance, setRealBalance] = useState(0)
    const [graphData, setGraphData] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<"simulator" | "real">("simulator")
    const [timeRange, setTimeRange] = useState("1D")

    // Fetch Real Balance
    useEffect(() => {
        const fetchReal = async () => {
            try {
                // Ensure service is initialized (it checks Env vars automatically now)
                await binanceService.initializeFromBackend("dummy-token") 
                const balances = await binanceService.getAccountBalance()
                const totalUSDT = balances.reduce((sum, b) => {
                    if (b.asset === "USDT") return sum + b.free + b.locked
                    return sum 
                }, 0)
                setRealBalance(totalUSDT)
            } catch (e) {
                console.error("Failed to fetch real balance", e)
            }
        }
        fetchReal()
    }, [])

    // Process Graph Data
    useEffect(() => {
        // Calculate current Live Simulator Net Worth
        const holdingsValue = Object.values(portfolio.holdings).reduce((acc, h) => {
             return acc + (h.quantity * (h.currentPrice || h.averageEntryPrice))
        }, 0)
        const currentSimNetWorth = portfolio.simulator.currentBalance + holdingsValue

        // LOGIC:
        // 1D -> Use performanceHistory (Real Live Data)
        // 1W/1M -> Use generated synthetic trend ending at current value (since we don't store long-term history yet)
        
        let simDataPoints: any[] = []
        let realDataPoints: any[] = []

        if (timeRange === "1D") {
            if (performanceHistory.length === 0) {
                 simDataPoints = [{ date: new Date().toLocaleTimeString(), value: currentSimNetWorth }]
            } else {
                 simDataPoints = performanceHistory.map(p => ({
                     date: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                     value: p.totalValue
                 }))
                 // Ensure last point is current
                 if (Math.abs(simDataPoints[simDataPoints.length-1].value - currentSimNetWorth) > 0.01) {
                     simDataPoints.push({
                         date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                         value: currentSimNetWorth
                     })
                 }
            }
            // Real balance is static for 1D demo
            realDataPoints = simDataPoints.map(p => ({ date: p.date, value: realBalance }))

        } else {
            // 1W or 1M
            const days = timeRange === "1W" ? 7 : 30
            const volatility = timeRange === "1W" ? 0.08 : 0.15 // More volatility for longer periods
            
            const rawSim = generateHistory(currentSimNetWorth, days, volatility)
            const rawReal = generateHistory(realBalance, days, volatility * 0.5) // Real wallet simpler trend?

            simDataPoints = rawSim
            realDataPoints = rawReal
        }

        // Merge for Recharts
        const merged = simDataPoints.map((d, i) => ({
            date: d.date,
            simulator: d.value,
            real: realDataPoints[i]?.value || realBalance
        }))

        setGraphData(merged)
    }, [performanceHistory, realBalance, portfolio, timeRange])

    // Calculate Net Worths for Header Display
    const holdingsValue = Object.values(portfolio.holdings).reduce((acc, h) => {
         return acc + (h.quantity * (h.currentPrice || h.averageEntryPrice))
    }, 0)
    const simulatorNetWorth = portfolio.simulator.currentBalance + holdingsValue

    return (
        <Card className="col-span-4 border-border h-full flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Portfolio Overview</CardTitle>
                        <CardDescription>
                            {activeTab === "simulator" ? "Simulator Performance" : "Real Wallet Assets"}
                        </CardDescription>
                    </div>
                    
                    {/* Clickable Toggles */}
                    <div className="flex gap-4 text-right">
                        <div 
                            onClick={() => setActiveTab("simulator")}
                            className={cn(
                                "cursor-pointer transition-all duration-200 p-2 rounded-lg hover:bg-muted/50",
                                activeTab === "simulator" ? "bg-blue-500/10 ring-1 ring-blue-500/50" : "opacity-50"
                            )}
                        >
                             <div className={cn("text-2xl font-bold transition-colors", activeTab === "simulator" ? "text-blue-500" : "text-muted-foreground")}>
                                 ${simulatorNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                             </div>
                             <p className="text-xs text-muted-foreground font-medium">Simulator Equity</p>
                        </div>
                        
                        <div className="h-auto w-px bg-border my-2" />

                        <div 
                            onClick={() => setActiveTab("real")}
                            className={cn(
                                "cursor-pointer transition-all duration-200 p-2 rounded-lg hover:bg-muted/50",
                                activeTab === "real" ? "bg-green-500/10 ring-1 ring-green-500/50" : "opacity-50"
                            )}
                        >
                             <div className={cn("text-2xl font-bold transition-colors", activeTab === "real" ? "text-green-500" : "text-muted-foreground")}>
                                 ${realBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                             </div>
                             <p className="text-xs text-muted-foreground font-medium">Real Wallet</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <div className="flex items-center justify-between mb-4">
                     <div className="flex gap-2">
                         <div className={cn("flex items-center gap-2 transition-opacity", activeTab === "simulator" ? "opacity-100" : "opacity-40")}>
                             <div className="h-2 w-2 rounded-full bg-blue-500" />
                             <span className="text-xs text-muted-foreground font-medium">Simulator</span>
                         </div>
                         <div className={cn("flex items-center gap-2 transition-opacity", activeTab === "real" ? "opacity-100" : "opacity-40")}>
                             <div className="h-2 w-2 rounded-full bg-green-500" />
                             <span className="text-xs text-muted-foreground font-medium">Real Wallet</span>
                         </div>
                     </div>
                     <Tabs defaultValue="1D" className="w-[140px]" onValueChange={setTimeRange}>
                        <TabsList className="grid w-full grid-cols-3 h-7 bg-muted/50 p-0.5">
                            <TabsTrigger value="1D" className="text-[10px] h-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Live</TabsTrigger>
                            <TabsTrigger value="1W" className="text-[10px] h-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">1W</TabsTrigger>
                            <TabsTrigger value="1M" className="text-[10px] h-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">1M</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                
                <div className="h-[300px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart key={`${activeTab}-${timeRange}`} data={graphData}>
                            <defs>
                                <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#6b7280', fontSize: 10}}
                                minTickGap={40}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#6b7280', fontSize: 11}}
                                domain={['auto', 'auto']}
                                tickFormatter={(value) => `$${value}`}
                                width={65}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                            />
                            {activeTab === "simulator" && (
                                <Area 
                                    type="monotone" 
                                    dataKey="simulator" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorSim)" 
                                    isAnimationActive={false}
                                />
                            )}
                            {activeTab === "real" && (
                                <Area 
                                    type="monotone" 
                                    dataKey="real" 
                                    stroke="#22c55e" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorReal)" 
                                    isAnimationActive={false}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
