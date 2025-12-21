import { useEffect, useState } from "react";
import { fetchCryptoNews, type NewsArticle } from "@/api/news-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, TrendingUp, TrendingDown, Newspaper } from "lucide-react";
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
           <Newspaper className="h-5 w-5 text-blue-400" />
           <CardTitle>Live Crypto Intelligence</CardTitle>
        </div>
        
        {/* Sentiment Badge - Shows what the Bot is "Thinking" */}
        <div className="flex items-center gap-2">
           <span className="text-xs text-slate-400">Bot Perception:</span>
           <Badge variant={sentiment.mode === "BULLISH" ? "default" : sentiment.mode === "BEARISH" ? "destructive" : "secondary"}
                  className={sentiment.mode === "BULLISH" ? "bg-green-600 hover:bg-green-700" : ""}>
              {sentiment.mode === "BULLISH" && <TrendingUp className="mr-1 h-3 w-3" />}
              {sentiment.mode === "BEARISH" && <TrendingDown className="mr-1 h-3 w-3" />}
              {sentiment.mode} (Score: {sentiment.score})
           </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {news.map((item) => (
              <div key={item.id} className="group flex gap-4 p-3 rounded-lg hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800">
                <img 
                  src={item.imageurl} 
                  alt="news" 
                  className="w-16 h-16 object-cover rounded-md opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                       {new Date(item.published_on * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.body}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                     <div className="flex gap-2">
                        {item.tags.split("|").slice(0, 3).map(tag => (
                           <Badge key={tag} variant="outline" className="text-[10px] h-5 border-slate-700 text-slate-400">
                             {tag}
                           </Badge>
                        ))}
                     </div>
                     <a href={item.url} target="_blank" rel="noreferrer" className="text-xs flex items-center text-blue-500 hover:text-blue-400">
                        Read <ExternalLink className="ml-1 h-3 w-3" />
                     </a>
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
