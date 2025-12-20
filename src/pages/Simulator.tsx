import { useState, useEffect } from "react"
import { useSimulator } from "@/context/SimulatorContext"
import { getSimplePrice } from "@/api/coingecko"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, TrendingUp, TrendingDown, History } from "lucide-react"

const AVAILABLE_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
]

export function Simulator() {
  const { portfolio, executeTrade, resetSimulator } = useSimulator()
  const { toast } = useToast()
  
  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin")
  const [amount, setAmount] = useState("")
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy")
  const [inputType, setInputType] = useState<"fiat" | "quantity">("fiat")

  const selectedCoin = AVAILABLE_COINS.find(c => c.id === selectedCoinId) || AVAILABLE_COINS[0]
  const currentPrice = prices[selectedCoinId] || 0

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchPrices = async () => {
    setIsLoadingPrice(true)
    const ids = AVAILABLE_COINS.map(c => c.id)
    const data = await getSimplePrice(ids)
    if (data) {
      const newPrices: Record<string, number> = {}
      ids.forEach(id => {
        if (data[id]) newPrices[id] = data[id].usd
      })
      setPrices(newPrices)
    }
    setIsLoadingPrice(false)
  }

  const handleTrade = async () => {
    if (!currentPrice) {
      toast({ title: "Error", description: "Price data unavailable", variant: "destructive" })
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" })
      return
    }

    const isQuantity = inputType === "quantity"
    const result = await executeTrade(
      selectedCoin.symbol,
      orderType,
      numAmount,
      currentPrice,
      isQuantity
    )

    if (result.success) {
      toast({ title: "Success", description: result.message })
      setAmount("")
    } else {
      toast({ title: "Trade Failed", description: result.message, variant: "destructive" })
    }
  }

  const calculateEstimate = () => {
    const val = parseFloat(amount)
    if (isNaN(val) || !currentPrice) return "0.00"
    
    if (inputType === "fiat") {
       const qty = val / currentPrice
       return `${qty.toFixed(6)} ${selectedCoin.symbol}`
    } else {
       const cost = val * currentPrice
       return `CHF ${cost.toFixed(2)}`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Simulator</h2>
          <p className="text-muted-foreground">
            Practice trading with virtual capital. Risk-free environment.
          </p>
        </div>
        <div className="flex items-center gap-4">
             <Badge variant="outline" className="text-lg py-1 px-4 border-blue-500 text-blue-500">
                Balance: CHF {portfolio.simulator.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </Badge>
             <Button variant="destructive" size="sm" onClick={resetSimulator}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Account
             </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ORDER ENTRY */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
            <CardDescription>Execute trades at current market price</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="buy" onValueChange={(v) => setOrderType(v as "buy" | "sell")}>
              <TabsList className="w-full">
                <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
                <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label>Select Asset</Label>
              <Select value={selectedCoinId} onValueChange={setSelectedCoinId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_COINS.map(coin => (
                     <SelectItem key={coin.id} value={coin.id}>
                        {coin.name} ({coin.symbol})
                     </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-right text-muted-foreground">
                 Current Price: {isLoadingPrice ? "Loading..." : `$${currentPrice.toLocaleString()}`}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="flex gap-2">
                 <Input 
                   type="number" 
                   placeholder="0.00" 
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                 />
                 <Select value={inputType} onValueChange={(v) => setInputType(v as "fiat" | "quantity")}>
                   <SelectTrigger className="w-[110px]">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="fiat">USD (CHF)</SelectItem>
                     <SelectItem value="quantity">{selectedCoin.symbol}</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                Est: {calculateEstimate()}
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleTrade}
              variant={orderType === "buy" ? "default" : "destructive"}
            >
               {orderType === "buy" ? "Buy" : "Sell"} {selectedCoin.name}
            </Button>
          </CardContent>
        </Card>

        {/* PORTFOLIO & HOLDINGS */}
        <div className="lg:col-span-2 space-y-6">
           {/* Active Holdings */}
           <Card>
              <CardHeader>
                 <CardTitle>Portfolio Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                       <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Avg. Entry</TableHead>
                          <TableHead className="text-right">Current Price</TableHead>
                          <TableHead className="text-right">P&L</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {Object.values(portfolio.holdings).length === 0 && (
                          <TableRow>
                             <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                No active positions
                             </TableCell>
                          </TableRow>
                       )}
                       {Object.values(portfolio.holdings).map((holding) => {
                          const marketPrice = prices[AVAILABLE_COINS.find(c => c.symbol === holding.coin)?.id || ""] || holding.currentPrice
                          const value = holding.quantity * marketPrice
                          const pnl = value - (holding.quantity * holding.averageEntryPrice)
                          const pnlPercent = (pnl / (holding.quantity * holding.averageEntryPrice)) * 100

                          return (
                             <TableRow key={holding.coin}>
                                <TableCell className="font-medium">{holding.coin}</TableCell>
                                <TableCell className="text-right">{holding.quantity.toFixed(6)}</TableCell>
                                <TableCell className="text-right">${holding.averageEntryPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${marketPrice.toFixed(2)}</TableCell>
                                <TableCell className={`text-right ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                                   <div className="flex items-center justify-end gap-1">
                                      {pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                      {pnlPercent.toFixed(2)}% (${pnl.toFixed(2)})
                                   </div>
                                </TableCell>
                             </TableRow>
                          )
                       })}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>

           {/* Recent Trades */}
           <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Trades
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                       <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Asset</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {portfolio.trades.slice(0, 5).map((trade) => (
                          <TableRow key={trade.id}>
                             <TableCell className="text-muted-foreground text-xs">
                                {new Date(trade.timestamp).toLocaleTimeString()}
                             </TableCell>
                             <TableCell>
                                <Badge variant={trade.side === "buy" ? "default" : "destructive"}>
                                   {trade.side.toUpperCase()}
                                </Badge>
                             </TableCell>
                             <TableCell>{trade.coin}</TableCell>
                             <TableCell className="text-right">{trade.quantity.toFixed(6)}</TableCell>
                             <TableCell className="text-right">${trade.entryPrice.toFixed(2)}</TableCell>
                             <TableCell className="text-right">${trade.totalValue.toFixed(2)}</TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
