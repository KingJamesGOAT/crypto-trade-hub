import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function WinLossChart() {
    const [stats, setStats] = useState([
        { name: 'Wins', value: 0 },
        { name: 'Losses', value: 0 },
    ])

    useEffect(() => {
        const fetchStats = async () => {
             const { data } = await supabase
                .from('sim_trades')
                .select('pnl')
                .eq('side', 'SELL')
             
             if (data) {
                 const wins = data.filter(t => t.pnl > 0).length
                 const losses = data.filter(t => t.pnl <= 0).length
                 setStats([
                     { name: 'Wins', value: wins },
                     { name: 'Losses', value: losses }
                 ])
             }
        }
        fetchStats()
    }, [])
    
    const COLORS = ['#10b981', '#ef4444'];

    return (
        <Card className="h-full border-border bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Strategist Win Rate</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {stats.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
