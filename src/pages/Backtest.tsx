import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateHistoricalData } from "@/lib/backtest-data-generator"
import type { MarketTrend } from "@/lib/backtest-data-generator"
import { runBacktest } from "@/lib/backtest-engine"
import type { BacktestResult, StrategyConfig } from "@/types/backtest"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts"
import { Loader2, TrendingUp } from "lucide-react"

export function Backtest() {
  const [activeTab, setActiveTab] = useState("dca")
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  
  // Params
  const [marketTrend, setMarketTrend] = useState<MarketTrend>("bull")
  const [duration, setDuration] = useState("365")
  
  // Strategy Params
  const [dcaAmount, setDcaAmount] = useState("50")
  const [gridLevels, setGridLevels] = useState("20")
  const [momentumShort, setMomentumShort] = useState("9")
  const [momentumLong, setMomentumLong] = useState("21")

  const handleRunBacktest = async () => {
    setIsRunning(true)
    setResult(null)

    // Simulate compute delay
    setTimeout(() => {
        const days = parseInt(duration)
        const data = generateHistoricalData(days, marketTrend)
        
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
            // Auto calculate range based on data for ease of use
            const min = Math.min(...data.map(c => c.low))
            const max = Math.max(...data.map(c => c.high))
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

        const res = runBacktest(data, config)
        setResult(res)
        setIsRunning(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Strategy Backtester</h2>
        <p className="text-muted-foreground">
            Validate trading strategies on historical market data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CONFIGURATION */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Setup simulation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
                <Label>Market Condition (Synthetic)</Label>
                <Select value={marketTrend} onValueChange={(v) => setMarketTrend(v as MarketTrend)}>
                   <SelectTrigger>
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="bull">Bull Market (Uptrend)</SelectItem>
                      <SelectItem value="bear">Bear Market (Downtrend)</SelectItem>
                      <SelectItem value="range">Sideways (Range)</SelectItem>
                      <SelectItem value="volatile">High Volatility</SelectItem>
                   </SelectContent>
                </Select>
             </div>

             <div className="space-y-2">
                <Label>Duration (Days)</Label>
                <Select value={duration} onValueChange={setDuration}>
                   <SelectTrigger>
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="90">3 Months (90 Days)</SelectItem>
                      <SelectItem value="180">6 Months (180 Days)</SelectItem>
                      <SelectItem value="365">1 Year (365 Days)</SelectItem>
                   </SelectContent>
                </Select>
             </div>

             <div className="space-y-4 pt-4 border-t">
                 <Label className="text-base">Strategy Settings</Label>
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full">
                       <TabsTrigger value="dca" className="flex-1">DCA</TabsTrigger>
                       <TabsTrigger value="grid" className="flex-1">Grid</TabsTrigger>
                       <TabsTrigger value="momentum" className="flex-1">Momentum</TabsTrigger>
                    </TabsList>
                 </Tabs>

                 {activeTab === "dca" && (
                    <div className="space-y-2">
                       <Label>Daily Buy Amount (USDT)</Label>
                       <Input type="number" value={dcaAmount} onChange={e => setDcaAmount(e.target.value)} />
                       <p className="text-xs text-muted-foreground">Buys every 24h regardless of price.</p>
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

             <Button className="w-full" size="lg" onClick={handleRunBacktest} disabled={isRunning}>
                {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                Run Simulation
             </Button>
          </CardContent>
        </Card>

        {/* RESULTS */}
        <div className="lg:col-span-2 space-y-6">
           {result ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <Card>
                      <CardHeader className="p-4 pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground">Total Return</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                         <div className={`text-2xl font-bold ${result.totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {result.totalReturnPercent.toFixed(2)}%
                         </div>
                         <div className="text-xs text-muted-foreground">
                            {result.totalReturn >= 0 ? "+" : ""}
                            CHF {result.totalReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                         </div>
                      </CardContent>
                   </Card>
                   <Card>
                      <CardHeader className="p-4 pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground">Max Drawdown</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                         <div className="text-2xl font-bold text-red-500">
                            -{result.maxDrawdown.toFixed(2)}%
                         </div>
                         <div className="text-xs text-muted-foreground">Worst peak-to-trough</div>
                      </CardContent>
                   </Card>
                   <Card>
                      <CardHeader className="p-4 pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                         <div className="text-2xl font-bold">
                            {result.trades.length}
                         </div>
                         <div className="text-xs text-muted-foreground">Executed orders</div>
                      </CardContent>
                   </Card>
                </div>

                <Card className="h-[400px]">
                   <CardHeader>
                      <CardTitle>Equity Curve</CardTitle>
                      <CardDescription>Portfolio value over time</CardDescription>
                   </CardHeader>
                   <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={result.equityCurve}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis 
                               dataKey="time" 
                               tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                               minTickGap={50}
                            />
                            <YAxis domain={['auto', 'auto']} />
                            <ChartTooltip 
                               labelFormatter={(label) => new Date(label).toLocaleString()}
                               formatter={(value: any) => [`CHF ${typeof value === 'number' ? value.toFixed(2) : value}`, "Equity"]}
                            />
                            <Line 
                               type="monotone" 
                               dataKey="value" 
                               stroke="#22c55e" 
                               strokeWidth={2}
                               dot={false}
                            />
                         </LineChart>
                      </ResponsiveContainer>
                   </CardContent>
                </Card>
              </>
           ) : (
              <Card className="h-full flex items-center justify-center p-12">
                 <div className="text-center text-muted-foreground">
                    <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Ready to Simulate</h3>
                    <p>Configure parameters and click Run to test your strategy.</p>
                 </div>
              </Card>
           )}
        </div>
      </div>
    </div>
  )
}
