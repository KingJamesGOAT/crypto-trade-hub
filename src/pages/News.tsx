import { useEffect, useState } from "react";
// import { Layout } from "@/components/Layout";
import { NewsDashboard } from "@/components/NewsDashboard";
import { fetchCryptoNews, type NewsArticle } from "@/api/news-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle } from "lucide-react";

export function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      const data = await fetchCryptoNews();
      setArticles(data);
      setLoading(false);
    };
    loadNews();
  }, []);

  // Filter 1: "Latest" is just the raw list
  const latestNews = articles;

  // Filter 2: "Important / This Month"
  // Logic: We assume "Important" = items with High Sentiment Keywords or specific "Major" tags
  const importantNews = articles.filter(item => {
    const text = (item.title + item.body).toLowerCase();
    const isMajor = text.includes("etf") || text.includes("sec") || text.includes("regulation") || text.includes("hack") || text.includes("all-time high") || text.includes("trump") || text.includes("federal reserve");
    return isMajor;
  });

  return (
    <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-2">
           <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Market Intelligence
           </h2>
           <p className="text-muted-foreground">
              Live news feed and sentiment analysis powered by AI.
           </p>
        </div>

        {/* Top Section: The Bot's Brain (Sentiment) */}
        <section>
          {/* <h2 className="text-xl font-bold text-white mb-4">AI Sentiment Analysis</h2> */}
          <NewsDashboard /> 
        </section>

        {/* Main News Feed */}
        <section>
          <Tabs defaultValue="latest" className="w-full">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold">News Feed</h2>
               <TabsList className="bg-secondary">
                 <TabsTrigger value="latest">Latest Updates</TabsTrigger>
                 <TabsTrigger value="important" className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    High Impact
                 </TabsTrigger>
               </TabsList>
            </div>

            {loading ? (
               <div className="flex justify-center p-12">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
            ) : (
              <>
                <TabsContent value="latest" className="space-y-4">
                  {latestNews.length === 0 ? (
                      <div className="text-center py-12">
                          <p className="text-muted-foreground mb-4">No news articles found. The feed might be momentarily down.</p>
                          <button onClick={() => window.location.reload()} className="text-primary hover:underline">
                              Retry Connection
                          </button>
                      </div>
                  ) : (
                      latestNews.map((news) => <NewsCard key={news.id} article={news} />)
                  )}
                </TabsContent>
                
                <TabsContent value="important" className="space-y-4">
                  {importantNews.length === 0 ? (
                    <div className="text-muted-foreground text-center py-8">No major "High Impact" events detected in the current feed.</div>
                  ) : (
                    importantNews.map((news) => <NewsCard key={news.id} article={news} highlight />)
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </section>
    </div>
  );
}

function NewsCard({ article, highlight }: { article: NewsArticle, highlight?: boolean }) {
  return (
    <Card className={`hover:border-primary/50 transition-colors ${highlight ? 'border-l-4 border-l-yellow-500' : ''}`}>
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
        <img 
          src={article.imageurl} 
          alt="News" 
          className="w-full sm:w-32 h-20 object-cover rounded-md bg-secondary"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
             <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
               <a href={article.url} target="_blank" rel="noreferrer">{article.title}</a>
             </h3>
             <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
               {new Date(article.published_on * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{article.body}</p>
          <div className="flex gap-2 mt-3">
             {article.tags.split("|").slice(0, 3).map(tag => (
               <Badge key={tag} variant="outline" className="text-[10px] h-5">{tag}</Badge>
             ))}
             <span className="text-xs text-muted-foreground flex items-center ml-auto">
               via {article.source}
             </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
