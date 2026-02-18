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
import { Wallet, Activity, Layers, Coins, RotateCcw, Loader2 } from "lucide-react"
import { useBinanceStream } from "@/hooks/useBinanceStream"
import { TrendBias } from "@/components/TrendBias"

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
                {/* Trend Bias Widget */}
                <div className="hidden md:block">
                    <TrendBias />
                </div>
            </div>

            {/* CONTROL PANEL ROW */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* 1. Wallet Balance (4 cols) */}
                <Card className="md:col-span-4 border-emerald-500/20 bg-black/40 backdrop-blur-md shadow-lg flex flex-col justify-center overflow-hidden h-full">
                    <div className="p-6 space-y-4">
                        <div>
                            <div className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest flex items-center gap-2 mb-1">
                                <Wallet className="h-3 w-3 text-emerald-500" /> Available Balance
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-white tabular-nums flex items-baseline gap-1">
                                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                <span className="text-sm font-normal text-muted-foreground">USDT</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                             <Input 
                                placeholder="Add..." 
                                type="number" 
                                className="h-9 flex-1 bg-white/5 border-white/10 text-xs font-mono focus-visible:ring-0 px-3"
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                            />
                            <Button size="icon" onClick={handleFund} className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shrink-0" title="Deposit">
                                <span className="text-lg leading-none pb-1">+</span>
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => updateBalance(10000)} className="h-9 w-9 text-muted-foreground hover:text-white rounded-md shrink-0" title="Reset">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* 2. Bot Status (4 cols) */}
                <Card className="md:col-span-4 border-emerald-500/20 bg-black/40 backdrop-blur-md shadow-lg flex flex-col justify-center overflow-hidden h-full"> 
                    <div className="p-6 space-y-4">
                        <div>
                            <div className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest flex items-center gap-2 mb-1">
                                <Activity className="h-3 w-3 text-blue-500" /> System Status
                            </div>
                            <div className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isBotActive ? "text-green-400" : "text-amber-400"}`}>
                                <div className={`h-2.5 w-2.5 rounded-full ${isBotActive ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-amber-500"}`} />
                                {isBotActive ? "SYSTEM ONLINE" : "STANDBY MODE"}
                            </div>
                        </div>

                        <Button 
                            className={`w-full h-9 font-bold tracking-wider transition-all shadow-lg ${
                                isBotActive 
                                    ? "bg-red-500/80 hover:bg-red-500 text-white border border-red-400/20" 
                                    : "bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-400/20"
                            }`}
                            onClick={toggleBot}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                isBotActive ? "STOP ENGINE" : "START ENGINE"
                            )}
                        </Button>
                    </div>
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
                <div className="p-0 flex-1 flex flex-col">
                    {portfolio.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-muted-foreground/50">
                            <Activity className="h-12 w-12 mb-3 animate-pulse text-blue-500/50" />
                            <p className="font-mono text-sm uppercase tracking-widest">Awaiting Entry Signals...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-xs uppercase font-mono text-muted-foreground">Asset</TableHead>
                                    <TableHead className="text-right text-xs uppercase font-mono text-muted-foreground">Size</TableHead>
                                    <TableHead className="text-right text-xs uppercase font-mono text-muted-foreground">Invested</TableHead>
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
                                    const invested = amount * entryPrice
                                    const pnlValue = (livePrice - entryPrice) * amount
                                    const pnlPercent = ((livePrice - entryPrice) / entryPrice) * 100
                                    const isProfit = pnlValue >= 0

                                    // Generate "Smart Audit" derived from state
                                    const isTrailing = pnlPercent > 6
                                    const stopLoss = item.stop_loss
                                    const auditReason = isTrailing 
                                        ? `🚀 MOON BAG MODE: Profit locked. Trailing stop active at $${stopLoss.toFixed(4)}. Riding the wave until structure breaks.`
                                        : `🛡️ DEFENSE MODE: Holding position. Price is ${Math.abs(pnlPercent).toFixed(1)}% from entry. Stop Loss set at $${stopLoss.toFixed(4)}.`

                                    const tradeData = {
                                        symbol: item.symbol,
                                        entryPrice,
                                        currentPrice: livePrice,
                                        amount,
                                        pnl: pnlValue,
                                        pnlPercent,
                                        reasoning: auditReason,
                                        confidence: isTrailing ? "VERY HIGH" : "NORMAL"
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
                                            <TableCell className="text-right text-blue-300">
                                                ${invested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                ${entryPrice.toFixed(4)}
                                            </TableCell>
                                            <TableCell className="text-right text-white">
                                                ${livePrice.toFixed(4)}
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
                                {/* Merge Watchlist with Portfolio Holdings not in watchlist */}
                                {Array.from(new Set([...WATCHLIST_COINS, ...portfolio.map(p => p.symbol)])).map(symbol => {
                                    const portfolioItem = portfolio.find(p => p.symbol === symbol)
                                    const isOwned = !!portfolioItem
                                    // Use portfolio avg price if we don't have stream data yet
                                    const price = prices[symbol] || (isOwned ? portfolioItem.avg_buy_price : 0)
                                    const pnlPercent = isOwned && price ? ((price - portfolioItem.avg_buy_price) / portfolioItem.avg_buy_price) * 100 : 0
                                    const isProfit = pnlPercent >= 0

                                    return (
                                        <TableRow key={symbol} className="hover:bg-white/5 border-white/5 font-mono text-xs">
                                            <TableCell className="font-medium text-white/70 relative">
                                                {symbol.replace("USDT", "")}
                                                {isOwned && (
                                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                <PriceDisplay price={price} />
                                            </TableCell>
                                            <TableCell className="text-right w-16">
                                                {isOwned && (
                                                    <Badge variant="outline" className={`text-[9px] h-5 px-1 border-0 ${isProfit ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                                        {pnlPercent > 0 ? "+" : ""}{pnlPercent.toFixed(1)}%
                                                    </Badge>
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
