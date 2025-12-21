import { useState, useEffect } from "react"
import { useSimulator } from "@/context/SimulatorContext"
import { getSimplePrice } from "@/api/coingecko"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Zap } from "lucide-react"

import { BotConfiguration } from "@/components/BotConfiguration"
import { BotDashboard } from "@/components/BotDashboard"
// import { NewsDashboard } from "@/components/NewsDashboard"
import { AVAILABLE_COINS } from "@/data/coins"

export function Simulator() {
  const { portfolio, executeTrade, resetSimulator, addFunds } = useSimulator()
  const { toast } = useToast()
  
  // Manual Trade State
  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin")
  const [amount, setAmount] = useState("")
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy")
  const [inputType, setInputType] = useState<"fiat" | "quantity">("fiat")

  // Add Funds State
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false)
  const [fundsAmount, setFundsAmount] = useState("")

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

  const handleAddFunds = (isDeposit: boolean) => {
      let val = parseFloat(fundsAmount)
      if (val <= 0) return

      if (!isDeposit) {
          if (val > portfolio.simulator.currentBalance) {
              toast({ title: "Error", description: "Insufficient funds to withdraw", variant: "destructive" })
              return
          }
          val = -val
      }

      addFunds(val)
      toast({ 
          title: isDeposit ? "Funds Added" : "Funds Withdrawn", 
          description: `Successfully ${isDeposit ? "added" : "withdrawn"} CHF ${Math.abs(val).toLocaleString()}` 
      })
      setIsAddFundsOpen(false)
      setFundsAmount("")
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
    <div className="space-y-6 pb-12">
      {/* Header & Balance */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Pro Simulator
          </h2>
          <p className="text-muted-foreground">
            Advanced autonomous trading environment
          </p>
        </div>
        <div className="flex items-center gap-4">
             <Card className="px-4 py-2 border-primary/50 bg-primary/10">
                 <div className="flex flex-col items-end">
                     <span className="text-xs text-muted-foreground uppercase font-bold">Available Capital</span>
                     <span className="text-xl font-mono font-bold text-primary">
                        CHF {portfolio.simulator.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </span>
                 </div>
             </Card>

             <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
                 <DialogTrigger asChild>
                     <Button variant="outline" size="sm" className="h-full">
                         Manage Funds
                     </Button>
                 </DialogTrigger>
                 <DialogContent>
                     <DialogHeader>
                         <DialogTitle>Manage Simulator Funds</DialogTitle>
                         <DialogDescription>
                             Add or withdraw capital from your simulator balance.
                         </DialogDescription>
                     </DialogHeader>
                     
                     <Tabs defaultValue="deposit" className="w-full">
                         <TabsList className="grid w-full grid-cols-2 mb-4">
                             <TabsTrigger value="deposit">Deposit</TabsTrigger>
                             <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                         </TabsList>
                         
                         <TabsContent value="deposit" className="space-y-4">
                             <div className="space-y-2">
                                 <Label>Amount to Add (CHF)</Label>
                                 <Input 
                                    type="number" 
                                    placeholder="1000" 
                                    value={fundsAmount}
                                    onChange={(e) => setFundsAmount(e.target.value)}
                                 />
                             </div>
                             <Button onClick={() => handleAddFunds(true)} className="w-full">
                                 Deposit Funds
                             </Button>
                         </TabsContent>
                         
                         <TabsContent value="withdraw" className="space-y-4">
                             <div className="space-y-2">
                                 <Label>Amount to Withdraw (CHF)</Label>
                                 <Input 
                                    type="number" 
                                    placeholder="500" 
                                    value={fundsAmount}
                                    onChange={(e) => setFundsAmount(e.target.value)}
                                 />
                             </div>
                             <Button onClick={() => handleAddFunds(false)} variant="destructive" className="w-full">
                                 Withdraw Funds
                             </Button>
                         </TabsContent>
                     </Tabs>
                 </DialogContent>
             </Dialog>

             <Button variant="destructive" size="icon" onClick={resetSimulator} title="Reset Account">
                <RefreshCw className="w-4 h-4" />
             </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="dashboard">Bot Dashboard</TabsTrigger>
              <TabsTrigger value="manual">Manual Execution</TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Bot Config */}
                  <div className="lg:col-span-1 space-y-6">
                      <BotConfiguration />
                  </div>
                  
                  {/* Right: Performance Graph & Stats */}
                  <div className="lg:col-span-2">
                       <BotDashboard />
                  </div>
              </div>
          </TabsContent>

          {/* MANUAL TRADE TAB */}
          <TabsContent value="manual">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card className="h-full border-blue-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-500" />
                                Manual Execution
                            </CardTitle>
                            <CardDescription>Override bot commands with manual orders.</CardDescription>
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
                            <div className="text-sm text-right text-muted-foreground font-mono">
                                Price: {isLoadingPrice ? "..." : `$${currentPrice.toLocaleString()}`}
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
                                    <SelectItem value="fiat">USD</SelectItem>
                                    <SelectItem value="quantity">{selectedCoin.symbol}</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
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
                </div>
                
                <div className="lg:col-span-2">
                    <BotDashboard /> 
                </div>
              </div>
          </TabsContent>
      </Tabs>

    </div>
  )
}
