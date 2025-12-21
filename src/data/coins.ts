export const AVAILABLE_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", category: "moderate" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", category: "moderate" },
  { id: "solana", symbol: "SOL", name: "Solana", category: "risky" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", category: "moderate" },
  { id: "ripple", symbol: "XRP", name: "XRP", category: "moderate" },
  { id: "cardano", symbol: "ADA", name: "Cardano", category: "risky" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", category: "extreme" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", category: "risky" },
  { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu", category: "extreme" },
  { id: "pepe", symbol: "PEPE", name: "Pepe", category: "extreme" },
] as const;
