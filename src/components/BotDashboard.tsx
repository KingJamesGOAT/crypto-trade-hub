import { useSimulator } from "@/context/SimulatorContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function BotDashboard() {
  const { portfolio, balance, logs } = useSimulator()

  const holdings = portfolio
  
  const holdingsValue = holdings.reduce((acc, h) => acc + (h.amount * h.avg_buy_price), 0) // Approximation using buy price for now as we don't have live price in context easily without fetching
  
  const currentTotalValue = balance + holdingsValue

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
            <CardTitle>Ghost Bot Performance</CardTitle>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-background/40 rounded-lg border border-border/50 mt-4">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Total Equity</span>
                    <span className="text-xl font-bold font-mono text-primary">${currentTotalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Cash Balance</span>
                    <span className="text-lg font-bold font-mono">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Invested</span>
                    <span className="text-lg font-bold font-mono text-blue-400">${holdingsValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
            </div>
        </CardHeader>
      </Card>

      {/* Active Holdings Table */}
      <Card>
          <CardHeader>
              <CardTitle>Active Positions</CardTitle>
              <CardDescription>Real-time view of bot allocations</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Entry Price</TableHead>
                            <TableHead>Est. Value</TableHead>
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
                            const value = h.amount * h.avg_buy_price
                            return (
                                <TableRow key={h.symbol}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {h.symbol}
                                    </TableCell>
                                    <TableCell>{h.amount.toFixed(6)}</TableCell>
                                    <TableCell>${h.avg_buy_price.toFixed(2)}</TableCell>
                                    <TableCell>${value.toFixed(2)}</TableCell>
                                </TableRow>
                            )
                        })}
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

