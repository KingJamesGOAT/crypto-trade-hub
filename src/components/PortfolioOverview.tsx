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

    // Use history from context
    const realHistory = history || []

    // Ensure we always have a line to draw
    // Strategy: Always show a "Full Graph" (e.g. last 24h or ~24 points)
    // If real history is sparse (< 24 points), prepend flat-line data to fill the void.
    
    let activeData = [];
    const MIN_POINTS = 24; // Cover at least ~24 visual steps
    
    if (realHistory.length === 0) {
        // Scenario A: Zero History -> Full Mock
        // Generate points for the last 24 hours ending NOW
        activeData = Array.from({ length: MIN_POINTS }).map((_, i) => ({
             date: new Date(Date.now() - (MIN_POINTS - 1 - i) * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             simulator: simulatorNetWorth, // Flat line
             real: 0
        }));
    } else {
        // Scenario B: Some History -> Pad it if needed
        const mappedHistory = realHistory.map(point => ({
            date: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            simulator: point.total_equity_usdt,
            real: 0,
            originalTimestamp: new Date(point.timestamp).getTime()
        }));

        if (mappedHistory.length < MIN_POINTS) {
            const missingCount = MIN_POINTS - mappedHistory.length;
            const firstPoint = mappedHistory[0];
            const firstVal = firstPoint.simulator;
            const firstTime = firstPoint.originalTimestamp;

            // Generate padding BEFORE the first real point
            const padding = Array.from({ length: missingCount }).map((_, i) => {
                 // Go back in steps of 1 hour from the first real point
                 // offset = (missingCount - i) * 1 hour
                 const time = firstTime - ((missingCount - i) * 60 * 60 * 1000);
                 return {
                     date: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                     simulator: firstVal, // Assumption: Balance was same before
                     real: 0
                 };
            });
            
            activeData = [...padding, ...mappedHistory];
        } else {
            // Enough history, just show it
            activeData = mappedHistory;
        }
    }

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
