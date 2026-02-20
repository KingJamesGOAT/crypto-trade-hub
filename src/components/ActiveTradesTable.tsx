import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Target, TrendingDown, TrendingUp } from "lucide-react"
import { RiskCalculator } from "@/components/RiskCalculator"
import { useBinanceStream } from "@/hooks/useBinanceStream"

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function ActiveTradesTable() {
    const [positions, setPositions] = useState<any[]>([])
    
    // Get unique active coins for stream
    const activeSymbols = Array.from(new Set(positions.map(p => p.symbol)))
    const { streamData } = useBinanceStream(activeSymbols)
    const [livePrices, setLivePrices] = useState<Record<string, number>>({})

    useEffect(() => {
        const fetchPositions = async () => {
             const { data } = await supabase.from('sim_portfolio').select('*')
             if (data) setPositions(data)
        }
        
        fetchPositions()
        
        // Realtime Subscription would go here for prices, 
        // for now we trust the user refreshes or we poll
        const interval = setInterval(fetchPositions, 5000);
        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        if (streamData?.trade) {
            setLivePrices(prev => ({
                ...prev,
                [streamData.trade!.s]: parseFloat(streamData.trade!.p)
            }))
        }
    }, [streamData])
    
    return (
        <Card className="h-full border-border bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <span>Active Scout Missions</span>
                    <Badge variant="secondary">{positions.length} Active</Badge>
                </CardTitle>
                <RiskCalculator />
            </CardHeader>
            <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {positions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No active missions. The Scout is scanning...
                    </div>
                )}

                {positions.map((pos) => {
                    const entry = parseFloat(pos.avg_buy_price)
                    const tp = parseFloat(pos.take_profit)
                    const sl = parseFloat(pos.stop_loss)
                    const current = livePrices[pos.symbol] || entry
                    
                    const pnlVal = (current - entry) * pos.amount
                    const pnlPct = ((current - entry) / entry) * 100
                    const isProfit = pnlVal >= 0
                    
                    // Simple visual progress:
                    // 0% = At Stop Loss
                    // 50% = At Entry
                    // 100% = At Take Profit (or arbitrarily +6% if no TP)
                    
                    let progress = 50
                    const targetProfit = tp > 0 ? tp : entry * 1.06 // Assume 6% target if trailing
                    
                    if (current <= sl) {
                        progress = 0
                    } else if (current >= targetProfit) {
                        progress = 100
                    } else if (current > entry) {
                        // Between entry and target (50% to 100%)
                        progress = 50 + ((current - entry) / (targetProfit - entry)) * 50
                    } else {
                        // Between SL and entry (0% to 50%)
                        progress = ((current - sl) / (entry - sl)) * 50
                    }

                    return (
                        <div key={pos.id} className="p-3 rounded-lg border bg-background/50 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="font-bold flex items-center gap-2">
                                    <span className="text-lg">{pos.symbol.replace("USDT", "")}</span>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">LONG</Badge>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-muted-foreground">Entry: ${entry.toFixed(4)}</div>
                                    <div className={`text-sm font-mono font-bold flex items-center justify-end gap-1 ${isProfit ? "text-green-500" : "text-red-500"}`}>
                                        {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {isProfit ? "+" : ""}{pnlPct.toFixed(2)}% (${isProfit ? "" : ""}{pnlVal.toFixed(2)})
                                    </div>
                                </div>
                            </div>
                            
                            {/* Visual PnL Bar */}
                            <div className="relative pt-2">
                                <div className="flex justify-between text-xs mb-1 font-mono font-bold">
                                    <span className="text-red-500 flex items-center gap-1">${sl.toFixed(4)}</span>
                                    <span className="text-emerald-500 flex items-center gap-1">${(tp > 0 ? tp : entry * 1.06).toFixed(4)} <Target className="h-3 w-3"/></span>
                                </div>
                                <Progress value={progress} className="h-2 bg-slate-800" indicatorClassName={isProfit ? "bg-emerald-500" : "bg-red-500"} />
                                <div className="text-center text-[10px] text-muted-foreground mt-1">Live Tracking Active</div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
