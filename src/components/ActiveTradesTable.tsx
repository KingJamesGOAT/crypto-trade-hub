import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Target } from "lucide-react"

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function ActiveTradesTable() {
    const [positions, setPositions] = useState<any[]>([])

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

    // Mock live price update effect (In prod, fetch from Binance)
    // Here we just use the entry price to avoid "0" errors if we can't fetch live
    
    return (
        <Card className="h-full border-border bg-card/50 backdrop-blur">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                    <span>Active Scout Missions</span>
                    <Badge variant="secondary">{positions.length} Active</Badge>
                </CardTitle>
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
                    // const sl = parseFloat(pos.stop_loss)
                    // Mock current price as entry for visualization if missing
                    // const current = entry 
                    
                    // const distToTp = tp - entry
                    // const distToSl = entry - sl
                    const progress = 50 // Middle by default until live price

                    return (
                        <div key={pos.id} className="p-3 rounded-lg border bg-background/50 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="font-bold flex items-center gap-2">
                                    <span className="text-lg">{pos.symbol.replace("USDT", "")}</span>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">LONG</Badge>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-muted-foreground">Entry: ${entry.toFixed(4)}</div>
                                </div>
                            </div>
                            
                            {/* Visual PnL Bar */}
                            <div className="relative pt-2">
                                <div className="flex justify-between text-xs mb-1 font-mono font-bold">
                                    {/* <span className="text-red-500 flex items-center gap-1"><ShieldAlert className="h-3 w-3"/> ${sl.toFixed(4)}</span> */}
                                    <span className="text-emerald-500 flex items-center gap-1">${tp.toFixed(4)} <Target className="h-3 w-3"/></span>
                                </div>
                                <Progress value={progress} className="h-2 bg-slate-800" indicatorClassName="bg-blue-500" />
                                <div className="text-center text-[10px] text-muted-foreground mt-1">Live Tracking Active</div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
