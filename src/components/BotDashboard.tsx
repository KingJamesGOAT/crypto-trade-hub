import { useState } from "react"
import { useSimulator } from "@/context/SimulatorContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity } from "lucide-react"
import { format } from "date-fns"

export function BotDashboard() {
  const { portfolio, performanceHistory } = useSimulator()
  const [timeRange, setTimeRange] = useState<"1m" | "1h" | "1d" | "1w" | "1m_old" | "1y">("1m") // Updated types

  // Filter Data
  const getFilteredData = () => {
      const now = Date.now()
      let cutoff = 0
      
      switch (timeRange) {
          case "1m": cutoff = now - (60 * 1000); break;
          case "1h": cutoff = now - (60 * 60 * 1000); break;
          case "1d": cutoff = now - (24 * 60 * 60 * 1000); break;
          case "1w": cutoff = now - (7 * 24 * 60 * 60 * 1000); break;
          default: cutoff = 0; // All time
      }

      if (cutoff === 0) return performanceHistory
      return performanceHistory.filter(p => p.timestamp >= cutoff)
  }

  const data = getFilteredData()

  // Format tick labels
  const formatTick = (tick: number) => {
      if (timeRange === "1m") return format(tick, "ss's'")
      if (timeRange === "1h") return format(tick, "mm'm'")
      if (timeRange === "1d") return format(tick, "HH:mm")
      return format(tick, "MM/dd")
  }

  // Filter active holdings
  const holdings = Object.values(portfolio.holdings).filter(h => h.quantity > 0)
  
  // LIVE Calculation of Total Value (Source of Truth)
  // LIVE Calculation of Total Value
  // If Bot is Active (or conceptually, we are viewing Bot Dashboard), we want to see Allocation Performance.
  // Logic: 
  // 1. Calculate Cost Basis of Current Holdings (Invested Amount)
  // 2. Remaining Allocation = TotalAllocated - CostBasis (clamped to 0 if overspent, or just raw diff)
  //    Actually, if the bot spent 100 to buy coins, that 100 is "in the coins".
  //    So "Current Bot Value" = (Current Value of Holdings) + (Allocated - Cost Basis of Holdings)
  //    This works perfectly:
  //    - Start: Alloc 200. Holdings 0. Value = 0 + (200 - 0) = 200.
  //    - Invest 50: Holdings 50. Cost 50. Value = 50 + (200 - 50) = 200. (No P&L yet)
  //    - Pump to 60: Holdings 60. Cost 50. Value = 60 + (150) = 210. (+10 Profit)
  
  const { botConfig } = useSimulator() // Need botConfig for allocation
  
  const holdingsValue = holdings.reduce((acc, h) => acc + (h.quantity * h.currentPrice), 0)
  const costBasis = holdings.reduce((acc, h) => acc + (h.quantity * h.averageEntryPrice), 0)
  
  // We use the User's Allocation input as the "Base Capital" for this visualization
  const assignedCapital = botConfig.totalAllocated
  const uninvestedCapital = Math.max(0, assignedCapital - costBasis)
  
  // This is the value we show in the Big Number
  const currentTotalValue = holdingsValue + uninvestedCapital

  const calculateTotalPnL = () => {
      // P&L is simply Current Value - Assigned Capital
      return currentTotalValue - assignedCapital
  }

  const totalPnL = calculateTotalPnL()
  // Guard against division by zero
  const pnlPercent = assignedCapital > 0 
      ? (totalPnL / assignedCapital) * 100 
      : 0
  
  // Calculate specific Unrealized P&L
  const unrealizedPnL = holdings.reduce((acc, h) => {
      return acc + ((h.currentPrice - h.averageEntryPrice) * h.quantity)
  }, 0)
  
  const realizedPnL = totalPnL - unrealizedPnL

  return (
    <div className="space-y-6">
      {/* Performance Chart */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
            <div className="flex flex-row items-center justify-between mb-4">
                 <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Performance Overview
                </CardTitle>
                <div className="flex gap-1">
                    {["1m", "1h", "1d", "All"].map((range) => (
                        <Button 
                            key={range}
                            variant={timeRange === range || (range === "All" && timeRange === "1y") ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setTimeRange(range === "All" ? "1y" : range as any)}
                        >
                            {range.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Crystal Clear Grid Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-background/40 rounded-lg border border-border/50">
                
                {/* 1. Allocation (Fixed User Input) */}
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Total Allocated</span>
                    <span className="text-lg font-bold font-mono">CHF {assignedCapital.toLocaleString()}</span>
                </div>

                {/* 2. Invested (Active Coins) */}
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Currently Invested</span>
                    <span className="text-lg font-bold font-mono text-blue-400">CHF {holdingsValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                 {/* 3. Net P&L (Realized + Unrealized) */}
                 <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Net Profit / Loss</span>
                    <div className={`flex items-center gap-1 font-bold text-lg ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                         {totalPnL >= 0 ? "+" : ""}CHF {totalPnL.toFixed(2)}
                         <span className="text-xs font-normal">({pnlPercent.toFixed(2)}%)</span>
                    </div>
                </div>

                {/* 4. Total Bot Equity (Allocated + P&L) */}
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Total Bot Equity</span>
                    <span className="text-xl font-bold font-mono text-primary">CHF {currentTotalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
            </div>
            
            {/* Detailed Breakdown */}
             <div className="flex gap-6 text-xs text-muted-foreground mt-4 px-4">
                 <div className="flex gap-2">
                    <span>Available to Invest:</span>
                    <span className="font-mono text-foreground font-medium">CHF {uninvestedCapital.toFixed(2)}</span>
                 </div>
                <div className="flex gap-2">
                    <span>Realized P&L:</span>
                    <span className={`font-mono font-medium ${realizedPnL >= 0 ? "text-green-500" : "text-red-500"}`}>CHF {realizedPnL.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                     <span>Unrealized P&L:</span>
                     <span className={`font-mono font-medium ${unrealizedPnL >= 0 ? "text-green-500" : "text-red-500"}`}>CHF {unrealizedPnL.toFixed(2)}</span>
                </div>
            </div>

        </CardHeader>
        <CardContent>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={totalPnL >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={totalPnL >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={formatTick} 
                            stroke="#888888"
                            fontSize={12}
                            interval="preserveStartEnd"
                        />
                        <YAxis 
                            domain={['auto', 'auto']} 
                            stroke="#888888"
                            fontSize={12}
                            tickFormatter={(val) => `CHF ${val}`}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                            labelFormatter={(label) => format(label, "PP p")}
                            formatter={(value: any) => [`CHF ${Number(value).toFixed(2)}`, "Total Value"]}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="totalValue" 
                            stroke={totalPnL >= 0 ? "#22c55e" : "#ef4444"} 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>

      {/* Active Holdings Table */}
      <Card>
          <CardHeader>
              <CardTitle>Active Positions</CardTitle>
              <CardDescription>Real-time view of bot allocations and manual trades</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Avg. Entry</TableHead>
                            <TableHead>Current Price</TableHead>
                            <TableHead>Value (CHF)</TableHead>
                            <TableHead>P&L</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {holdings.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No active positions. The bot is scanning...
                                </TableCell>
                            </TableRow>
                        )}
                        {holdings.map((h) => {
                            const value = h.quantity * h.currentPrice
                            const pnl = value - (h.quantity * h.averageEntryPrice)
                            const pnlPercent = (pnl / (h.quantity * h.averageEntryPrice)) * 100
                            
                            return (
                                <TableRow key={h.coin}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {/* Could add icon here */}
                                        {h.coin}
                                    </TableCell>
                                    <TableCell>{h.quantity.toFixed(6)}</TableCell>
                                    <TableCell>${h.averageEntryPrice.toFixed(2)}</TableCell>
                                    <TableCell>${h.currentPrice.toFixed(2)}</TableCell>
                                    <TableCell>CHF {value.toFixed(2)}</TableCell>
                                    <TableCell className={pnl >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                                        {pnlPercent.toFixed(2)}% (CHF {pnl.toFixed(2)})
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
              </div>
          </CardContent>
      </Card>

      {/* Recent Activity Table */}
       <Card className="flex flex-col h-[400px]">
          <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Live feed of bot and manual executions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full px-6 pb-4 overflow-auto">
                <Table className="min-w-[600px]"> 
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Asset</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Value (CHF)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {portfolio.trades.slice(0, 50).map((trade) => (
                            <TableRow key={trade.id}>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {format(trade.timestamp, "HH:mm:ss")}
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        className={`text-[10px] px-2 py-0.5 uppercase border-0 ${trade.side === "buy" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                                    >
                                        {trade.side}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{trade.coin}</TableCell>
                                <TableCell className="text-right font-mono">{trade.quantity.toFixed(6)}</TableCell>
                                <TableCell className="text-right">${trade.entryPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-mono">CHF {trade.totalValue.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        {portfolio.trades.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-16 text-muted-foreground">
                                    No recent trades.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
              </div>
          </CardContent>
      </Card>
      
    </div>
  )
}
