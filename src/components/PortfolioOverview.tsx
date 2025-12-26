import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSimulator } from "@/context/SimulatorContext"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function PortfolioOverview() {
    const { portfolio, balance, history } = useSimulator()
    const [activeTab, setActiveTab] = useState<"simulator" | "real">("simulator")

    // Calculate Net Worths
    const holdingsValue = portfolio.reduce((acc, h) => {
         return acc + (h.amount * h.avg_buy_price) // Est value
    }, 0)
    const simulatorNetWorth = balance + holdingsValue

    // Real Graph Data from Supabase
    const graphData = history.map(point => ({
        date: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        simulator: point.total_equity_usdt,
        real: 0
    }))

    // Add current moment if history is empty (visual fix)
    if (graphData.length === 0) {
        graphData.push({
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            simulator: simulatorNetWorth,
            real: 0
        })
    }

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
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <div className="h-[300px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={graphData}>
                            <defs>
                                <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            {activeTab === "simulator" && (
                                <Area 
                                    type="monotone" 
                                    dataKey="simulator" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorSim)" 
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

