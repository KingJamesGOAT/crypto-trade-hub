import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, BarChart3, TrendingUp, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getTopVolumeCoins, getTrendingCoins, getSimplePrice, type CoinMarketData, type TrendingCoin } from "@/api/coingecko"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSimulator } from "@/context/SimulatorContext"

// The 11 Bot Targets + IDs + known working logo URLs
const SCOUT_TARGETS: { symbol: string; id: string; logo: string }[] = [
    { symbol: "BTC", id: "bitcoin",       logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
    { symbol: "ETH", id: "ethereum",      logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
    { symbol: "SOL", id: "solana",        logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
    { symbol: "BNB", id: "binancecoin",   logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
    { symbol: "XRP", id: "ripple",        logo: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
    { symbol: "ADA", id: "cardano",       logo: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
    { symbol: "DOGE", id: "dogecoin",     logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
    { symbol: "AVAX", id: "avalanche-2",  logo: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
    { symbol: "SUI",  id: "sui",          logo: "https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png" },
    { symbol: "TRX",  id: "tron",         logo: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png" },
    { symbol: "LINK", id: "chainlink",    logo: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png" }
]

// Known logo URLs for coins that may be bought but aren't in the main 11
const EXTRA_LOGOS: Record<string, string> = {
    "PENGU": "https://assets.coingecko.com/coins/images/42130/small/pudgy.jpg",
    "HYPE":  "https://assets.coingecko.com/coins/images/40845/small/hyperliquid.jpeg",
    "PEPE":  "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
    "WIF":   "https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg",
    "BONK":  "https://assets.coingecko.com/coins/images/28600/small/bonk.jpg",
    "SHIB":  "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
    "MATIC": "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
    "DOT":   "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
    "NEAR":  "https://assets.coingecko.com/coins/images/10365/small/near.jpg",
    "FTM":   "https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png",
    "ARB":   "https://assets.coingecko.com/coins/images/16547/small/arb.jpg",
    "OP":    "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
    "APT":   "https://assets.coingecko.com/coins/images/26455/small/aptos_round.png",
    "INJ":   "https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png",
    "RENDER":"https://assets.coingecko.com/coins/images/11636/small/rndr.png",
    "FET":   "https://assets.coingecko.com/coins/images/5681/small/Fetch.jpg",
}

export function HypeCloud() {
    const { portfolio } = useSimulator()
    const [volumeCoins, setVolumeCoins] = useState<CoinMarketData[]>([])
    const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([])
    const [scoutPrices, setScoutPrices] = useState<Record<string, any>>({})
    const failedImgs = useRef<Set<string>>(new Set())

    // Fetch volume + trending once on mount
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

    // Fetch scout prices on mount + every 60s
    useEffect(() => {
        const fetchPrices = async () => {
            const ownedSymbols = portfolio.map(p => p.symbol.replace("USDT",""))
            const extraOwned = ownedSymbols.filter(s => !SCOUT_TARGETS.find(t => t.symbol === s))
            const extraTargets = extraOwned.map(s => ({ symbol: s, id: s.toLowerCase() }))
            const allIds = [...SCOUT_TARGETS.map(t => t.id), ...extraTargets.map(t => t.id)]

            const priceData = await getSimplePrice(allIds)
            if (priceData) setScoutPrices(priceData)
        }
        fetchPrices()
        const interval = setInterval(fetchPrices, 60000)
        return () => clearInterval(interval)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Helper to render coin item
    const renderCoinItem = (symbol: string, id: string, logoUrl: string) => {
        const portfolioItem = portfolio.find(p => p.symbol === `${symbol}USDT`)
        const isOwned = !!portfolioItem
        const data = scoutPrices[id]

        // Border + text colors
        let borderClass = "border-white/10"
        let textClass = "text-muted-foreground"

        if (isOwned) {
            if (data) {
                const entry = portfolioItem.avg_buy_price
                const current = data.usd
                const isProfit = current >= entry
                borderClass = isProfit ? "border-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" : "border-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]"
                textClass = isProfit ? "text-green-500" : "text-red-500"
            } else {
                // Owned but no price data yet — show blue as "active"
                borderClass = "border-blue-500"
                textClass = "text-blue-400"
            }
        }

        return (
            <div key={symbol} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center overflow-hidden border-2 ${borderClass} bg-black/30 transition-all duration-300 relative`}>
                    <img
                        src={logoUrl}
                        alt={symbol}
                        className="h-9 w-9 object-contain relative z-10"
                        onError={(e) => {
                            const img = e.target as HTMLImageElement
                            if (!failedImgs.current.has(symbol)) {
                                failedImgs.current.add(symbol)
                                img.src = `https://coinicons-api.vercel.app/api/icon/${symbol.toLowerCase()}`
                            } else {
                                img.style.display = 'none'
                            }
                        }}
                    />
                </div>
                <span className={`text-[10px] font-mono font-bold ${textClass}`}>
                    {symbol}
                </span>
            </div>
        )
    }

    return (
        <Card className="h-full border-yellow-500/20 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.1)] flex flex-col overflow-hidden">
             <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-500 uppercase tracking-wider">
                    <Zap className="h-4 w-4" /> Market Hype & Volume
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">

                {/* 0. ACTIVE SCOUT TARGETS (Horizontal Row) */}
                <div className="border-b border-white/10 bg-white/2 p-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase text-muted-foreground font-bold mb-2">
                        <Target className="h-3 w-3 text-green-500" /> Active Scout Targets
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                        {/* 1. Main Scout Targets */}
                        {SCOUT_TARGETS.map(t => renderCoinItem(t.symbol, t.id, t.logo))}

                        {/* 2. Extra Owned — coins held that are NOT in the 11 */}
                        {portfolio.filter(p => !SCOUT_TARGETS.some(t => t.symbol === p.symbol.replace("USDT",""))).map(p => {
                            const sym = p.symbol.replace("USDT","")
                            const logo = EXTRA_LOGOS[sym] || `https://coinicons-api.vercel.app/api/icon/${sym.toLowerCase()}`
                            return renderCoinItem(sym, sym.toLowerCase(), logo)
                        })}
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-2 divide-x divide-white/10 min-h-0">
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
                </div>
            </CardContent>
        </Card>
    )
}
