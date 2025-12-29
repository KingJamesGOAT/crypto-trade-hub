import { useState, useEffect } from "react"
import { useSimulator } from "@/context/SimulatorContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BotConfiguration } from "@/components/BotConfiguration"
import { BotDashboard } from "@/components/BotDashboard"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, Activity, BrainCircuit, Layers } from "lucide-react"
import { useBinanceStream } from "@/hooks/useBinanceStream"
import axios from 'axios'
import { Progress } from "@/components/ui/progress"

const WATCHLIST_COINS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "SUIUSDT", "TRXUSDT", "LINKUSDT"]

// Helper for flashing numbers
function PriceDisplay({ price }: { price?: number }) {
    if (!price) return <span className="text-muted-foreground animate-pulse">Scanning...</span>
    return <span>${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
}

export function Simulator() {
    const { balance, updateBalance, portfolio } = useSimulator()
    const [fundAmount, setFundAmount] = useState<string>("")
    const [prices, setPrices] = useState<Record<string, number>>({})
    
    // Live Prices for ALL coins
    const { streamData } = useBinanceStream(WATCHLIST_COINS)

    const handleFund = async () => {
        if (!fundAmount) return
        const amount = parseFloat(fundAmount)
        await updateBalance(balance + amount)
        setFundAmount("")
    }

    // Update prices from stream
    useEffect(() => {
        if (streamData?.trade) {
            setPrices(prev => ({
                ...prev,
                [streamData.trade!.s]: parseFloat(streamData.trade!.p)
            }))
        }
    }, [streamData])

    // --- MARKET MOOD AI ---
    const [moodValue, setMoodValue] = useState(50);
    useEffect(() => {
        axios.get("https://api.alternative.me/fng/?limit=1")
        .then(res => {
            setMoodValue(parseInt(res.data.data[0].value));
        })
        .catch(() => setMoodValue(50));
    }, []);

    let moodColor = "bg-blue-500";
    let moodText = "Neutral";
    if (moodValue < 25) { moodColor = "bg-red-600"; moodText = "Extreme Fear"; }
    else if (moodValue < 45) { moodColor = "bg-orange-500"; moodText = "Fear"; }
    else if (moodValue > 75) { moodColor = "bg-green-600"; moodText = "Extreme Greed"; }
    else if (moodValue > 55) { moodColor = "bg-green-400"; moodText = "Greed"; }

    return (
        <div className="space-y-8 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    Simulator Dashboard
                </h2>
                <div className="flex items-center space-x-2">
                   {/* Actions if needed */}
                </div>
            </div>

            {/* Top Row: Wallet & Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Wallet Manager */}
                <Card className="lg:col-span-1 border-border bg-card shadow-sm">
                    <CardHeader className="pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                             <Wallet className="h-4 w-4" />
                             Wallet Balance
                         </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="text-3xl font-bold tracking-tight text-foreground">
                             ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                         </div>
                         <div className="flex gap-2 mt-4">
                             <Input 
                                 placeholder="Amount" 
                                 type="number" 
                                 className="h-8 bg-background border-input"
                                 value={fundAmount}
                                 onChange={(e) => setFundAmount(e.target.value)}
                             />
                             <Button size="sm" onClick={handleFund} className="h-8 px-3">
                                 Fund
                             </Button>
                         </div>
                    </CardContent>
                </Card>

                {/* 2. Sentiment AI */}
                <Card className="lg:col-span-1 border-border bg-card shadow-sm">
                    <CardHeader className="pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                             <BrainCircuit className="h-4 w-4" />
                             Market Sentiment AI
                         </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* FEAR & GREED VISUALIZER */}
                        <div className="space-y-1">
                             <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                 <span className={moodValue < 25 ? "text-red-500" : "text-muted-foreground"}>Fear</span>
                                 <span className={moodValue > 75 ? "text-green-500" : "text-muted-foreground"}>Greed</span>
                             </div>
                             <Progress value={moodValue} className="h-3" indicatorClassName={moodColor} />
                             <div className="flex justify-between items-center pt-1">
                                 <span className={`text-2xl font-bold ${moodColor.replace("bg-", "text-")}`}>
                                     {moodValue}
                                 </span>
                                 <div className="text-right">
                                     <span className="block text-xs font-bold text-foreground">
                                         {moodText}
                                     </span>
                                     <span className="block text-[10px] text-muted-foreground">
                                         {moodValue < 25 ? "Sniper Mode (Hi Risk)" : moodValue > 75 ? "Safety Mode (Tight SL)" : "Standard Mode"}
                                     </span>
                                 </div>
                             </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Bot Control */}
                <BotConfiguration />
            </div>

            {/* Middle Row: Active Portfolio */}
            <Card className="border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Active Positions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {portfolio.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <Layers className="h-10 w-10 mb-2" />
                            <p>No active trades. Waiting for entry...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border">
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
                                    const livePrice = prices[item.symbol] || item.avg_buy_price
                                    const entryPrice = item.avg_buy_price
                                    const amount = item.amount
                                    const pnlValue = (livePrice - entryPrice) * amount
                                    const pnlPercent = ((livePrice - entryPrice) / entryPrice) * 100
                                    const isProfit = pnlValue >= 0

                                    return (
                                        <TableRow key={item.symbol} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-bold text-lg">
                                                <Badge variant="outline" className="text-xs">
                                                    {item.symbol.replace("USDT","")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-muted-foreground">
                                                {amount.toFixed(4)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-muted-foreground">
                                                ${entryPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-bold animate-pulse text-foreground">
                                                ${livePrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className={`text-right font-mono font-bold ${isProfit ? "text-green-500" : "text-red-500"}`}>
                                                {isProfit ? "+" : ""}{pnlValue.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={`${isProfit ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-red-500/10 text-red-500 hover:bg-red-500/20"} border-0 font-mono`}>
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
                <Card className="lg:col-span-1 border-border bg-card h-[600px] flex flex-col shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Activity className="h-5 w-5 text-primary" />
                           Market Watch
                        </CardTitle>
                        <CardDescription>Live feed ({WATCHLIST_COINS.length} Coins)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
                                <TableRow className="hover:bg-transparent border-border">
                                    <TableHead>Asset</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Observed</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {WATCHLIST_COINS.map(symbol => {
                                    const isOwned = portfolio.some(p => p.symbol === symbol)
                                    return (
                                        <TableRow key={symbol} className="hover:bg-muted/50 border-border">
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
