import { useEffect, useState } from "react"
import { getTopCoins, type CoinMarketData } from "@/api/coingecko"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MarketChart } from "@/components/MarketChart"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import { Loader2, TrendingUp, TrendingDown, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PortfolioOverview } from "@/components/PortfolioOverview"

import { useSimulator } from "@/context/SimulatorContext"

export function Home() {
  const { activeSymbols, portfolio, latestPrices } = useSimulator()
  const [coins, setCoins] = useState<CoinMarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState<CoinMarketData | null>(null)
  const [isMaximize, setIsMaximize] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await getTopCoins(50)
      if (data) setCoins(data)
      setLoading(false)
    }
    loadData()
  }, [])

  // ... (existing helper functions getTradingViewSymbol, formatNumber, PercentChange)
  const getTradingViewSymbol = (coin: CoinMarketData) => {
      if (coin.symbol.toUpperCase() === "USDT") return "BINANCE:BTCUSDT"; 
      if (coin.symbol.toUpperCase() === "USDC") return "BINANCE:BTCUSDT";
      if (coin.symbol.toUpperCase() === "STETH") return "BINANCE:ETHUSDT"; 
      return `BINANCE:${coin.symbol.toUpperCase()}USDT`;
  }
  
  const formatNumber = (num: number, currency: string = "$") => {
      return `${currency}${num.toLocaleString("en-US")}`;
  }

  const PercentChange = ({ value }: { value: number }) => {
      if (!value) return <span className="text-muted-foreground">-</span>;
      const isPositive = value >= 0;
      return (
          <div className={`flex items-center justify-end gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(value).toFixed(2)}%
          </div>
      )
  }

  // Helper to get coin image from CoinGecko list if available
  const getCoinImage = (symbol: string) => {
      // symbol is "BTCUSDT" -> "btc"
      const tick = symbol.replace("USDT", "").toLowerCase()
      const found = coins.find(c => c.symbol === tick)
      return found?.image
  }

  const getCoinPrice = (symbol: string) => {
      // 1. Try Live WebSocket Price (Fastest)
      if (latestPrices[symbol]) return latestPrices[symbol]

      // 2. Try Portfolio Price (if held)
      const held = portfolio.holdings[symbol]
      if (held) return held.currentPrice
      
      // 3. Try CoinGecko Cache (Slowest/Fallback)
      const tick = symbol.replace("USDT", "").toLowerCase()
      const found = coins.find(c => c.symbol === tick)
      return found?.current_price || 0
  }

  return (
    <div className="space-y-8">
      <PortfolioOverview />
      
      {/* BOT ACTIVE SCANS */}
      <div>
          <div className="flex items-center gap-2 mb-4">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Live Bot Scans</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {activeSymbols.map(symbol => {
                  const isHeld = portfolio.holdings[symbol]?.quantity > 0
                  const img = getCoinImage(symbol)
                  const price = getCoinPrice(symbol)
                  
                  return (
                      <Card 
                          key={symbol} 
                          className={`
                              overflow-hidden transition-all duration-300
                              ${isHeld ? "border-green-500 border-2 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "border-border hover:border-primary/50"}
                          `}
                      >
                          <CardContent className="p-4 flex items-center gap-3">
                              {img ? (
                                  <img src={img} alt={symbol} className="w-8 h-8 rounded-full" />
                              ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                      {symbol.substring(0,2)}
                                  </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-sm truncate">{symbol.replace("USDT", "")}</span>
                                  {price > 0 && (
                                     <span className="text-xs font-mono text-muted-foreground">
                                         ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                     </span>
                                  )}
                                  {isHeld && (
                                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">
                                          ACTIVE
                                      </span>
                                  )}
                              </div>
                          </CardContent>
                      </Card>
                  )
              })}
              {activeSymbols.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed rounded-lg">
                      Initializing Scanner...
                  </div>
              )}
          </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Market Dashboard</h2>
        <p className="text-muted-foreground">
          Top 50 Cryptocurrencies. Click on any coin to view advanced charts.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
           <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
           {loading ? (
               <div className="flex justify-center py-10">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
               </div>
           ) : (
               <div className="overflow-x-auto">
                   <Table className="min-w-[800px]">
                       <TableHeader>
                           <TableRow>
                               <TableHead className="w-[50px]">#</TableHead>
                               <TableHead>Asset</TableHead>
                               <TableHead className="text-right">Price</TableHead>
                               <TableHead className="text-right">1h %</TableHead>
                               <TableHead className="text-right">24h %</TableHead>
                               <TableHead className="text-right">7d %</TableHead>
                               <TableHead className="text-right hidden md:table-cell">Market Cap</TableHead>
                               <TableHead className="text-right hidden md:table-cell">Volume (24h)</TableHead>
                               <TableHead className="text-right hidden lg:table-cell">Circulating Supply</TableHead>
                               <TableHead className="w-[180px] hidden md:table-cell">Last 7 Days</TableHead>
                           </TableRow>
                       </TableHeader>
                       <TableBody>
                           {coins.map((coin) => (
                               <TableRow 
                                    key={coin.id} 
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => { setSelectedCoin(coin); setIsMaximize(false); }}
                               >
                                   <TableCell className="font-medium text-muted-foreground text-xs">{coin.market_cap_rank}</TableCell>
                                   <TableCell>
                                       <div className="flex items-center gap-3">
                                           <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                                           <div className="flex flex-col">
                                               <span className="font-bold">{coin.name}</span>
                                               <span className="text-xs text-muted-foreground uppercase">{coin.symbol}</span>
                                           </div>
                                       </div>
                                   </TableCell>
                                   <TableCell className="text-right font-mono font-medium">
                                       ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                   </TableCell>
                                   <TableCell className="text-right text-xs">
                                       <PercentChange value={coin.price_change_percentage_1h_in_currency} />
                                   </TableCell>
                                   <TableCell className="text-right text-sm font-bold">
                                       <PercentChange value={coin.price_change_percentage_24h_in_currency} />
                                   </TableCell>
                                   <TableCell className="text-right text-xs">
                                       <PercentChange value={coin.price_change_percentage_7d_in_currency} />
                                   </TableCell>
                                   <TableCell className="text-right hidden md:table-cell text-muted-foreground font-mono text-xs">
                                       {formatNumber(coin.market_cap)}
                                   </TableCell>
                                   <TableCell className="text-right hidden md:table-cell text-muted-foreground font-mono text-xs">
                                       {formatNumber(coin.total_volume)}
                                   </TableCell>
                                   <TableCell className="text-right hidden lg:table-cell text-muted-foreground font-mono text-xs">
                                       {formatNumber(coin.circulating_supply, "")} {coin.symbol.toUpperCase()}
                                   </TableCell>
                                   <TableCell className="hidden md:table-cell p-2">
                                       <div className="h-[50px] w-[160px] ml-auto">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={coin.sparkline_in_7d.price.map((val, i) => ({ i, val }))}>
                                                    <YAxis domain={['dataMin', 'dataMax']} hide />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="val" 
                                                        stroke={coin.price_change_percentage_7d_in_currency >= 0 ? "#22c55e" : "#ef4444"} 
                                                        strokeWidth={2} 
                                                        dot={false} 
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                       </div>
                                   </TableCell>
                               </TableRow>
                           ))}
                       </TableBody>
                   </Table>
               </div>
           )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCoin} onOpenChange={(open) => !open && setSelectedCoin(null)}>
          <DialogContent className={isMaximize ? "w-[100vw] h-[100vh] max-w-none rounded-none border-0" : "max-w-4xl h-[80vh] flex flex-col"}>
              <DialogHeader className="flex flex-row items-center justify-between space-y-0 pr-8">
                  <div className="flex flex-col gap-1">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {selectedCoin && (
                            <>
                                <img src={selectedCoin.image} alt={selectedCoin.name} className="h-8 w-8" />
                                {selectedCoin.name} <span className="text-muted-foreground">({selectedCoin.symbol.toUpperCase()})</span>
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Real-time Market Data
                    </DialogDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setIsMaximize(!isMaximize)} title="Toggle Fullscreen">
                      {isMaximize ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
              </DialogHeader>
              <div className="flex-1 min-h-0 bg-black/5 rounded-lg border border-border overflow-hidden mt-4">
                   {selectedCoin && (
                       <MarketChart symbol={getTradingViewSymbol(selectedCoin)} />
                   )}
              </div>
          </DialogContent>
      </Dialog>
    </div>
  )
}
