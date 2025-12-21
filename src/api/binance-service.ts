// src/api/binance-service.ts

export interface BinanceCredentials {
  apiKey: string
  secretKey: string
}

export interface BinanceBalance {
  asset: string
  free: number
  locked: number
}

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class BinanceService {
  private credentials: BinanceCredentials | null = null
  // private baseUrl = "https://api.binance.com" // In real app, this would be our Vercel API proxy

  constructor() {
    // Will be initialized via initializeFromBackend()
  }

  async initializeFromBackend(token: string) {
    try {
      const response = await fetch('/api/keys/get', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.binanceApiKey && data.binanceSecretKey) {
          this.setCredentials(data.binanceApiKey, data.binanceSecretKey);
        }
      }
    } catch (error) {
      console.error("Failed to fetch Binance credentials:", error);
    }
  }

  setCredentials(apiKey: string, secretKey: string) {
    this.credentials = { apiKey, secretKey }
    localStorage.setItem("binance_credentials", JSON.stringify(this.credentials))
  }

  getCredentials(): BinanceCredentials | null {
      return this.credentials
  }

  clearCredentials() {
      this.credentials = null
      localStorage.removeItem("binance_credentials")
  }

  async validateConnection(): Promise<boolean> {
      await delay(1000)
      if (!this.credentials?.apiKey) return false
      // In a real app, we would call /api/v3/account here
      // For demo, we accept any key starting with "test" or "real"
      return this.credentials.apiKey.length > 5
  }

  async getAccountBalance(): Promise<BinanceBalance[]> {
    await delay(500)
    if (!this.credentials) throw new Error("No credentials provided")

    // MOCK RESPONSE
    return [
        { asset: "USDT", free: 5000.00, locked: 0 },
        { asset: "BTC", free: 0.05, locked: 0 },
        { asset: "ETH", free: 1.2, locked: 0.1 },
    ]
  }

  async placeOrder(symbol: string, _side: "buy" | "sell", quantity: number, price?: number): Promise<{
      orderId: string,
      status: "FILLED" | "PENDING",
      avgPrice: number,
      executedQty: number
  }> {
       await delay(800)
       if (!this.credentials) throw new Error("No credentials provided")
       
       // log request
       console.log(`Placing order for ${symbol}`)

       // MOCK RESPONSE
       return {
           orderId: crypto.randomUUID(),
           status: "FILLED",
           avgPrice: price || 50000, // Fallback mock price
           executedQty: quantity
       }
  }
}

export const binanceService = new BinanceService()
