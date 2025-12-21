
import { useMemo } from "react";
import { type NewsArticle } from "@/api/news-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity, Hash } from "lucide-react";
import { analyzeMarketSentiment } from "@/lib/news-sentiment";

interface NewsDashboardProps {
  articles: NewsArticle[];
  loading: boolean;
}

export function NewsDashboard({ articles, loading }: NewsDashboardProps) {
  // Memoize the calculation so it doesn't re-run on every render
  const metrics = useMemo(() => {
    if (loading || articles.length === 0) return null;
    return analyzeMarketSentiment(articles);
  }, [articles, loading]);

  if (loading || !metrics) {
    return (
        <Card className="w-full bg-slate-950 border-slate-800 animate-pulse h-32">
            <CardHeader><div className="h-4 bg-slate-800 rounded w-1/4"></div></CardHeader>
        </Card>
    );
  }

  // Helper to determine color intensity
  const getSentimentColor = (score: number) => {
      if (score > 5) return "text-green-400";
      if (score < -5) return "text-red-400";
      return "text-blue-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Metric 1: The Score (The "Vibe Check") */}
      <Card className="bg-slate-950 border-slate-800 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sentiment Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getSentimentColor(metrics.score)}`}>
            {metrics.score > 0 ? "+" : ""}{metrics.score.toFixed(1)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic score based on last 24h keywords
          </p>
        </CardContent>
      </Card>

      {/* Metric 2: The Verdict (Bull vs Bear) */}
      <Card className="bg-slate-950 border-slate-800 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            {metrics.mode === "BULLISH" ? <TrendingUp className="h-4 w-4" /> : 
             metrics.mode === "BEARISH" ? <TrendingDown className="h-4 w-4" /> : 
             <Minus className="h-4 w-4" />}
            Market Regime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {metrics.mode}
          </div>
          <div className="flex gap-2 mt-2">
             <Badge variant="outline" className={`${metrics.mode === "BULLISH" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                Buy Signal
             </Badge>
             <Badge variant="outline" className={`${metrics.mode === "BEARISH" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                Sell Signal
             </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Metric 3: Hot Topics (Simple extraction) */}
      <Card className="bg-slate-950 border-slate-800 text-white hidden md:block">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {/* We manually highlight high-impact words found in your existing data */}
            {articles.some(a => a.title.toLowerCase().includes("etf")) && <Badge variant="secondary" className="bg-blue-900/30 text-blue-300">ETF</Badge>}
            {articles.some(a => a.title.toLowerCase().includes("sec")) && <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-300">SEC</Badge>}
            {articles.some(a => a.title.toLowerCase().includes("rate")) && <Badge variant="secondary" className="bg-purple-900/30 text-purple-300">Rates</Badge>}
            {articles.some(a => a.title.toLowerCase().includes("hack")) && <Badge variant="destructive" className="bg-red-900/20">Hack</Badge>}
            <Badge variant="outline" className="text-xs text-slate-500 border-dashed">
               Scan Complete
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
