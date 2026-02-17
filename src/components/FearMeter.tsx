import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gauge } from "lucide-react"

export function FearMeter({ sentiment = 50 }: { sentiment?: number }) {
    // Determine color based on sentiment (0-100)
    // 0-25: Extreme Fear (Red)
    // 25-45: Fear (Orange)
    // 45-55: Neutral (Yellow)
    // 55-75: Greed (Light Green)
    // 75-100: Extreme Greed (Emerald)
    
    let color = "bg-yellow-500";
    let label = "Neutral";
    
    if (sentiment < 25) { color = "bg-red-600"; label = "Extreme Fear"; }
    else if (sentiment < 45) { color = "bg-orange-500"; label = "Fear"; }
    else if (sentiment > 75) { color = "bg-emerald-500"; label = "Extreme Greed"; }
    else if (sentiment > 55) { color = "bg-green-400"; label = "Greed"; }

    return (
        <Card className="border-border bg-card/50 backdrop-blur">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Gauge className="h-4 w-4" /> Market Mood
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center pt-2">
                    <div className="text-2xl font-bold mb-2">{sentiment}</div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${color} transition-all duration-1000 ease-out`} 
                            style={{ width: `${sentiment}%` }}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{label}</div>
                </div>
            </CardContent>
        </Card>
    )
}
