const COINGECKO_API = "https://api.coingecko.com/api/v3"

// Types for the richer market data
export interface CoinMarketData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_1h_in_currency: number
  price_change_percentage_24h_in_currency: number
  price_change_percentage_7d_in_currency: number
  circulating_supply: number
  sparkline_in_7d: {
    price: number[]
  }
}

export async function getSimplePrice(ids: string[], vsCurrencies: string[] = ["usd"]) {
  try {
    const params = new URLSearchParams({
      ids: ids.join(","),
      vs_currencies: vsCurrencies.join(","),
      include_24hr_change: "true"
    })
    
    const response = await fetch(`${COINGECKO_API}/simple/price?${params}`)
    
    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch prices:", error)
    return null
  }
}

export async function getTopCoins(count: number = 10): Promise<CoinMarketData[] | null> {
    try {
        const params = new URLSearchParams({
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: count.toString(),
            page: "1",
            sparkline: "true",
            price_change_percentage: "1h,24h,7d"
        });

        const response = await fetch(`${COINGECKO_API}/coins/markets?${params}`);
        if (!response.ok) throw new Error("Failed to fetch top coins");
        return await response.json();
    } catch (error) {
        console.error("CoinGecko Error:", error);
        return null;
    }
}
export interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export async function getCoinCandles(coinId: string, days: number = 365): Promise<CandleData[] | null> {
    try {
        const response = await fetch(`${COINGECKO_API}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`);
        if (!response.ok) {
            if (response.status === 429) throw new Error("Rate Limit Reached");
            throw new Error("Failed to fetch history");
        }
        
        // Response is array of [time, open, high, low, close]
        const data: number[][] = await response.json();
        
        return data.map(d => ({
            time: d[0],
            open: d[1],
            high: d[2],
            low: d[3],
            close: d[4]
        }));
    } catch (error) {
        console.error("CoinGecko History Error:", error);
        return null;
    }
}
