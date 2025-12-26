import { useSimulator } from "@/context/SimulatorContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Wifi } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function BotConfiguration() {
  const { isBotActive, toggleBot, balance, isLoading } = useSimulator()
  const { toast } = useToast()

  const handleToggle = () => {
      toggleBot()
      toast({
          title: !isBotActive ? "Bot Resumed" : "Bot Paused",
          description: !isBotActive ? "Ghost Bot is now running on GitHub Actions." : "Bot execution paused.",
      })
  }
  
  return (
    <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    Bot Configuration
                    <Badge variant={isBotActive ? "default" : "secondary"}>
                        {isBotActive ? "RUNNING" : "STOPPED"}
                    </Badge>
                </CardTitle>
                <CardDescription>Ghost Bot Engine (GitHub Actions)</CardDescription>
            </div>
             <Button 
                size="icon"
                variant={isBotActive ? "destructive" : "default"}
                onClick={handleToggle}
                disabled={isLoading}
            >
                {isBotActive ? <Square className="fill-current" /> : <Play className="fill-current" />}
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Info Section */}
        <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm">Active Strategy Engine</h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                    <span>Engine Status:</span>
                    <span className="text-foreground">Online</span>
                </div>
                <div className="flex justify-between">
                    <span>Strategy:</span>
                    <span className="text-foreground">Bollinger Sniper</span>
                </div>
                 <div className="flex justify-between">
                    <span>Balance:</span>
                    <span className="text-foreground font-mono">${balance.toFixed(2)}</span>
                </div>
            </div>
        </div>

        {/* Thinking Box */}
        {isBotActive && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                
                {/* Header: Activity + Connection */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Live Connection
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-green-500">
                        <Wifi className="w-3 h-3" />
                        Supabase Realtime
                    </div>
                </div>

                {/* Status Text */}
                <div className="space-y-1">
                    <p className="text-sm font-mono text-foreground break-words leading-snug">
                        Subscribed to remote bot events...
                    </p>
                </div>
            </div>
        )}

      </CardContent>
    </Card>
  )
}

