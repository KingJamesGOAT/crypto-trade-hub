import { useEffect, useState } from "react"
import { binanceService } from "@/api/binance-service"
import { ArrowUp, ArrowDown, Activity } from "lucide-react"

interface TrendData {
    symbol: string
    priceChangePercent: number
    lastPrice: number
}

export function TrendBias() {
    const [trends, setTrends] = useState<TrendData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTrends = async () => {
            const data = await binanceService.get24hTicker(["BTCUSDT", "ETHUSDT", "SOLUSDT"])
            setTrends(data)
            setLoading(false)
        }
        
        fetchTrends()
        const interval = setInterval(fetchTrends, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur border border-white/5 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase border-r border-white/10 pr-4">
                <Activity className="h-3 w-3" />
                <span>Daily Bias</span>
            </div>
            
            {loading ? (
                <span className="text-[10px] text-muted-foreground animate-pulse">Analyzing Market Structure...</span>
            ) : (
                <div className="flex items-center gap-4">
                    {trends.map(t => {
                        const isUp = t.priceChangePercent >= 0
                        return (
                            <div key={t.symbol} className="flex items-center gap-1.5" title={`${t.symbol} 24h Change: ${t.priceChangePercent}%`}>
                                <span className="text-xs font-bold text-slate-300">{t.symbol.replace("USDT","")}</span>
                                <div className={`flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded ${isUp ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                    {isUp ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
                                    {Math.abs(t.priceChangePercent).toFixed(2)}%
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
