import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useEffect, useState } from "react"
import type { CoinMarketData, CandleData } from "@/api/coingecko"
import { getCoinCandles } from "@/api/coingecko"
import { ArrowUp, ArrowDown, Activity } from "lucide-react"

interface CoinDetailModalProps {
    isOpen: boolean
    onClose: () => void
    coin: CoinMarketData | null
}

export function CoinDetailModal({ isOpen, onClose, coin }: CoinDetailModalProps) {
    const [history, setHistory] = useState<CandleData[]>([])
    const [loading, setLoading] = useState(false)
    const [timeframe, setTimeframe] = useState("30") // days

    useEffect(() => {
        if (coin && isOpen) {
            const fetchHistory = async () => {
                setLoading(true)
                const data = await getCoinCandles(coin.id, parseInt(timeframe))
                if (data) setHistory(data)
                setLoading(false)
            }
            fetchHistory()
        }
    }, [coin, isOpen, timeframe])

    if (!coin) return null

    const isPositive = coin.price_change_percentage_24h_in_currency >= 0
    const color = isPositive ? "#10b981" : "#ef4444"

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] bg-slate-950/95 border-slate-800 backdrop-blur-xl text-white">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <img src={coin.image} alt={coin.name} className="h-10 w-10" />
                        <div>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                {coin.name} <span className="text-muted-foreground text-sm uppercase">({coin.symbol})</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                                Rank #{coin.market_cap_rank} • Market Leader
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold font-mono tracking-tight">
                            ${coin.current_price.toLocaleString()}
                        </div>
                        <div className={`text-sm font-mono flex items-center justify-end gap-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {coin.price_change_percentage_24h_in_currency.toFixed(2)}% (24h)
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Price Action Analysis
                        </h3>
                        <Tabs defaultValue="30" value={timeframe} onValueChange={setTimeframe} className="h-8">
                            <TabsList className="grid w-[180px] grid-cols-3 h-8 bg-slate-900/50">
                                <TabsTrigger value="7" className="text-xs">7D</TabsTrigger>
                                <TabsTrigger value="30" className="text-xs">30D</TabsTrigger>
                                <TabsTrigger value="90" className="text-xs">90D</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="h-[300px] w-full border border-white/5 rounded-xl bg-black/20 p-2">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">
                                Loading Chart Data...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis 
                                        dataKey="time" 
                                        tickFormatter={(time) => new Date(time).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                        stroke="#ffffff30"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={30}
                                    />
                                    <YAxis 
                                        domain={['auto', 'auto']}
                                        orientation="right"
                                        tickFormatter={(val) => `$${val.toLocaleString()}`}
                                        stroke="#ffffff30"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        width={60}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                                        itemStyle={{ color: "#fff" }}
                                        labelStyle={{ color: "#94a3b8", marginBottom: "5px" }}
                                        labelFormatter={(label) => new Date(label).toLocaleString()}
                                        formatter={(value: any) => [
                                            `$${Number(value).toLocaleString()}`, 
                                            "Price"
                                        ] as [string, string]}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="close" 
                                        stroke={color} 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorPrice)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="text-[10px] text-muted-foreground uppercase mb-1">Market Cap</div>
                        <div className="font-mono font-bold">${(coin.market_cap / 1e9).toFixed(2)}B</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="text-[10px] text-muted-foreground uppercase mb-1">Volume (24h)</div>
                        <div className="font-mono font-bold">${(coin.total_volume / 1e6).toFixed(0)}M</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="text-[10px] text-muted-foreground uppercase mb-1">Circulating Supply</div>
                        <div className="font-mono font-bold">{(coin.circulating_supply / 1e6).toFixed(1)}M</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="text-[10px] text-muted-foreground uppercase mb-1">All Time High</div>
                        <div className="font-mono font-bold text-muted-foreground">--</div> 
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
