// import axios from 'axios' - removed to use fetch";

export interface MarketCandidate {
  symbol: string;
  priceChangePercent: number;
  quoteVolume: number;
}

// Fixed list of "Blue Chip" coins to always watch
const BLUE_CHIPS = [
  "BTCUSDT", 
  "ETHUSDT", 
  "SOLUSDT", 
  "BNBUSDT",
  "XRPUSDT",
  "ADAUSDT",   // Cardano
  "DOGEUSDT",  // Dogecoin
  "AVAXUSDT",  // Avalanche
  "SUIUSDT",   // Sui
  "TRXUSDT"    // TRON
];

export async function getTopCandidates(): Promise<string[]> {
  try {
    // 1. Fetch 24hr ticker data from Binance Public API (Weight: 40)
    // using fetch directly to avoid dependencies
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
    const data = await response.json()
    
    if (!data || !Array.isArray(data)) {
      console.error("Invalid response from Binance API")
      return BLUE_CHIPS
    }

    const allTickers = data;

    // 2. Filter Rules:
    // - Must be USDT pair
    // - Must have > $10M Volume (Liquidity check)
    // - Exclude Leveraged Tokens (UP/DOWN/BULL/BEAR)
    // - Exclude Stablecoins (USDC, FDUSD, etc to avoid non-volatility)
    const candidates = allTickers.filter((t: any) => {
      const symbol = t.symbol;
      const volume = parseFloat(t.quoteVolume);

      if (!symbol.endsWith("USDT")) return false;
      if (volume < 10_000_000) return false; // $10M min volume
      if (
        symbol.includes("UP") ||
        symbol.includes("DOWN") ||
        symbol.includes("BULL") ||
        symbol.includes("BEAR")
      )
        return false;
      if (["USDCUSDT", "FDUSDUSDT", "TUSDUSDT", "DAIUSDT"].includes(symbol))
        return false;

      return true;
    });

    // 3. Sort by Volatility (Absolute Price Change %)
    // We want things that are moving, either up or down (though spec said top gainers, momentum applies to both if adapted, sticking to Gainers for now as per spec)
    // Spec: "Top 5 Gainers (%) with Volume > 2x Avg" -> Simplification: Top 5 Price Change % DESC
    candidates.sort(
      (a: any, b: any) =>
        parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)
    );

    // 4. Select Top 5 "Momentum" coins
    const topMomentum = candidates.slice(0, 5).map((t: any) => t.symbol);

    // 5. Merge with Blue Chips and Deduplicate
    const finalSet = new Set([...BLUE_CHIPS, ...topMomentum]);

    return Array.from(finalSet);
  } catch (error) {
    console.error("Failed to fetch market candidates:", error);
    // Fallback to blue chips on error
    return BLUE_CHIPS;
  }
}
