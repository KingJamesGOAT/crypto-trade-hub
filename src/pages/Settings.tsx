import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { binanceService } from "@/api/binance-service"
import { Loader2, Trash2, ShieldCheck, AlertTriangle, Sparkles } from "lucide-react"

export function Settings() {
  const { toast } = useToast()
  
  const [apiKey, setApiKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // Real Trading Mode State
  const [realTradingEnabled, setRealTradingEnabled] = useState(false)



  useEffect(() => {
     // Load initial state
     const creds = binanceService.getCredentials()
     if (creds) {
         setApiKey(creds.apiKey)
         setSecretKey(creds.secretKey)
         setIsSaved(true)
     }

     const mode = localStorage.getItem("trading_mode")
     if (mode === "real") setRealTradingEnabled(true)
     


  }, [])



  const handleSave = async () => {
     if (!apiKey || !secretKey) {
         toast({ title: "Error", description: "Please enter both API Key and Secret Key", variant: "destructive" })
         return
     }

     setIsLoading(true)
     try {
         // Validate
         binanceService.setCredentials(apiKey, secretKey)
         const isValid = await binanceService.validateConnection()
         
         if (isValid) {
             setIsSaved(true)
             toast({ title: "Success", description: "API Credentials verified and saved." })
         } else {
             binanceService.clearCredentials()
             toast({ title: "Connection Failed", description: "Could not verify credentials.", variant: "destructive" })
         }
     } catch (error) {
         toast({ title: "Error", description: "Failed to connect to API", variant: "destructive" })
     } finally {
         setIsLoading(false)
     }
  }

  const handleClear = () => {
      binanceService.clearCredentials()
      setApiKey("")
      setSecretKey("")
      setIsSaved(false)
      setRealTradingEnabled(false)
      localStorage.setItem("trading_mode", "simulator")
      toast({ title: "Cleared", description: "Credentials removed." })
  }

  const handleModeToggle = (enabled: boolean) => {
      if (enabled && !isSaved) {
          toast({ title: "Restricted", description: "Configure API Credentials before enabling Real Trading.", variant: "destructive" })
          return
      }
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
          <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-orange-500" />
                      Binance API Connection
                  </CardTitle>
                  <CardDescription>
                      Your keys are stored locally in your browser.
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                       <Label>API Key</Label>
                       <Input 
                         type="password" 
                         value={apiKey} 
                         onChange={e => setApiKey(e.target.value)}
                         placeholder="Paste your Binance API Key" 
                        />
                  </div>
                  <div className="space-y-2">
                       <Label>Secret Key</Label>
                       <Input 
                         type="password" 
                         value={secretKey} 
                         onChange={e => setSecretKey(e.target.value)}
                         placeholder="Paste your Binance Secret Key" 
                        />
                  </div>

                  <div className="flex gap-2 pt-2">
                      <Button onClick={handleSave} disabled={isLoading || isSaved} className="flex-1">
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isSaved ? "Saved" : "Verify & Save"}
                      </Button>
                      {isSaved && (
                          <Button variant="outline" onClick={handleClear} className="w-12 px-0 text-red-500 hover:text-red-400">
                             <Trash2 className="h-4 w-4" />
                          </Button>
                      )}
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
          <Card className="border-blue-500/20 bg-blue-500/5 md:col-span-2">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      Gemini AI Assistant (Optional)
                  </CardTitle>
                  <CardDescription>
                      Get a free API key from Google AI Studio (no credit card required)
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                       <Label>Gemini API Key</Label>
                       <Input 
                         type="password" 
                         placeholder="Paste your Gemini API Key (optional)" 
                         id="gemini-api-key"
                        />
                  </div>
                  
                  <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          const input = document.getElementById('gemini-api-key') as HTMLInputElement;
                          if (input?.value) {
                            localStorage.setItem('gemini_api_key', input.value);
                            toast({ title: "Success", description: "Gemini API key saved! Refresh the page to use the AI assistant." });
                          }
                        }}
                        className="flex-1"
                      >
                          Save API Key
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          localStorage.removeItem('gemini_api_key');
                          const input = document.getElementById('gemini-api-key') as HTMLInputElement;
                          if (input) input.value = '';
                          toast({ title: "Cleared", description: "API key removed." });
                        }}
                        className="w-12 px-0 text-red-500 hover:text-red-400"
                      >
                         <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>

                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-sm">
                      <p className="text-blue-200 mb-2">
                          <strong>How to get your free API key:</strong>
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-200/80 text-xs">
                          <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                          <li>Sign in with your Google account</li>
                          <li>Click "Create API Key"</li>
                          <li>Copy and paste it above</li>
                      </ol>
                      <p className="text-blue-200/60 text-xs mt-2">
                          Free tier: 1,500 requests/day • No credit card required
                      </p>
                  </div>
              </CardContent>
          </Card>
      </div>
    </div>
  )
}
