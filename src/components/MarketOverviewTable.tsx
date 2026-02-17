import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import type { CoinMarketData } from "@/api/coingecko"
import { getTopCoins } from "@/api/coingecko"
import { Activity } from "lucide-react"
import { CoinDetailModal } from "./CoinDetailModal"

export function MarketOverviewTable() {
    const [coins, setCoins] = useState<CoinMarketData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCoin, setSelectedCoin] = useState<CoinMarketData | null>(null)

    useEffect(() => {
        const fetchMarket = async () => {
            const data = await getTopCoins(20)
            if (data) setCoins(data)
            setLoading(false)
        }
        fetchMarket()
        // Refresh every 60s
        const interval = setInterval(fetchMarket, 60000)
        return () => clearInterval(interval)
    }, [])

    if (loading) return <div className="text-center text-muted-foreground p-10 animate-pulse">Loading Market Data...</div>

    return (
        <Card className="border-border bg-card/40 backdrop-blur-md">
            <CardHeader className="py-4 border-b border-border/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-500" />
                    Global Market Overview (Top 20)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/20">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead className="w-[200px]">Asset</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">1h %</TableHead>
                            <TableHead className="text-right">24h %</TableHead>
                            <TableHead className="text-right">7d %</TableHead>
                            <TableHead className="text-right hidden md:table-cell">Market Cap</TableHead>
                            <TableHead className="text-right hidden lg:table-cell">Volume (24h)</TableHead>
                            <TableHead className="text-right hidden xl:table-cell">Circulating Supply</TableHead>
                            <TableHead className="w-[150px] text-right">Last 7 Days</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coins.map((coin) => {
                            const isPositive = coin.price_change_percentage_24h_in_currency >= 0
                            const chartData = coin.sparkline_in_7d.price.map((p, i) => ({ value: p, index: i }))
                            const chartColor = coin.price_change_percentage_7d_in_currency >= 0 ? "#10b981" : "#ef4444"

                            return (
                                <TableRow 
                                    key={coin.id} 
                                    className="hover:bg-muted/10 border-border/50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedCoin(coin)}
                                >
                                    <TableCell className="font-mono text-muted-foreground text-xs">
                                        {coin.market_cap_rank}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                                            <div>
                                                <div className="font-bold">{coin.name}</div>
                                                <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium">
                                        ${coin.current_price.toLocaleString()}
                                    </TableCell>
                                    <TableCell className={`text-right font-mono text-sm ${coin.price_change_percentage_1h_in_currency >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                        {coin.price_change_percentage_1h_in_currency.toFixed(2)}%
                                    </TableCell>
                                    <TableCell className={`text-right font-mono text-sm ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                        {coin.price_change_percentage_24h_in_currency.toFixed(2)}%
                                    </TableCell>
                                    <TableCell className={`text-right font-mono text-sm ${coin.price_change_percentage_7d_in_currency >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                        {coin.price_change_percentage_7d_in_currency.toFixed(2)}%
                                    </TableCell>
                                    <TableCell className="text-right hidden md:table-cell font-mono text-muted-foreground text-sm">
                                        ${(coin.market_cap / 1e9).toFixed(2)}B
                                    </TableCell>
                                    <TableCell className="text-right hidden lg:table-cell font-mono text-muted-foreground text-sm">
                                        ${(coin.total_volume / 1e6).toFixed(0)}M
                                    </TableCell>
                                    <TableCell className="text-right hidden xl:table-cell font-mono text-muted-foreground text-sm">
                                        {(coin.circulating_supply / 1e6).toFixed(1)}M <span className="text-[10px] uppercase text-muted-foreground/50">{coin.symbol}</span>
                                    </TableCell>
                                    <TableCell className="p-0 pr-4">
                                        <div className="h-[40px] w-[120px] ml-auto">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData}>
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="value" 
                                                        stroke={chartColor} 
                                                        strokeWidth={2} 
                                                        dot={false} 
                                                    />
                                                    <YAxis domain={['dataMin', 'dataMax']} hide />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>

            <CoinDetailModal 
                isOpen={!!selectedCoin}
                onClose={() => setSelectedCoin(null)}
                coin={selectedCoin}
            />
        </Card>
    )
}
