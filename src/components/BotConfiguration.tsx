import { useEffect, useState } from "react"
import { useSimulator } from "@/context/SimulatorContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Play, Square } from "lucide-react"

export function BotConfiguration() {
  const { botConfig, updateBotConfig, portfolio } = useSimulator()
  const [localConfig, setLocalConfig] = useState(botConfig)

  // Sync local state when global state updates (if needed)
  useEffect(() => {
    setLocalConfig(botConfig)
  }, [botConfig])

  // Handle Strategy Slider Changes
  // We want to keep the total at 100%. 
  // Naive approach: Just let them set arbitrary weights and we normalize in logic, 
  // OR strictly enforce 100% in UI.
  // For simplicity and UX: Let's use 3 independent sliders but show a warning if != 100%?
  // Or better: Let user set "Risky" and "Extreme", and "Moderate" fills the rest?
  // Let's try 3 independent sliders for now and normalized logic in the engine.
  // Actually, user wants to "choose... how much is allocated".
  
  const handleStrategyChange = (key: 'moderate' | 'risky' | 'extreme', value: number[]) => {
      setLocalConfig(prev => ({
          ...prev,
          strategies: {
              ...prev.strategies,
              [key]: value[0]
          }
      }))
  }

  const handleSave = () => {
      updateBotConfig(localConfig)
  }

  const toggleActive = () => {
      const newState = !localConfig.isActive
      setLocalConfig(prev => ({ ...prev, isActive: newState }))
      updateBotConfig({ isActive: newState })
  }
  
  const totalWeight = localConfig.strategies.moderate + localConfig.strategies.risky + localConfig.strategies.extreme

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
                <CardDescription>Configure your autonomous trading agent</CardDescription>
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

        {/* Strategy Mix */}
        <div className="space-y-6 pt-4 border-t">
            <h4 className="font-semibold text-sm">Strategy Mix ({totalWeight}%)</h4>
            
            {/* Moderate */}
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label className="text-blue-500">Moderate (Blue Chips)</Label>
                    <span className="text-sm">{localConfig.strategies.moderate}%</span>
                </div>
                <Slider 
                    value={[localConfig.strategies.moderate]} 
                    max={100} 
                    step={5} 
                    onValueChange={(v: number[]) => handleStrategyChange('moderate', v)}
                    className="py-1"
                />
            </div>

            {/* Risky */}
             <div className="space-y-2">
                <div className="flex justify-between">
                    <Label className="text-orange-500">Risky (Altcoins)</Label>
                    <span className="text-sm">{localConfig.strategies.risky}%</span>
                </div>
                <Slider 
                    value={[localConfig.strategies.risky]} 
                    max={100} 
                    step={5} 
                     onValueChange={(v: number[]) => handleStrategyChange('risky', v)}
                     className="py-1"
                />
            </div>

            {/* Extreme */}
             <div className="space-y-2">
                <div className="flex justify-between">
                    <Label className="text-red-500">Extreme (Memecoins)</Label>
                    <span className="text-sm">{localConfig.strategies.extreme}%</span>
                </div>
                <Slider 
                    value={[localConfig.strategies.extreme]} 
                    max={100} 
                    step={5} 
                     onValueChange={(v: number[]) => handleStrategyChange('extreme', v)}
                     className="py-1"
                />
            </div>
            
            {totalWeight !== 100 && (
                <div className="flex items-center gap-2 text-yellow-500 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    weights do not sum to 100%, they will be normalized.
                </div>
            )}
        </div>

        <Button className="w-full" variant="outline" onClick={handleSave}>
            Update Configuration
        </Button>

      </CardContent>
    </Card>
  )
}
