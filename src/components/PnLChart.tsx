import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function PnLChart() {
    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        const fetchHistory = async () => {
             // We can use 'sim_trades' history to reconstruction PnL curve
             // Or better, track daily snapshots. For now, let's look at closed trades.
             const { data: trades } = await supabase
                .from('sim_trades')
                .select('closed_at, pnl')
                .eq('side', 'SELL')
                .order('closed_at', { ascending: true })
                .limit(30)
             
             if (trades) {
                 let runningBalance = 0 // Relative PnL
                 const chartData = trades.map(t => {
                     runningBalance += parseFloat(t.pnl)
                     return {
                         date: new Date(t.closed_at).toLocaleDateString(),
                         pnl: runningBalance
                     }
                 })
                 setData(chartData)
             }
        }
        fetchHistory()
    }, [])

    return (
        <Card className="h-full border-border bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Cumulative PnL (30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                            itemStyle={{ color: '#10b981' }}
                        />
                        <Area type="monotone" dataKey="pnl" stroke="#10b981" fillOpacity={1} fill="url(#colorPnL)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
