import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Flame, Globe } from "lucide-react"
import { fetchCryptoNews, type NewsArticle } from "@/api/news-service"

export function CompactNewsFeed() {
    const [news, setNews] = useState<NewsArticle[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadNews = async () => {
            const articles = await fetchCryptoNews()
            setNews(articles.slice(0, 10)) // Limit to top 10
            setLoading(false)
        }
        loadNews()
    }, [])

    return (
        <Card className="h-[400px] border-orange-500/20 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(249,115,22,0.1)] flex flex-col">
            <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-mono text-orange-400 uppercase tracking-wider">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Breaking News
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-300 bg-orange-500/10">
                    LIVE
                </Badge>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden relative">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                        <Globe className="h-8 w-8 text-muted-foreground/20 animate-spin" />
                        <span className="text-xs text-muted-foreground animate-pulse">Scanning Global Media...</span>
                    </div>
                ) : (
                    <ScrollArea className="h-full w-full">
                        <div className="divide-y divide-white/5">
                            {news.map((item) => (
                                <a 
                                    key={item.id} 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="block p-4 hover:bg-white/5 transition-colors group"
                                >
                                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-orange-300 transition-colors line-clamp-2 leading-snug mb-2">
                                        {item.title}
                                    </h4>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span className="text-orange-500/80 font-mono uppercase">{item.source}</span>
                                            <span>•</span>
                                            <span>{new Date(item.published_on * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
