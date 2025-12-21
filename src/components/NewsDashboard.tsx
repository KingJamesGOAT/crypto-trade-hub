// Removed Newspaper import
import { useEffect, useState } from "react";
import { fetchCryptoNews, type NewsArticle } from "@/api/news-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { analyzeMarketSentiment } from "@/lib/news-sentiment";

export function NewsDashboard({ embedded }: { embedded?: boolean }) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [sentiment, setSentiment] = useState<{ mode: string, score: number }>({ mode: "NEUTRAL", score: 0 });

  useEffect(() => {
    const load = async () => {
      const articles = await fetchCryptoNews();
      setNews(articles);
      setSentiment(analyzeMarketSentiment(articles));
    };
    load();
  }, []);

  const Container = embedded ? "div" : Card;
  const containerProps = embedded ? { className: "w-full" } : { className: "w-full bg-slate-950 border-slate-800 text-white shadow-xl" };

  return (
    // @ts-ignore
    <Container {...containerProps}>
      <CardHeader className={`flex flex-row items-center justify-between ${embedded ? "p-0 pb-4" : "pb-2"}`}>
        <div className="flex items-center gap-2">
           <CardTitle className={embedded ? "text-base font-medium" : ""}>Live Market Intelligence</CardTitle>
        </div>
        
        {/* Sentiment Badge */}
        <div className="flex items-center gap-2">
           <Badge variant="outline" className={`
              ${sentiment.mode === "BULLISH" ? "text-green-400 border-green-400/30 bg-green-400/10" : 
                sentiment.mode === "BEARISH" ? "text-red-400 border-red-400/30 bg-red-400/10" : 
                "text-slate-400 border-slate-700 bg-slate-800/50"}
              font-mono text-xs capitalize
           `}>
              {sentiment.mode === "BULLISH" && <TrendingUp className="mr-1 h-3 w-3" />}
              {sentiment.mode === "BEARISH" && <TrendingDown className="mr-1 h-3 w-3" />}
              {sentiment.mode.toLowerCase()} ({(sentiment.score).toFixed(1)})
           </Badge>
        </div>
      </CardHeader>
      
      <CardContent className={embedded ? "p-0" : ""}>
        <ScrollArea className={`${embedded ? "h-[250px]" : "h-[400px]"} pr-4`}>
          <div className="space-y-3">
            {news.map((item) => (
              <div key={item.id} className="group flex gap-3 py-2 border-b border-border/40 last:border-0">
                {/* Minimalist: No image for cleaner look in embedded mode, or keep very small */}
                {!embedded && (
                    <img 
                    src={item.imageurl} 
                    alt="news" 
                    className="w-12 h-12 object-cover rounded bg-muted"
                    />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <a href={item.url} target="_blank" rel="noreferrer" className="font-medium text-sm hover:text-primary transition-colors line-clamp-1 block truncate">
                      {item.title}
                    </a>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                       {new Date(item.published_on * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  {/* Embedded: Clean single line summary */}
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.body}</p>
                  
                  {/* Minimal hashtags */}
                  <div className="flex gap-2 mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {item.tags.split("|").slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Container>
  );
}
