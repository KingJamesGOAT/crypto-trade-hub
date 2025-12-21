export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  body: string;
  tags: string; // e.g. "BTC|ETH|Regulation"
  published_on: number;
  source: string;
  imageurl: string;
}

const SCOUTED_COINS = "BTC,ETH,SOL,BNB,XRP,ADA,DOGE,AVAX,SUI,TRX,LINK";

export async function fetchCryptoNews(): Promise<NewsArticle[]> {
  try {
    // CryptoCompare Free News Endpoint
    // We filter by our specific coins to save bandwidth and relevance
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${SCOUTED_COINS}`
    );
    const data = await response.json();

    if (data.Message !== "News list successfully returned") {
      throw new Error("Failed to fetch news");
    }

    return data.Data.map((item: any) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      body: item.body,
      tags: item.tags,
      published_on: item.published_on,
      source: item.source_info.name,
      imageurl: item.imageurl,
    }));
  } catch (error) {
    console.error("News Fetch Error:", error);
    return [];
  }
}
