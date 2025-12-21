import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCryptoNews, type NewsArticle } from '@/api/news-service';

interface NewsContextType {
  articles: NewsArticle[];
  loading: boolean;
  refreshNews: () => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshNews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCryptoNews();
      setArticles(data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch immediately on mount (load once)
  useEffect(() => {
    refreshNews();
  }, [refreshNews]);

  return (
    <NewsContext.Provider value={{ articles, loading, refreshNews }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
}
