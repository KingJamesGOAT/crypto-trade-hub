
import { useState } from "react";
import { NewsDashboard } from "@/components/NewsDashboard";
import { type NewsArticle } from "@/api/news-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ListFilter, RefreshCcw, ExternalLink, Calendar, Tag } from "lucide-react";
import { useNews } from "@/context/NewsContext";

// Helper to determine importance
const isArticleImportant = (item: NewsArticle) => {
    const text = (item.title + item.body).toLowerCase();
    return text.includes("etf") || text.includes("sec") || text.includes("regulation") || text.includes("hack") || text.includes("all-time high") || text.includes("trump") || text.includes("federal reserve");
};

export function News() {
  const { articles, loading, refreshNews } = useNews();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Filter Logic
  const importantNews = articles.filter(isArticleImportant);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Market Intelligence
             </h2>
             <p className="text-muted-foreground mt-1">
                Algorithmic sentiment analysis and real-time aggregation.
             </p>
           </div>
           <Button variant="outline" size="sm" onClick={refreshNews} disabled={loading} className="w-fit">
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
           </Button>
        </div>

        {/* Section 1: The "Brains" (Dashboard) */}
        <section>
          <NewsDashboard articles={articles} loading={loading} />
        </section>

        {/* Section 2: The "Feed" (Raw Data) */}
        <section className="space-y-4">
          <Tabs defaultValue="latest" className="w-full">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold flex items-center gap-2">
                 <ListFilter className="h-5 w-5 text-blue-500" />
                 News Feed
               </h2>
               <TabsList className="bg-slate-900 border border-slate-800">
                 <TabsTrigger value="latest">Latest</TabsTrigger>
                 <TabsTrigger value="important" className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    High Impact
                 </TabsTrigger>
               </TabsList>
            </div>

            {loading ? (
               <div className="flex flex-col items-center justify-center p-12 space-y-4">
                 <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                 <p className="text-sm text-slate-500">Scanning global markets...</p>
               </div>
            ) : (
              <>
                <TabsContent value="latest" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {articles.length === 0 ? (
                      <EmptyState />
                  ) : (
                      articles.map((news) => (
                        <NewsCard 
                            key={news.id} 
                            article={news} 
                            onClick={setSelectedArticle}
                        />
                      ))
                  )}
                </TabsContent>
                
                <TabsContent value="important" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {importantNews.length === 0 ? (
                    <div className="text-muted-foreground text-center py-12 border border-dashed border-slate-800 rounded-lg">
                        No critical "High Impact" events detected in the last 24h.
                    </div>
                  ) : (
                    importantNews.map((news) => (
                        <NewsCard 
                            key={news.id} 
                            article={news} 
                            onClick={setSelectedArticle}
                        />
                    ))
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </section>

        {/* Article Reader Modal */}
        <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                {selectedArticle && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(selectedArticle.published_on * 1000).toLocaleString()}</span>
                                <span>•</span>
                                <span className="text-blue-400 font-medium">{selectedArticle.source}</span>
                            </div>
                            <DialogTitle className="text-2xl leading-normal">{selectedArticle.title}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                             {/* Image */}
                             <img 
                                src={selectedArticle.imageurl} 
                                alt={selectedArticle.title} 
                                className="w-full h-64 object-cover rounded-lg border border-slate-800"
                             />
                             
                             {/* Tags */}
                             <div className="flex flex-wrap gap-2">
                                {selectedArticle.tags.split("|").map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        <Tag className="h-3 w-3 mr-1" /> {tag}
                                    </Badge>
                                ))}
                             </div>

                             {/* Body */}
                             <div className="text-lg leading-relaxed text-slate-300">
                                 {selectedArticle.body}
                             </div>

                             {isArticleImportant(selectedArticle) && (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-yellow-500">High Impact Event</h4>
                                        <p className="text-sm text-yellow-200/70">This article contains keywords flagged by our algorithm as potentially market-moving.</p>
                                    </div>
                                </div>
                             )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <DialogClose asChild>
                                <Button variant="secondary">Close</Button>
                            </DialogClose>
                            <Button className="gap-2" onClick={() => window.open(selectedArticle.url, '_blank')}>
                                Read Full Article <ExternalLink className="h-4 w-4" />
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}

function NewsCard({ 
    article, 
    onClick 
}: { 
    article: NewsArticle, 
    onClick: (a: NewsArticle) => void 
}) {
  // Determine highlight internally based on the same logic used for filtering
  const isHighImpact = isArticleImportant(article);

  return (
    <Card 
        onClick={() => onClick(article)}
        className={`group relative hover:bg-slate-900/50 transition-all duration-200 border-slate-800 bg-slate-950/50 cursor-pointer ${isHighImpact ? 'border-l-4 border-l-yellow-500' : ''}`}
    >
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
        {/* Image: Hidden on mobile for density, visible on desktop */}
        <div className="hidden sm:block shrink-0">
            <img 
            src={article.imageurl} 
            alt="News" 
            className="w-32 h-20 object-cover rounded-md opacity-70 group-hover:opacity-100 transition-opacity bg-slate-900"
            />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4">
             <h3 className="font-semibold text-base leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                {/* Visual link style, but functionality is handled by parent Card onClick */}
               <span className="hover:underline decoration-blue-400 underline-offset-2">
                 {article.title}
               </span>
             </h3>
             <span className="text-xs text-slate-500 whitespace-nowrap shrink-0 font-mono">
               {new Date(article.published_on * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          </div>
          
          <p className="text-sm text-slate-400 mt-2 line-clamp-2 pr-4">{article.body}</p>
          
          <div className="flex items-center gap-2 mt-3 relative z-10">
             {article.tags.split("|").slice(0, 3).map(tag => (
               <Badge key={tag} variant="secondary" className="text-[10px] h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700">
                 {tag}
               </Badge>
             ))}
             <div className="ml-auto text-xs text-slate-600 flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
               {article.source}
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
    return (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
            <p className="text-muted-foreground mb-4">No news articles found. The feed might be momentarily down.</p>
            <Button variant="link" onClick={() => window.location.reload()}>
                Retry Connection
            </Button>
        </div>
    )
}
