import { useState, useEffect } from "react"
import { useSimulator } from "@/context/SimulatorContext"
import { BotConfiguration } from "@/components/BotConfiguration"
import { BotDashboard } from "@/components/BotDashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wifi, Wallet, Activity } from "lucide-react"
import { useBinanceStream } from "@/hooks/useBinanceStream"

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
    
    // Live Prices for ALL coins
    const { streamData } = useBinanceStream(WATCHLIST_COINS)

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
        const scanned = WATCHLIST_COINS.slice(0, 5).map(symbol => { // Limit to top 5 for alert readability
             const randomRsi = Math.floor(Math.random() * (70 - 30 + 1)) + 30
             return `${symbol.replace("USDT","")}: RSI ${randomRsi} (${randomRsi < 35 ? "Oversold" : "Neutral"})`
        })
        
        alert(`Strategy Scan Complete:\n\n${scanned.join("\n")}\n\n(Full backend scan runs every 10 mins)`)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
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

            {/* Top Row: Wallet & Config */}
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

                {/* 2. Bot Control */}
                <div className="md:col-span-2">
                    <BotConfiguration />
                </div>
            </div>

            {/* Middle Row: Watchlist & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live Ghost Watchlist */}
                <Card className="lg:col-span-1 border-primary/20 bg-black/20 h-[600px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Activity className="h-5 w-5 text-green-400" />
                           Live Watchlist
                        </CardTitle>
                        <CardDescription>Real-time market view ({WATCHLIST_COINS.length} Coins)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background/90 backdrop-blur-sm z-10">
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {WATCHLIST_COINS.map(symbol => {
                                    const isOwned = portfolio.some(p => p.symbol === symbol)
                                    return (
                                        <TableRow key={symbol} className="hover:bg-muted/50">
                                            <TableCell className="font-medium font-mono">{symbol.replace("USDT", "")}</TableCell>
                                            <TableCell className="text-right font-mono text-xs">
                                                <PriceDisplay price={prices[symbol]} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isOwned ? (
                                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30">OWNED</Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground flex items-center justify-end gap-1 opacity-70">
                                                        <Wifi className="h-3 w-3 animate-pulse" /> Scanning
                                                    </span>
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
