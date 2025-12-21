import { useEffect, useState } from "react"
import { useSimulator } from "@/context/SimulatorContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { NewsDashboard } from "@/components/NewsDashboard"

export function BotConfiguration() {
  const { botConfig, updateBotConfig, portfolio, activeSymbols, botStatus, isConnected } = useSimulator()
  const [localConfig, setLocalConfig] = useState(botConfig)
  const { toast } = useToast()

  // Sync local state when global state updates (if needed)
  useEffect(() => {
    setLocalConfig(botConfig)
  }, [botConfig])

  const handleSave = () => {
      updateBotConfig(localConfig)
      toast({
          title: "Configuration Saved",
          description: `Bot allocation updated to CHF ${localConfig.totalAllocated}`,
      })
  }

  const toggleActive = () => {
      const newState = !localConfig.isActive
      setLocalConfig(prev => ({ ...prev, isActive: newState }))
      updateBotConfig({ isActive: newState })
  }
  
  return (
    <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    Bot Configuration
                    <Badge variant={localConfig.isActive ? "default" : "secondary"}>
                        {localConfig.isActive ? "RUNNING" : "STOPPED"}
                    </Badge>
                </CardTitle>
                <CardDescription>Autonomous Trading Agent V2</CardDescription>
            </div>
             <Button 
                size="icon"
                variant={localConfig.isActive ? "destructive" : "default"}
                onClick={toggleActive}
            >
                {localConfig.isActive ? <Square className="fill-current" /> : <Play className="fill-current" />}
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Allocation */}
        <div className="space-y-2">
            <div className="flex justify-between">
                <Label>Allocation (CHF)</Label>
                <span className="text-sm font-medium text-muted-foreground">
                    Available Cash: CHF {portfolio.simulator.currentBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
            </div>
            <div className="flex gap-2">
                <Input 
                    type="number" 
                    value={localConfig.totalAllocated}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, totalAllocated: parseFloat(e.target.value) }))}
                    onBlur={() => updateBotConfig({ totalAllocated: localConfig.totalAllocated })}
                    className="flex-1"
                />
            </div>
            <p className="text-xs text-muted-foreground">
                Amount of capital the bot is allowed to use from your balance.
            </p>
        </div>

        {/* Info Section */}
        <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm">Active Strategy Engine</h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                    <span>Engine Status:</span>
                    <span className="text-foreground">Online</span>
                </div>
                <div className="flex justify-between">
                    <span>Active Strategies:</span>
                    <span className="text-foreground">Momentum & Mean Reversal</span>
                </div>
                <div className="flex justify-between">
                    <span>Watched Assets:</span>
                    <span className="text-foreground">{activeSymbols.length} Pairs</span>
                </div>
            </div>
        </div>

        {/* Thinking Box */}
        {localConfig.isActive && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                
                {/* Header: Activity + Connection */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Agent Activity
                    </div>
                    
                    <div className={`flex items-center gap-1.5 text-[10px] uppercase font-bold ${isConnected ? "text-green-500" : "text-red-500"}`}>
                        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {isConnected ? "Connected" : "Disconnected"}
                    </div>
                </div>

                {/* Status Text */}
                <div className="space-y-1">
                    <p className="text-sm font-mono text-foreground break-words leading-snug">
                        {botStatus}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        Strategy: Momentum & Mean Reversal
                    </p>
                </div>
            </div>
        )}

        <Button className="w-full" variant="outline" onClick={handleSave}>
            Update Configuration
        </Button>

        <div className="pt-6 mt-6 border-t border-primary/10">
            <NewsDashboard embedded={true} />
        </div>

      </CardContent>
    </Card>
  )
}
