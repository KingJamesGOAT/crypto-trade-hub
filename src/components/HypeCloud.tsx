import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function HypeCloud() {
    // In a real app, this would be fetched from database 'market_briefings' -> 'key_narratives'
    // For now we can mock or fetch same as others. 
    // Let's make it accept props or be static for the MVP structure
    
    const tags = ["AI", "Memecoins", "Solana", "L2", "Gaming", "DePin", "RWA"]

    return (
        <Card className="border-border bg-card/50 backdrop-blur">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4 text-yellow-500" /> Hype Cloud
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag, i) => (
                        <Badge 
                            key={i} 
                            variant="secondary" 
                            className={`
                                cursor-default
                                ${i === 0 ? 'text-lg py-1 px-3 bg-indigo-500/20 text-indigo-300' : ''}
                                ${i === 1 ? 'text-base py-1 px-2 bg-purple-500/20 text-purple-300' : ''}
                            `}
                        >
                            #{tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
