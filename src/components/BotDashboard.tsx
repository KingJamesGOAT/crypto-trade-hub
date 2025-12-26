import { useSimulator } from "@/context/SimulatorContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { useBinanceStream } from "@/hooks/useBinanceStream"

export function BotDashboard() {
  const { portfolio, balance, logs } = useSimulator()

  // Get live prices for held assets
  const heldSymbols = portfolio.map(p => p.symbol)
  const { streamData } = useBinanceStream(heldSymbols)
  
  // Real-time calculation
  const holdingsWithPnL = portfolio.map(h => {
      let currentPrice = h.avg_buy_price
      // Update price if available in stream
      if (streamData?.trade && streamData.trade.s === h.symbol) {
          currentPrice = parseFloat(streamData.trade.p)
      }
      
      const currentValue = h.amount * currentPrice
      const costBasis = h.amount * h.avg_buy_price
      const pnl = currentValue - costBasis
      const pnlPercent = (pnl / costBasis) * 100

      return { ...h, currentPrice, currentValue, pnl, pnlPercent }
  })

  const totalInvested = portfolio.reduce((acc, h) => acc + (h.amount * h.avg_buy_price), 0)
  const totalCurrentValue = holdingsWithPnL.reduce((acc, h) => acc + h.currentValue, 0)
  const totalEquity = balance + totalCurrentValue
  const totalUnrealizedPnL = totalCurrentValue - totalInvested

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
            <CardTitle>Ghost Bot Performance</CardTitle>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-background/40 rounded-lg border border-border/50 mt-4">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Total Equity</span>
                    <span className="text-xl font-bold font-mono text-primary">${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Cash Balance</span>
                    <span className="text-lg font-bold font-mono">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Invested</span>
                    <span className="text-lg font-bold font-mono text-blue-400">${totalCurrentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Unrealized PnL</span>
                    <span className={cn(
                        "text-lg font-bold font-mono",
                        totalUnrealizedPnL >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                        {totalUnrealizedPnL >= 0 ? "+" : ""}${totalUnrealizedPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>
        </CardHeader>
      </Card>

      {/* Active Holdings Table */}
      <Card>
          <CardHeader>
              <CardTitle>Active Positions</CardTitle>
              <CardDescription>Real-time PnL tracking</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Entry</TableHead>
                            <TableHead>Live Price</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="text-right">PnL</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {holdingsWithPnL.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No active positions. The bot is scanning...
                                </TableCell>
                            </TableRow>
                        )}
                        {holdingsWithPnL.map((h) => (
                            <TableRow key={h.symbol}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    {h.symbol}
                                </TableCell>
                                <TableCell>{h.amount.toFixed(4)}</TableCell>
                                <TableCell className="text-muted-foreground">${h.avg_buy_price.toFixed(2)}</TableCell>
                                <TableCell className="font-mono">${h.currentPrice.toFixed(2)}</TableCell>
                                <TableCell>${h.currentValue.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <div className={cn("font-medium", h.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                                        {h.pnl >= 0 ? "+" : ""}{h.pnl.toFixed(2)}
                                    </div>
                                    <div className={cn("text-xs", h.pnlPercent >= 0 ? "text-green-500/70" : "text-red-500/70")}>
                                        {h.pnlPercent.toFixed(2)}%
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </div>
          </CardContent>
      </Card>
      
      {/* Live Activity Log */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
              <CardTitle>Live Terminal</CardTitle>
              <CardDescription>Real-time bot decision logs</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="bg-black/80 rounded-lg p-4 h-[300px] overflow-y-auto font-mono text-xs border border-primary/20 shadow-inner">
                  {logs.length === 0 ? (
                      <div className="text-muted-foreground italic">Waiting for bot activity...</div>
                  ) : (
                      logs.map((log) => (
                          <div key={log.id} className="mb-1 border-b border-white/5 pb-1 last:border-0 last:pb-0">
                              <span className="text-blue-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                              <span className={cn(
                                  "text-gray-300",
                                  log.message.includes("BOUGHT") ? "text-green-400 font-bold" : "",
                                  log.message.includes("SOLD") ? "text-red-400 font-bold" : "",
                                  log.message.includes("ERROR") ? "text-red-500 bg-red-900/20" : ""
                              )}>
                                  {log.message}
                              </span>
                          </div>
                      ))
                  )}
              </div>
          </CardContent>
      </Card>
    </div>
  )
}

