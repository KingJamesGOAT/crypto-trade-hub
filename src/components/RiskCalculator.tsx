import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, Wallet } from "lucide-react"
import { useSimulator } from "@/context/SimulatorContext"

export function RiskCalculator() {
    const { balance } = useSimulator()
    const [portfolioSize, setPortfolioSize] = useState("")
    const [riskPercent, setRiskPercent] = useState("1")
    const [entryPrice, setEntryPrice] = useState("")
    const [stopLoss, setStopLoss] = useState("")
    const [result, setResult] = useState<{ positionSize: number, coinAmount: number } | null>(null)

    const calculate = () => {
        const port = parseFloat(portfolioSize)
        const risk = parseFloat(riskPercent)
        const entry = parseFloat(entryPrice)
        const sl = parseFloat(stopLoss)

        if (!port || !risk || !entry || !sl) return

        // Risk Amount = Portfolio * (Risk% / 100)
        const riskAmount = port * (risk / 100)
        
        // Stop Loss % distance (decimal) = |Entry - SL| / Entry
        const slDistance = Math.abs(entry - sl) / entry
        
        // Position Size = Risk Amount / SL Distance
        const posSize = riskAmount / slDistance
        
        // Coin Amount = Position Size / Entry
        const coinAmt = posSize / entry

        setResult({
            positionSize: posSize,
            coinAmount: coinAmt
        })
    }
    
    // Auto-calc when inputs change if valid
    useEffect(() => {
        calculate()
    }, [portfolioSize, riskPercent, entryPrice, stopLoss])

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 bg-black/40 border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white">
                    <Calculator className="h-4 w-4" />
                    <span className="hidden sm:inline">Risk Calc</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-wider text-emerald-400">
                        <Calculator className="h-5 w-5" /> Position Range Calculator
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    
                    {/* Portfolio Size Input with Auto-Fill */}
                    <div className="grid gap-2">
                        <Label htmlFor="portfolio" className="text-xs font-mono text-muted-foreground">Portfolio Size ($)</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="portfolio" 
                                value={portfolioSize} 
                                onChange={(e) => setPortfolioSize(e.target.value)}
                                className="bg-white/5 border-white/10 font-mono"
                                placeholder="10000"
                            />
                            <Button 
                                size="icon" 
                                variant="outline" 
                                className="aspect-square border-emerald-500/30 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                                onClick={() => setPortfolioSize(balance.toFixed(2))}
                                title="Use Current Balance"
                            >
                                <Wallet className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="risk" className="text-xs font-mono text-muted-foreground">Risk % per Trade</Label>
                            <Input 
                                id="risk" 
                                value={riskPercent} 
                                onChange={(e) => setRiskPercent(e.target.value)}
                                className="bg-white/5 border-white/10 font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="entry" className="text-xs font-mono text-muted-foreground">Entry Price ($)</Label>
                            <Input 
                                id="entry" 
                                value={entryPrice} 
                                onChange={(e) => setEntryPrice(e.target.value)}
                                className="bg-white/5 border-white/10 font-mono"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sl" className="text-xs font-mono text-muted-foreground">Stop Loss ($)</Label>
                            <Input 
                                id="sl" 
                                value={stopLoss} 
                                onChange={(e) => setStopLoss(e.target.value)}
                                className="bg-white/5 border-white/10 font-mono"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* RESULTS */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground uppercase font-bold">Max Position Size</span>
                        <span className="text-xl font-bold font-mono text-white tabular-nums">
                            ${result ? result.positionSize.toLocaleString(undefined, {maximumFractionDigits: 2}) : "0.00"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-2">
                         <span className="text-xs text-muted-foreground uppercase font-bold">Units to Buy</span>
                         <span className="text-sm font-mono text-emerald-400 tabular-nums">
                            {result ? result.coinAmount.toFixed(4) : "0.0000"} UNITS
                         </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
