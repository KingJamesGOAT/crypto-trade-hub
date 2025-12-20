const COINGECKO_API = "https://api.coingecko.com/api/v3"

export async function getSimplePrice(ids: string[], vsCurrencies: string[] = ["usd"]) {
  try {
    const params = new URLSearchParams({
      ids: ids.join(","),
      vs_currencies: vsCurrencies.join(","),
    })
    
    // In a real app with high volume, we would cache this or use a server to proxy
    // For local MVP/Simulator, calling directly is fine (rate limit 10-30/min free)
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
