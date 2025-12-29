import { useState, useEffect, useMemo } from "react"
import { useSimulator } from "@/context/SimulatorContext"
import { BotConfiguration } from "@/components/BotConfiguration"
import { BotDashboard } from "@/components/BotDashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wallet, Activity, TrendingUp, TrendingDown, BrainCircuit } from "lucide-react"
import { useBinanceStream } from "@/hooks/useBinanceStream"
import { Progress } from "@/components/ui/progress"

const WATCHLIST_COINS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "SUIUSDT", "TRXUSDT", "LINKUSDT"]

// Helper Component to display price from the parent's shared state
function PriceDisplay({ price }: { price: number | undefined }) {
    if (!price) return <span className="text-muted-foreground animate-pulse">---</span>
    return <span className="text-blue-300 font-mono">${price.toFixed(2)}</span>
}

export function Simulator() {
    const { balance, updateBalance, portfolio } = useSimulator()
    const [fundAmount, setFundAmount] = useState<string>("")
    const [prices, setPrices] = useState<Record<string, number>>({})
    
    // Market Sentiment State
    const [marketMood, setMarketMood] = useState<{ value: string, value_classification: string } | null>(null)

    // Fetch Market Mood
    useEffect(() => {
        const fetchMood = async () => {
            try {
                const res = await fetch("https://api.alternative.me/fng/?limit=1")
                const data = await res.json()
                if (data.data && data.data.length > 0) {
                    setMarketMood(data.data[0])
                }
            } catch (e) {
                console.error("Failed to fetch market mood", e)
            }
        }
        fetchMood()
    }, [])
    
    // Combine Watchlist + Portfolio for streaming
    const activeSymbols = useMemo(() => {
        const portSymbols = portfolio.map(p => p.symbol)
        return Array.from(new Set([...WATCHLIST_COINS, ...portSymbols]))
    }, [portfolio])

    // Live Prices for ALL coins
    const { streamData } = useBinanceStream(activeSymbols)

    // Sync stream data to local map
    useEffect(() => {
        if (streamData?.trade) {
            setPrices(prev => ({
                ...prev,
                [streamData.trade!.s]: parseFloat(streamData.trade!.p)
            }))
        }
    }, [streamData])

    const handleAddFunds = () => {
        const amount = parseFloat(fundAmount)
        if (isNaN(amount) || amount <= 0) return
        updateBalance(balance + amount)
        setFundAmount("")
    }

    const handleRunStrategy = () => {
        // Mock Strategy Check for Client Side Feedback
        const scanned = WATCHLIST_COINS.map(symbol => { // Scan all coins
             const randomRsi = Math.floor(Math.random() * (70 - 30 + 1)) + 30
             return `${symbol.replace("USDT","")}: RSI ${randomRsi} (${randomRsi < 35 ? "Oversold" : "Neutral"})`
        })
        
        alert(`Strategy Scan Complete:\n\n${scanned.join("\n")}\n\n(Full backend scan runs every 10 mins)`)
    }

    // Determine Sentiment Colors
    const moodValue = marketMood ? parseInt(marketMood.value) : 50
    let moodColor = "bg-blue-500"
    let moodTextColor = "text-blue-400"
    
    if (moodValue < 25) {
        moodColor = "bg-red-500" // Extreme Fear
        moodTextColor = "text-red-400"
    } else if (moodValue > 75) {
        moodColor = "bg-green-500" // Extreme Greed
        moodTextColor = "text-green-400"
    } else {
        moodColor = "bg-yellow-500" // Neutral
        moodTextColor = "text-yellow-400"
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Ghost Bot Simulator
                    </h1>
                    <p className="text-muted-foreground mt-1">Server-side autonomous trading & manual control</p>
                </div>
                <div className="flex gap-4 items-center">
                    <Button variant="outline" onClick={handleRunStrategy}>
                        <Activity className="mr-2 h-4 w-4" /> Run Strategy Check
                    </Button>
                </div>
            </div>

            {/* Top Row: Wallet, Sentiment & Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Wallet Manager */}
                <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Wallet className="h-5 w-5 text-blue-400" />
                            Wallet Manager
                        </CardTitle>
                        <CardDescription>Inject fake USDT capital</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-xs text-muted-foreground uppercase font-bold">Available Capital</span>
                            <div className="text-3xl font-mono font-bold text-white">
                                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                placeholder="Amount (e.g. 10000)" 
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                                className="font-mono bg-background/50"
                            />
                            <Button onClick={handleAddFunds} disabled={!fundAmount || parseFloat(fundAmount) <= 0}>Add</Button>
                        </div>
                    </CardContent>
                </Card>

                 {/* 2. NEW: Market Sentiment AI */}
                 <Card className="border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col justify-center">
                    <CardHeader className="pb-2">
                         <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className={`h-5 w-5 ${moodTextColor}`} />
                            Market Sentiment AI
                         </CardTitle>
                         <CardDescription>Visualizing Global Fear & Greed</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {marketMood ? (
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className={`text-4xl font-bold ${moodTextColor}`}>{marketMood.value}</span>
                                    <span className="text-sm text-muted-foreground uppercase font-mono tracking-wider mb-1">{marketMood.value_classification}</span>
                                </div>
                                <Progress value={parseInt(marketMood.value)} className={`h-3 bg-secondary ${moodColor.replace("bg-", "text-")}`} indicatorClassName={moodColor} />
                                <p className="text-xs text-muted-foreground pt-1">
                                    {moodValue < 25 ? "Use Sniper Mode (Buy Dips)" : moodValue > 75 ? "Use Caution (Tighten Stops)" : "Standard Strategy Active"}
                                </p>
                            </div>
                        ) : (
                            <div className="h-[88px] flex items-center justify-center animate-pulse">
                                <span className="text-muted-foreground">Analysing Market...</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Bot Control */}
                <div className="md:col-span-1">
                    <BotConfiguration />
                </div>
            </div>

            {/* Middle Section: Active Positions (High Visibility) */}
            <Card className="border-primary/20 bg-black/40 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-white">
                        <TrendingUp className="h-6 w-6 text-green-400" />
                        Active Portfolio
                    </CardTitle>
                    <CardDescription>Real-time performance of open positions</CardDescription>
                </CardHeader>
                <CardContent>
                    {portfolio.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-2 font-mono">
                            <TrendingDown className="h-8 w-8 opacity-20" />
                            Waiting for entries...
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Entry Price</TableHead>
                                    <TableHead className="text-right">Live Price</TableHead>
                                    <TableHead className="text-right">PnL ($)</TableHead>
                                    <TableHead className="text-right">PnL (%)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {portfolio.map((item) => {
                                    const livePrice = prices[item.symbol] || item.avg_buy_price // fallback to entry if loading
                                    const entryPrice = item.avg_buy_price
                                    const amount = item.amount
                                    const pnlValue = (livePrice - entryPrice) * amount
                                    const pnlPercent = ((livePrice - entryPrice) / entryPrice) * 100
                                    const isProfit = pnlValue >= 0

                                    return (
                                        <TableRow key={item.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-bold text-lg flex items-center gap-2">
                                                {/* Mock Icon or just Text */}
                                                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                                                    {item.symbol.replace("USDT","")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-muted-foreground">
                                                {amount.toFixed(4)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-muted-foreground">
                                                ${entryPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-white text-lg animate-pulse">
                                                ${livePrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className={`text-right font-mono font-bold ${isProfit ? "text-green-400" : "text-red-400"}`}>
                                                {isProfit ? "+" : ""}{pnlValue.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={`${isProfit ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"} border-0 font-mono`}>
                                                    {isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Bottom Row: Watchlist & Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live Watchlist */}
                <Card className="lg:col-span-1 border-primary/20 bg-black/20 h-[600px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Activity className="h-5 w-5 text-blue-400" />
                           Market Watch
                        </CardTitle>
                        <CardDescription>Live feed ({WATCHLIST_COINS.length} Coins)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background/90 backdrop-blur-sm z-10">
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Observed</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {WATCHLIST_COINS.map(symbol => {
                                    const isOwned = portfolio.some(p => p.symbol === symbol)
                                    return (
                                        <TableRow key={symbol} className="hover:bg-muted/50 border-white/5">
                                            <TableCell className="font-medium font-mono text-sm">{symbol.replace("USDT", "")}</TableCell>
                                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                                <PriceDisplay price={prices[symbol]} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isOwned && (
                                                    <div className="flex justify-end">
                                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Dashboard & Logs */}
                <div className="lg:col-span-2">
                    <BotDashboard />
                </div>
            </div>
        </div>
    )
}
