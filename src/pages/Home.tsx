import { useEffect, useState } from "react"
import { getTopCoins, getTrendingCoins, getTopVolumeCoins, type CoinMarketData } from "@/api/coingecko"
import { fetchCryptoNews, type NewsArticle } from "@/api/news-service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MarketChart } from "@/components/MarketChart"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import { Loader2, TrendingUp, TrendingDown, Maximize2, Minimize2, Newspaper, Zap, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PortfolioOverview } from "@/components/PortfolioOverview"
import { Badge } from "@/components/ui/badge"
import { useSimulator } from "@/context/SimulatorContext"

export function Home() {
  const { portfolio } = useSimulator()
  const [coins, setCoins] = useState<CoinMarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState<CoinMarketData | null>(null)
  const [isMaximize, setIsMaximize] = useState(false);

  // New Data States
  const [news, setNews] = useState<NewsArticle[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [topVolume, setTopVolume] = useState<CoinMarketData[]>([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      
      // parallel fetch for speed
      const [marketData, newsData, trendData, volData] = await Promise.all([
          getTopCoins(50),
          fetchCryptoNews(),
          getTrendingCoins(),
          getTopVolumeCoins(5)
      ])

      if (marketData) setCoins(marketData)
      if (newsData) setNews(newsData)
      if (trendData) setTrending(trendData.slice(0, 5)) // Top 5 trending (Social proxy)
      if (volData) setTopVolume(volData)
      
      setLoading(false)
    }
    loadData()
  }, [])

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

  const getCoinImage = (symbol: string) => {
      const tick = symbol.replace("USDT", "").toLowerCase()
      const found = coins.find(c => c.symbol === tick)
      return found?.image
  }

  const getCoinPrice = (symbol: string) => {
      const held = portfolio.find(p => p.symbol === symbol)
      if (held) return held.avg_buy_price 
      const tick = symbol.replace("USDT", "").toLowerCase()
      const found = coins.find(c => c.symbol === tick)
      return found?.current_price || 0
  }

  return (
    <div className="space-y-8 pb-10">
      <PortfolioOverview />
      
      {/* 1. GHOST BOT WATCHLIST */}
      <div>
          <div className="flex items-center gap-2 mb-4">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Ghost Bot Watchlist</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "SUIUSDT", "TRXUSDT", "LINKUSDT"].map(symbol => {
                  const isHeld = portfolio.find(p => p.symbol === symbol && p.amount > 0)
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
                                          HELD
                                      </span>
                                  )}
                              </div>
                          </CardContent>
                      </Card>
                  )
              })}
          </div>
      </div>

      {/* 2. MARKET INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LATEST NEWS */}
          <Card className="lg:col-span-2 border-primary/20 bg-card/50">
             <CardHeader className="pb-2">
                 <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-blue-400" />
                    Market Headlines
                 </CardTitle>
                 <CardDescription>Top stories driving the market today</CardDescription>
             </CardHeader>
             <CardContent>
                 {loading ? (
                     <div className="h-40 flex items-center justify-center text-muted-foreground">Loading News...</div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Main Story (Most Important) */}
                         {news.length > 0 && (
                             <div className="group cursor-pointer relative rounded-xl overflow-hidden border border-border h-full min-h-[200px]" onClick={() => window.open(news[0].url, "_blank")}>
                                 <img src={news[0].imageurl} alt={news[0].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-40" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 flex flex-col justify-end">
                                     <Badge className="w-fit mb-2 bg-blue-600 hover:bg-blue-700 text-white border-0">Top Story</Badge>
                                     <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-300 transition-colors">
                                         {news[0].title}
                                     </h3>
                                     <p className="text-xs text-slate-300 mt-1 line-clamp-2">{news[0].body}</p>
                                     <span className="text-xs text-slate-400 mt-2 font-mono">{news[0].source} • 1h ago</span>
                                 </div>
                             </div>
                         )}

                         {/* Recent List (Next 3) */}
                         <div className="space-y-4">
                             {news.slice(1, 4).map(article => (
                                 <div key={article.id} className="flex gap-3 items-start group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors" onClick={() => window.open(article.url, "_blank")}>
                                     <img src={article.imageurl} alt="thumbnail" className="w-16 h-16 rounded-md object-cover bg-slate-800" />
                                     <div className="flex-1 min-w-0">
                                         <h4 className="text-sm font-semibold line-clamp-2 leading-relaxed group-hover:text-blue-400 transition-colors">
                                             {article.title}
                                         </h4>
                                         <div className="flex items-center gap-2 mt-1">
                                             <Badge variant="outline" className="text-[10px] h-5 px-1 text-muted-foreground border-white/10">
                                                 {article.source}
                                             </Badge>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
             </CardContent>
          </Card>

          {/* SOCIAL & TRENDING */}
          <div className="space-y-6">
              
              {/* Top 5 Social / Trending */}
              <Card className="border-primary/20 bg-card/50">
                 <CardHeader className="pb-2">
                     <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        Top 5 Social Hype
                     </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                     {loading ? (
                         <div className="text-sm text-muted-foreground">Scanning Socials...</div>
                     ) : (
                         trending.map((coin, i) => (
                             <div key={coin.id} className="flex items-center justify-between p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors border border-white/5">
                                 <div className="flex items-center gap-3">
                                     <span className="text-xs font-mono font-bold text-muted-foreground w-4">0{i+1}</span>
                                     <img src={coin.small} alt={coin.name} className="w-6 h-6 rounded-full" />
                                     <span className="font-bold text-sm">{coin.symbol}</span>
                                 </div>
                                 <Badge variant="secondary" className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                     Rank #{coin.market_cap_rank || "N/A"}
                                 </Badge>
                             </div>
                         ))
                     )}
                 </CardContent>
              </Card>

              {/* Top Volume */}
              <Card className="border-primary/20 bg-card/50">
                 <CardHeader className="pb-2">
                     <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-4 w-4 text-purple-400" />
                        Top Trading (Vol)
                     </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                     {loading ? (
                         <div className="text-sm text-muted-foreground">Calculating Volume...</div>
                     ) : (
                         topVolume.map((coin) => (
                             <div key={coin.id} className="flex items-center justify-between p-2 rounded-lg bg-black/20 hover:bg-black/30 border border-white/5">
                                 <div className="flex items-center gap-3">
                                     <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                                     <span className="font-bold text-sm">{coin.symbol.toUpperCase()}</span>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-xs font-mono text-slate-300">${(coin.total_volume / 1000000000).toFixed(2)}B</div>
                                    <div className={`text-[10px] font-bold ${coin.price_change_percentage_24h_in_currency >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {coin.price_change_percentage_24h_in_currency > 0 ? "+" : ""}{coin.price_change_percentage_24h_in_currency.toFixed(2)}%
                                    </div>
                                 </div>
                             </div>
                         ))
                     )}
                 </CardContent>
              </Card>

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
          <DialogContent className={isMaximize ? "w-[100vw] h-[100vh] max-w-none rounded-none border-0 p-0" : "max-w-4xl h-[80vh] flex flex-col"}>
              {!isMaximize && (
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
                          <Maximize2 className="h-4 w-4" />
                      </Button>
                  </DialogHeader>
              )}
              {isMaximize && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 z-50 bg-black/20 hover:bg-black/40 text-white" 
                    onClick={() => setIsMaximize(false)}
                  >
                      <Minimize2 className="h-6 w-6" />
                  </Button>
              )}
              <div className={`flex-1 min-h-0 bg-black/5 rounded-lg border border-border overflow-hidden ${!isMaximize ? "mt-4" : ""}`}>
                   {selectedCoin && (
                       <MarketChart 
                           symbol={getTradingViewSymbol(selectedCoin)} 
                           className="h-full w-full border-0 rounded-none" 
                       />
                   )}
              </div>
          </DialogContent>
      </Dialog>
    </div>
  )
}
