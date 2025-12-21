import type { NewsArticle } from "@/api/news-service";

export type SentimentMode = "BULLISH" | "BEARISH" | "NEUTRAL";

// Keywords that trigger bot reactions
const BULLISH_KEYWORDS = ["adoption", "etf", "approval", "launch", "partnership", "upgrade", "record", "bull", "rally", "surge"];
const BEARISH_KEYWORDS = ["ban", "hack", "lawsuit", "sec", "crash", "dump", "delist", "fraud", "bear", "plummet", "risk"];

export function analyzeMarketSentiment(articles: NewsArticle[]): { mode: SentimentMode, score: number } {
  // Only look at news from the last 24 hours for "Live" trading relevance
  const oneDayAgo = Date.now() / 1000 - 86400;
  const recentNews = articles.filter(a => a.published_on > oneDayAgo);

  let score = 0;

  recentNews.forEach(article => {
    const text = (article.title + " " + article.body).toLowerCase();
    
    // Weight "Title" matches higher (x2) than body matches
    BULLISH_KEYWORDS.forEach(word => {
        if (article.title.toLowerCase().includes(word)) score += 2;
        else if (text.includes(word)) score += 1;
    });

    BEARISH_KEYWORDS.forEach(word => {
        if (article.title.toLowerCase().includes(word)) score -= 2;
        else if (text.includes(word)) score -= 1;
    });
  });

  // Determine Mode based on aggregate score
  if (score >= 5) return { mode: "BULLISH", score };
  if (score <= -5) return { mode: "BEARISH", score };
  return { mode: "NEUTRAL", score };
}
