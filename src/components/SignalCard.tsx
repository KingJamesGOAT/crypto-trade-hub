import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, Search, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TradeProps {
    symbol: string
    entryPrice: number
    currentPrice: number
    amount: number
    pnl: number
    pnlPercent: number
    reasoning?: string
    confidence?: string
}

export function SignalCard({ trade }: { trade: TradeProps }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] hover:bg-white/10">
                    <Search className="h-3 w-3 mr-1" />
                    Audit
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-green-500/30 text-white backdrop-blur-xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-mono uppercase tracking-widest text-green-500">
                        <BrainCircuit className="h-5 w-5" />
                        Signal Anatomy
                    </DialogTitle>
                    <DialogDescription className="text-white/50">
                        Audit the AI's decision process for this trade.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Header Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded bg-white/5 border border-white/10">
                            <span className="block text-[10px] text-muted-foreground uppercase">Asset</span>
                            <span className="text-lg font-bold">{trade.symbol.replace("USDT","")}</span>
                        </div>
                         <div className="p-3 rounded bg-white/5 border border-white/10">
                            <span className="block text-[10px] text-muted-foreground uppercase">Entry Price</span>
                            <span className="text-lg font-mono">${trade.entryPrice.toFixed(4)}</span>
                        </div>
                    </div>

                    {/* AI Reasoning Block */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-green-400 flex items-center gap-2">
                                <BrainCircuit className="h-3 w-3" />
                                Neural Logic
                            </span>
                            <Badge variant="outline" className="border-green-500 text-green-500 bg-green-500/10">
                                {trade.confidence || "UNKNOWN"} CONFIDENCE
                            </Badge>
                        </div>
                        <div className="p-4 rounded-md bg-green-900/10 border border-green-500/20 text-sm font-mono leading-relaxed text-green-100/80">
                            "{trade.reasoning || 'Legacy trade. No AI metadata available.'}"
                        </div>
                    </div>

                    {/* Technicals Snapshot (Mocked for now) */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <BarChart3 className="h-3 w-3" />
                            Technical Context
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 rounded bg-white/5">
                                <span className="block text-[10px] text-muted-foreground">Trend</span>
                                <span className="text-xs font-bold text-green-400">UP</span>
                            </div>
                             <div className="p-2 rounded bg-white/5">
                                <span className="block text-[10px] text-muted-foreground">RSI</span>
                                <span className="text-xs font-bold text-white">42.5 (OK)</span>
                            </div>
                             <div className="p-2 rounded bg-white/5">
                                <span className="block text-[10px] text-muted-foreground">Volume</span>
                                <span className="text-xs font-bold text-green-400">HIGH</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
