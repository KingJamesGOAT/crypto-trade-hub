import { useSimulator } from "@/context/SimulatorContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { BotConfiguration } from "@/components/BotConfiguration"
import { BotDashboard } from "@/components/BotDashboard"

export function Simulator() {
  const { balance, resetSimulator } = useSimulator()
  
  return (
    <div className="space-y-6 pb-12">
      {/* Header & Balance */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Ghost Bot Simulator
          </h2>
          <p className="text-muted-foreground">
            Server-side autonomous trading environment
          </p>
        </div>
        <div className="flex items-center gap-4">
             <Card className="px-4 py-2 border-primary/50 bg-primary/10">
                 <div className="flex flex-col items-end">
                     <span className="text-xs text-muted-foreground uppercase font-bold">Available Capital</span>
                     <span className="text-xl font-mono font-bold text-primary">
                        CHF {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </span>
                 </div>
             </Card>

             <Button variant="destructive" size="icon" onClick={resetSimulator} title="Reset Account">
                <RefreshCw className="w-4 h-4" />
             </Button>
        </div>
      </div>

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

    </div>
  )
}

