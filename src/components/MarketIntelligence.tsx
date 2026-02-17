import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, TrendingUp, TrendingDown, Newspaper } from "lucide-react"

// Initialize Supabase (Frontend)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

interface Briefing {
    id: number
    created_at: string
    sentiment_score: number
    summary: string
    key_narratives: string[]
}

export function MarketIntelligence() {
    const [briefing, setBriefing] = useState<Briefing | null>(null)

    useEffect(() => {
        if (!supabase) return

        const fetchLatest = async () => {
            const { data } = await supabase
                .from('market_briefings')
                .select('*')
                .order('id', { ascending: false })
                .limit(1)
                .single()
            
            if (data) setBriefing(data)
        }

        fetchLatest()
    }, [])

    if (!briefing) {
        return (
            <Card className="h-full border-border bg-card shadow-sm opacity-50">
                <CardHeader><CardTitle className="text-sm">Market Intelligence</CardTitle></CardHeader>
                <CardContent className="text-xs">Initializing Neural Link...</CardContent>
            </Card>
        )
    }

    const sentimentColor = briefing.sentiment_score > 0 ? "text-green-500" : "text-red-500"
    const SentimentIcon = briefing.sentiment_score > 0 ? TrendingUp : TrendingDown

    return (
        <Card className="h-full border-purple-500/20 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="flex items-center gap-2 text-sm font-mono text-purple-400 uppercase tracking-wider">
                    <BrainCircuit className="h-4 w-4" />
                    AI Market Intelligence
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {/* 1. Sentiment Score */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase">Global Sentiment</span>
                    <div className={`flex items-center gap-2 font-bold ${sentimentColor}`}>
                        <SentimentIcon className="h-4 w-4" />
                        <span>{(briefing.sentiment_score * 100).toFixed(0)}%</span>
                    </div>
                </div>

                {/* 2. Key Narratives */}
                <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground uppercase">Active Narratives</span>
                    <div className="flex flex-wrap gap-2">
                        {briefing.key_narratives?.map((tag, i) => (
                            <Badge key={i} variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10 text-[10px]">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* 3. Daily Briefing */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase">
                        <Newspaper className="h-3 w-3" />
                         Latest Briefing ({new Date(briefing.created_at).toLocaleDateString()})
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed font-mono">
                        {briefing.summary}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
