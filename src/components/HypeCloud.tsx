import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, BarChart3, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getTopVolumeCoins, getTrendingCoins, type CoinMarketData, type TrendingCoin } from "@/api/coingecko"
import { ScrollArea } from "@/components/ui/scroll-area"

export function HypeCloud() {
    const [volumeCoins, setVolumeCoins] = useState<CoinMarketData[]>([])
    const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([])

    useEffect(() => {
        const load = async () => {
            const [vol, trend] = await Promise.all([
                getTopVolumeCoins(5),
                getTrendingCoins()
            ])
            setVolumeCoins(vol)
            setTrendingCoins(trend.slice(0, 5))
        }
        load()
    }, [])

    return (
        <Card className="h-full border-yellow-500/20 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.1)] flex flex-col overflow-hidden">
             <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-500 uppercase tracking-wider">
                    <Zap className="h-4 w-4" /> Market Hype & Volume
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 grid grid-cols-2 divide-x divide-white/10 min-h-0">
                {/* 1. Heavy Hitters (Volume) */}
                <div className="flex flex-col min-h-0">
                    <div className="bg-white/5 px-3 py-2 text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1 shrink-0">
                        <BarChart3 className="h-3 w-3" /> Top Volume (24h)
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="divide-y divide-white/5">
                            {volumeCoins.map((coin, i) => (
                                <div key={coin.id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-mono text-muted-foreground w-4">#{i+1}</div>
                                        <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-200 uppercase">{coin.symbol}</span>
                                            <span className="text-[10px] text-muted-foreground">${coin.current_price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-slate-300">
                                            ${(coin.total_volume / 1_000_000_000).toFixed(2)}B
                                        </div>
                                        <div className={`text-[10px] ${coin.price_change_percentage_24h_in_currency >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {coin.price_change_percentage_24h_in_currency?.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* 2. Social Trends */}
                <div className="flex flex-col min-h-0">
                     <div className="bg-white/5 px-3 py-2 text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1 shrink-0">
                        <TrendingUp className="h-3 w-3" /> Trending Search
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="divide-y divide-white/5">
                            {trendingCoins.map((coin, i) => (
                                <div key={coin.id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-mono text-muted-foreground w-4">#{i+1}</div>
                                        <img src={coin.thumb} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                                        <span className="text-xs font-bold text-slate-200 uppercase">{coin.symbol}</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground h-5">
                                        Rank #{coin.market_cap_rank}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    )
}
