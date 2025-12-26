import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

import { Loader2, Trash2, ShieldCheck, AlertTriangle } from "lucide-react"

export function Settings() {
  const { toast } = useToast()
  
  // Real Trading Mode State
  const [realTradingEnabled, setRealTradingEnabled] = useState(false)

  useEffect(() => {
     // Load initial state
     const mode = localStorage.getItem("trading_mode")
     if (mode === "real") setRealTradingEnabled(true)
  }, [])

  const handleModeToggle = (enabled: boolean) => {
      setRealTradingEnabled(enabled)
      localStorage.setItem("trading_mode", enabled ? "real" : "simulator")
      
      if (enabled) {
          toast({ title: "Real Trading ENABLED", description: "You are now trading with REAL funds. Be careful.", className: "bg-red-900 border-red-800 text-white" })
      } else {
          toast({ title: "Simulator Mode", description: "Switched back to paper trading." })
      }
  }





  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
            Manage your API connection and trading preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                      Server-Side Bot Active
                  </CardTitle>
                  <CardDescription>
                      Your trading bot is running on the cloud (GitHub Actions).
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="text-sm text-green-200 bg-green-900/40 p-4 rounded-md border border-green-800">
                      <strong>Secure Configuration:</strong><br/>
                      API Keys are now managed securely via <strong>GitHub Secrets</strong>.<br/>
                      You do not need to enter credentials here.
                  </div>
                  <div className="text-xs text-muted-foreground">
                      To update keys, go to your GitHub Repository &gt; Settings &gt; Secrets.
                  </div>
              </CardContent>
          </Card>

          <Card className={realTradingEnabled ? "border-red-500/50 bg-red-500/10" : ""}>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${realTradingEnabled ? "text-red-500" : "text-muted-foreground"}`} />
                      Trading Mode
                  </CardTitle>
                  <CardDescription>
                      Switch between Simulator (Test funds) and Real Trading.
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                   <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                          <Label className="text-base">Real Trading</Label>
                          <p className="text-sm text-muted-foreground">
                             Enable actual order execution on Binance.
                          </p>
                      </div>
                      <Switch 
                         checked={realTradingEnabled}
                         onCheckedChange={handleModeToggle}
                      />
                   </div>
                   
                   {realTradingEnabled && (
                       <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30 text-sm text-red-200">
                           <strong>WARNING:</strong> You are in LIVE mode. Actions in the Order Entry form will execute real trades on your Binance account. Proceed with caution.
                       </div>
                   )}
              </CardContent>
          </Card>

          {/* GEMINI AI SETTINGS */}
{/* Gemini AI Settings Removed (Using Puter.js) */}
      </div>
    </div>
  )
}
