import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gauge, Globe, TrendingUp, TrendingDown } from "lucide-react"
import { getGlobalMarketData } from "@/api/coingecko"

export function FearMeter({ sentiment = 50 }: { sentiment?: number }) {
    const [marketConfig, setMarketConfig] = useState<{cap: number, change: number} | null>(null)

    useEffect(() => {
        const load = async () => {
            const data = await getGlobalMarketData()
            if (data) {
                setMarketConfig({
                    cap: data.total_market_cap.usd,
                    change: data.market_cap_change_percentage_24h_usd
                })
            }
        }
        load()
    }, [])

    // Determine color based on sentiment (0-100)
    let color = "bg-yellow-500";
    let textColor = "text-yellow-500";
    let label = "Neutral";
    
    if (sentiment < 25) { color = "bg-red-600"; textColor = "text-red-500"; label = "Extreme Fear"; }
    else if (sentiment < 45) { color = "bg-orange-500"; textColor = "text-orange-500"; label = "Fear"; }
    else if (sentiment > 75) { color = "bg-emerald-500"; textColor = "text-emerald-500"; label = "Extreme Greed"; }
    else if (sentiment > 55) { color = "bg-green-400"; textColor = "text-green-400"; label = "Greed"; }

    return (
        <Card className="h-full border-indigo-500/20 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.1)] flex flex-col">
             <CardHeader className="pb-2 border-b border-white/5 bg-white/5">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-400 uppercase tracking-wider">
                    <Gauge className="h-4 w-4" /> Market Pulse
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 grid grid-cols-2 divide-x divide-white/10 p-0">
                {/* 1. Fear & Greed */}
                <div className="flex flex-col items-center justify-center p-4">
                    <div className="text-3xl font-bold text-white mb-1">{sentiment}</div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textColor}`}>{label}</div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${color} transition-all duration-1000 ease-out`} 
                            style={{ width: `${sentiment}%` }}
                        />
                    </div>
                </div>

                {/* 2. Global Market Cap */}
                <div className="flex flex-col items-center justify-center p-4">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Total Market Cap
                    </div>
                    {marketConfig ? (
                        <>
                            <div className="text-xl font-bold text-white tabular-nums">
                                ${(marketConfig.cap / 1_000_000_000_000).toFixed(2)}T
                            </div>
                            <div className={`text-xs font-bold flex items-center gap-1 mt-1 ${marketConfig.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {marketConfig.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {Math.abs(marketConfig.change).toFixed(2)}%
                            </div>
                        </>
                    ) : (
                         <div className="text-xs text-muted-foreground animate-pulse">Scanning...</div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
