import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Candle, BacktestResult, StrategyConfig } from "@/types/backtest"
import { runBacktest } from "@/lib/backtest-engine"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2, TrendingUp, Info } from "lucide-react"
import { getTopCoins, type CoinMarketData, getCoinCandles } from "@/api/coingecko"
import { cn } from "@/lib/utils"

export function Backtest() {
  const [activeTab, setActiveTab] = useState("dca")
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  
  // Data Sources
  const [coins, setCoins] = useState<CoinMarketData[]>([])
  const [selectedCoinId, setSelectedCoinId] = useState<string>("")
  const [loadingCoins, setLoadingCoins] = useState(false)
  
  // Params
  const [duration, setDuration] = useState("365")
  
  // Strategy Params
  const [dcaAmount, setDcaAmount] = useState("50")
  const [gridLevels, setGridLevels] = useState("20")
  const [momentumShort, setMomentumShort] = useState("9")
  const [momentumLong, setMomentumLong] = useState("21")

  // Load Coins on Mount
  useEffect(() => {
     async function load() {
         setLoadingCoins(true)
         const data = await getTopCoins(50)
         if (data && data.length > 0) {
             setCoins(data)
             setSelectedCoinId(data[0].id)
         } else {
             // Fallback if API fails?
         }
         setLoadingCoins(false)
     }
     load()
  }, [])

  const handleRunBacktest = async () => {
    if (!selectedCoinId) return
    setIsRunning(true)
    setResult(null)

    try {
        // Fetch Real History
        const days = parseInt(duration)
        const history = await getCoinCandles(selectedCoinId, days)
        
        if (!history || history.length === 0) {
            alert("Failed to fetch historical data for this coin.")
            setIsRunning(false)
            return
        }

        const candleData: Candle[] = history.map(h => ({
            time: h.time,
            open: h.open,
            high: h.high,
            low: h.low,
            close: h.close,
            volume: 0 // Not used yet
        }))
        
        // Prepare Config
        let config: StrategyConfig

        if (activeTab === "dca") {
            config = {
                id: "test",
                type: "DCA",
                initialCapital: 10000,
                buyAmount: parseFloat(dcaAmount),
                frequencyDays: 1
            }
        } else if (activeTab === "grid") {
            const min = Math.min(...candleData.map(c => c.low))
            const max = Math.max(...candleData.map(c => c.high))
            config = {
                id: "test",
                type: "Grid",
                initialCapital: 10000,
                lowerBound: min,
                upperBound: max,
                grids: parseInt(gridLevels)
            }
        } else {
            config = {
                id: "test",
                type: "Momentum",
                initialCapital: 10000,
                shortPeriod: parseInt(momentumShort),
                longPeriod: parseInt(momentumLong)
            }
        }

        // Run Engine
        const res = runBacktest(candleData, config)
        setResult(res)

    } catch (e) {
        console.error(e)
        alert("An error occurred during backtesting.")
    } finally {
        setIsRunning(false)
    }
  }

  // Helper to format currency
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 })

  // Prepare chart data with benchmark
  const chartData = result ? result.equityCurve.map((p) => {
      // We don't have benchmark history daily here easily without recalculating it. 
      // For now, just Strategy.
      return {
          time: p.time,
          strategy: p.value,
      }
  }) : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Strategy Backtester</h2>
        <p className="text-muted-foreground">
            Test trading strategies against <strong>Real Historical Data</strong> from the Top 50 Cryptocurrencies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CONFIGURATION */}
        <Card className="lg:col-span-1 h-fit border-border">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Setup simulation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             
             {/* Coin Selector */}
             <div className="space-y-2">
                <Label>Rank Asset</Label>
                <Select value={selectedCoinId} onValueChange={setSelectedCoinId} disabled={loadingCoins || coins.length === 0}>
                   <SelectTrigger>
                      <SelectValue placeholder={loadingCoins ? "Loading..." : "Select Coin"} />
                   </SelectTrigger>
                   <SelectContent className="max-h-[300px]">
                      {coins.map(coin => (
                          <SelectItem key={coin.id} value={coin.id}>
                              <div className="flex items-center gap-2">
                                  <img src={coin.image} alt={coin.name} className="w-4 h-4 rounded-full" />
                                  <span>{coin.name}</span>
                              </div>
                          </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>

             <div className="space-y-2">
                <Label>Duration (History)</Label>
                <Select value={duration} onValueChange={setDuration}>
                   <SelectTrigger>
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                      <SelectItem value="180">Last 180 Days</SelectItem>
                      <SelectItem value="365">Last 365 Days</SelectItem>
                   </SelectContent>
                </Select>
             </div>

             <div className="space-y-4 pt-4 border-t border-border">
                 <Label className="text-base">Strategy Settings</Label>
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3">
                       <TabsTrigger value="dca">DCA</TabsTrigger>
                       <TabsTrigger value="grid">Grid</TabsTrigger>
                       <TabsTrigger value="momentum">Momentum</TabsTrigger>
                    </TabsList>
                 </Tabs>
                 
                 {/* Strategy Description */}
                 <div className="bg-muted/50 p-3 rounded-md text-xs text-muted-foreground border border-border/50">
                    {activeTab === "dca" && (
                        <p><strong>Dollar Cost Averaging:</strong> Invests a fixed amount regularly regardless of price. Reduces the impact of volatility and removes the stress of timing the market.</p>
                    )}
                    {activeTab === "grid" && (
                        <p><strong>Grid Trading:</strong> Places buy and sell orders at set intervals. automatically profits from normal market volatility by buying low and selling high within a range.</p>
                    )}
                    {activeTab === "momentum" && (
                        <p><strong>Momentum Strategy:</strong> Uses Moving Average crossovers (Fast vs Slow) to identify trends. Aims to capture major upward moves and exit when the trend reverses.</p>
                    )}
                 </div>

                 {activeTab === "dca" && (
                    <div className="space-y-2">
                       <Label>Daily Buy Amount (USDT)</Label>
                       <Input type="number" value={dcaAmount} onChange={e => setDcaAmount(e.target.value)} />
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <TrendingUp className="w-3 h-3" />
                           Buys fixed amount every 24h
                       </div>
                    </div>
                 )}

                 {activeTab === "grid" && (
                    <div className="space-y-2">
                       <Label>Grid Levels</Label>
                       <Input type="number" value={gridLevels} onChange={e => setGridLevels(e.target.value)} />
                       <p className="text-xs text-muted-foreground">Divides price range into buy/sell zones.</p>
                    </div>
                 )}

                 {activeTab === "momentum" && (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>Fast MA</Label>
                          <Input type="number" value={momentumShort} onChange={e => setMomentumShort(e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label>Slow MA</Label>
                          <Input type="number" value={momentumLong} onChange={e => setMomentumLong(e.target.value)} />
                       </div>
                    </div>
                 )}
             </div>

             <Button className="w-full" size="lg" onClick={handleRunBacktest} disabled={isRunning || loadingCoins}>
                {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                Run Backtest
             </Button>
          </CardContent>
        </Card>

        {/* RESULTS */}
        <div className="lg:col-span-2 space-y-6">
           {result ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <Card className="bg-muted/30">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                         <CardTitle className="text-sm font-medium text-muted-foreground">Strategy Return</CardTitle>
                         <Dialog>
                            <DialogTrigger>
                                <Info className="h-4 w-4 text-muted-foreground/50 hover:text-foreground cursor-pointer transition-colors" />
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Strategy Return</DialogTitle>
                                    <DialogDescription>
                                        The total profit or loss (expressed as a percentage) generated by your selected strategy over the specific duration. 
                                        This accounts for all executed trades and the final value of the portfolio compared to the initial capital.
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                         </Dialog>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                         <div className={cn("text-2xl font-bold", result.totalReturn >= 0 ? "text-green-500" : "text-red-500")}>
                            {result.totalReturnPercent.toFixed(2)}%
                         </div>
                         <div className="text-xs text-muted-foreground">
                            {result.totalReturn >= 0 ? "+" : ""}
                            ${fmt(result.totalReturn)}
                         </div>
                      </CardContent>
                   </Card>
                   
                   <Card className="bg-muted/30">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                         <CardTitle className="text-sm font-medium text-muted-foreground">Buy & Hold (Benchmark)</CardTitle>
                         <Dialog>
                            <DialogTrigger>
                                <Info className="h-4 w-4 text-muted-foreground/50 hover:text-foreground cursor-pointer transition-colors" />
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Buy & Hold (Benchmark)</DialogTitle>
                                    <DialogDescription>
                                        This represents the hypothetical return if you had simply purchased the asset at the beginning of the period and held it until the end, without any trading.
                                        It serves as a baseline to evaluate if your active strategy is actually adding value.
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                         </Dialog>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                         <div className={cn("text-2xl font-bold", result.benchmarkReturnPercent >= 0 ? "text-blue-500" : "text-orange-500")}>
                            {result.benchmarkReturnPercent.toFixed(2)}%
                         </div>
                         <div className="text-xs text-muted-foreground">
                            Diff: <span className={result.totalReturn > result.benchmarkReturn ? "text-green-500" : "text-red-500"}>
                                {(result.totalReturnPercent - result.benchmarkReturnPercent).toFixed(2)}%
                            </span>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className="bg-muted/30">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                         <CardTitle className="text-sm font-medium text-muted-foreground">Risk (Max Drawdown)</CardTitle>
                         <Dialog>
                            <DialogTrigger>
                                <Info className="h-4 w-4 text-muted-foreground/50 hover:text-foreground cursor-pointer transition-colors" />
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Max Drawdown (Risk)</DialogTitle>
                                    <DialogDescription>
                                        The maximum observed loss from a peak to a trough of a portfolio, before a new peak is attained. 
                                        It is an indicator of downside risk over a specified time period. A lower (closer to 0%) drawdown is preferred.
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                         </Dialog>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                         <div className="text-2xl font-bold text-red-500">
                            -{result.maxDrawdown.toFixed(2)}%
                         </div>
                         <div className="text-xs text-muted-foreground">Peak-to-Trough drop</div>
                      </CardContent>
                   </Card>
                </div>

                <Card className="h-[600px] border-border">
                   <CardHeader>
                      <CardTitle>Equity Curve</CardTitle>
                      <CardDescription>
                         Performance over {duration} days
                      </CardDescription>
                   </CardHeader>
                   <CardContent className="h-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis 
                               dataKey="time" 
                               tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                               minTickGap={50}
                               tick={{ fontSize: 12, fill: '#6b7280' }}
                            />
                            <YAxis 
                                domain={['auto', 'auto']} 
                                tickFormatter={(val) => `$${val.toLocaleString()}`}
                                width={60}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                            />
                            <ChartTooltip 
                               contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                               labelFormatter={(label) => new Date(label).toLocaleDateString()}
                               formatter={(value: any, name: any) => [
                                   `$${typeof value === 'number' ? value.toFixed(2) : value}`, 
                                   name === 'strategy' ? 'Strategy Equity' : name
                               ]}
                            />
                            <Legend />
                            <Area 
                               name="Strategy"
                               type="monotone" 
                               dataKey="strategy" 
                               stroke="#22c55e" 
                               strokeWidth={3}
                               fillOpacity={1} 
                               fill="url(#colorStrategy)" 
                            />
                         </AreaChart>
                      </ResponsiveContainer>
                   </CardContent>
                </Card>
              </>
           ) : (
              <Card className="h-full flex items-center justify-center p-12 bg-muted/10 border-dashed min-h-[500px]">
                 <div className="text-center text-muted-foreground max-w-sm">
                    <div className="bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-8 w-8 opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">Ready to Simulate</h3>
                    <p className="mt-2 text-sm">
                        Select a top cryptocurrency and a strategy to test its performance against historical data.
                    </p>
                 </div>
              </Card>
           )}
        </div>
      </div>
    </div>
  )
}
