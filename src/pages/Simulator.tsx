import { useState, useEffect } from "react"
import { useSimulator } from "@/context/SimulatorContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiveTerminal } from "@/components/LiveTerminal"
import { MarketIntelligence } from "@/components/MarketIntelligence"
import { SignalCard } from "@/components/SignalCard"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, Activity, Layers, Coins } from "lucide-react"
import { useBinanceStream } from "@/hooks/useBinanceStream"

const WATCHLIST_COINS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "SUIUSDT", "TRXUSDT", "LINKUSDT"]

// Helper for flashing numbers
function PriceDisplay({ price }: { price?: number }) {
    if (!price) return <span className="text-muted-foreground animate-pulse text-[10px]">Scanning...</span>
    return <span>${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
}

export function Simulator() {
    const { balance, updateBalance, portfolio, isBotActive, toggleBot, isLoading } = useSimulator()
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

    return (
        <div className="space-y-6 p-4 md:p-8 pt-6 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white uppercase font-mono border-l-4 border-green-500 pl-4">
                        Ghost Command Center
                    </h2>
                    <p className="text-xs text-muted-foreground pl-4 font-mono">
                        System Online | v.2.0.0 | Connected to Neural Net
                    </p>
                </div>
            </div>

            {/* CONTROL PANEL ROW */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* 1. Unified Control Panel (8 cols) */}
                <Card className="md:col-span-8 border-emerald-500/20 bg-black/40 backdrop-blur-md shadow-lg flex flex-col justify-center">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        
                        {/* Wallet Section */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/10 rounded-full">
                                    <Wallet className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Wallet Balance</div>
                                    <div className="text-3xl font-bold tracking-tight text-white tabular-nums">
                                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-white/10 hidden md:block" />

                            <div className="flex items-center gap-2">
                                <Input 
                                    placeholder="Amount..." 
                                    type="number" 
                                    className="h-9 w-32 bg-white/5 border-white/10 text-xs font-mono"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                />
                                <Button size="sm" onClick={handleFund} className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs">
                                    Deposit
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => updateBalance(10000)}
                                    className="h-9 border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white font-mono text-xs"
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>

                        {/* Bot Toggle Section */}
                        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-lg border border-white/5">
                            <div className="text-right hidden lg:block">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold">Bot Status</div>
                                <div className={`text-xs font-mono ${isBotActive ? "text-green-400" : "text-amber-400"}`}>
                                    {isBotActive ? "ACTIVE & SCANNING" : "STANDBY MODE"}
                                </div>
                            </div>
                            <Button 
                                size="sm"
                                variant={isBotActive ? "destructive" : "default"}
                                onClick={toggleBot}
                                disabled={isLoading}
                                className={`h-10 px-6 font-bold tracking-wider transition-all ${
                                    isBotActive 
                                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50" 
                                        : "bg-green-500 hover:bg-green-400 text-black"
                                }`}
                            >
                                {isLoading ? "SYNCING..." : (isBotActive ? "STOP ENGINE" : "START ENGINE")}
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                {/* 2. Market Intelligence (4 cols) - kept as is but resized */}
                <div className="md:col-span-4 h-full">
                    <MarketIntelligence />
                </div>
            </div>

            {/* MIDDLE ROW: Active Positions */}
            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden min-h-[300px]">
                <div className="bg-white/5 border-b border-white/5 py-3 px-6">
                    <h3 className="flex items-center gap-2 text-sm text-white font-mono uppercase tracking-wider">
                        <Layers className="h-4 w-4 text-blue-400" />
                        Active Vector Allocations
                    </h3>
                </div>
                <div className="p-0">
                    {portfolio.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground opacity-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                            <Activity className="h-10 w-10 mb-2 animate-pulse text-blue-500" />
                            <p className="font-mono text-xs">Awaiting Entry Signals...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-xs uppercase font-mono text-muted-foreground">Asset</TableHead>
                                    <TableHead className="text-right text-xs uppercase font-mono text-muted-foreground">Size</TableHead>
                                    <TableHead className="text-right text-xs uppercase font-mono text-muted-foreground">Entry</TableHead>
                                    <TableHead className="text-right text-xs uppercase font-mono text-muted-foreground">Mark</TableHead>
                                    <TableHead className="text-right text-xs uppercase font-mono text-muted-foreground">PnL</TableHead>
                                    <TableHead className="text-right text-xs uppercase font-mono text-muted-foreground">ROI</TableHead>
                                    <TableHead className="text-right text-xs uppercase font-mono text-muted-foreground">Audit</TableHead>
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

                                    // Mock data for legacy trades if not available
                                    const tradeData = {
                                        symbol: item.symbol,
                                        entryPrice,
                                        currentPrice: livePrice,
                                        amount,
                                        pnl: pnlValue,
                                        pnlPercent,
                                        reasoning: "Price bounced off the 200 EMA while Stochastic RSI was oversold (<20). Confirmed by volume spike.",
                                        confidence: "HIGH"
                                    }

                                    return (
                                        <TableRow key={item.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors font-mono text-xs">
                                            <TableCell className="font-bold">
                                                <Badge variant="outline" className="text-[10px] border-white/20 bg-white/5 text-white">
                                                    {item.symbol.replace("USDT","")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {amount.toFixed(4)}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                ${entryPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right text-white">
                                                ${livePrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${isProfit ? "text-green-500" : "text-red-500"}`}>
                                                {isProfit ? "+" : ""}{pnlValue.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={`${isProfit ? "text-green-400" : "text-red-400"}`}>
                                                    {pnlPercent.toFixed(2)}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <SignalCard trade={tradeData} />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            {/* BOTTOM ROW: Terminal & Watchlist */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px]">
                
                {/* Live Terminal (8 cols) */}
                <div className="lg:col-span-8 h-full">
                    <LiveTerminal />
                </div>

                {/* Live Watchlist (4 cols) */}
                <Card className="lg:col-span-4 border-white/10 bg-black/40 backdrop-blur-md h-full flex flex-col shadow-sm">
                    <CardHeader className="py-3 border-b border-white/5 bg-white/5">
                        <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-mono tracking-wider">
                           <Coins className="h-4 w-4" />
                           Scanner Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <Table>
                            <TableBody>
                                {WATCHLIST_COINS.map(symbol => {
                                    const isOwned = portfolio.some(p => p.symbol === symbol)
                                    return (
                                        <TableRow key={symbol} className="hover:bg-white/5 border-white/5 font-mono text-xs">
                                            <TableCell className="font-medium text-white/70">{symbol.replace("USDT", "")}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                <PriceDisplay price={prices[symbol]} />
                                            </TableCell>
                                            <TableCell className="text-right w-8">
                                                {isOwned && (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)] mx-auto" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
