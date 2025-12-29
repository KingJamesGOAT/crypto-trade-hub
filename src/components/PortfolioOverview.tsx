import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSimulator } from "@/context/SimulatorContext"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function PortfolioOverview() {
    const { portfolio, balance, activeHistory /* assuming activeHistory or just history */, history } = useSimulator()
    const [activeTab, setActiveTab] = useState<"simulator" | "real">("simulator")

    // Calculate Net Worths
    const holdingsValue = portfolio.reduce((acc, h) => {
         return acc + (h.amount * h.avg_buy_price) // Est value
    }, 0)
    const simulatorNetWorth = balance + holdingsValue

    // Use history from context
    const realHistory = history || []

    // Generate Mock Data if History is empty (Visual fill for new users)
    // We want the graph to look "alive" even on Day 0
    const activeData = realHistory.length > 1 ? realHistory.map(point => ({
        date: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        simulator: point.total_equity_usdt,
        real: 0
    })) : Array.from({ length: 15 }).map((_, i) => {
        // Generate a fake curve that ends at the current net worth
        // Base value + random variance
        const timeOffset = (14 - i) * 15 * 60 * 1000 // 15 mins per point
        const date = new Date(Date.now() - timeOffset)
        
        // Random walk ending at simulatorNetWorth
        // We work backwards: final is current, previous is current +/- simple drift
        // But for static render, let's just do a sine wave drift around a mean
        const variance = (Math.sin(i) * 20) + (i * 10) // Upward trend
        const startValue = simulatorNetWorth - 200 // Start $200 lower
        const val = startValue + ((200 / 14) * i) + (Math.random() * 50 - 25)

        return {
            date: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            simulator: i === 14 ? simulatorNetWorth : val, // Force exact match on last point
            real: 0
        }
    })

    return (
        <Card className="col-span-4 border-border h-full flex flex-col bg-card shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-foreground">Portfolio Overview</CardTitle>
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
                        <AreaChart data={activeData}>
                            <defs>
                                <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            {/* Theme-aware grid: using widely compatible standard hex matching border */}
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="date" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'var(--background)', /* Uses CSS var from index.css */
                                    borderColor: 'var(--border)', 
                                    borderRadius: '8px', 
                                    fontSize: '12px',
                                    color: 'var(--foreground)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{ color: '#3b82f6' }}
                                labelStyle={{ color: 'var(--muted-foreground)' }}
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
