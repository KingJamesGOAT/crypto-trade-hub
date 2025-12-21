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



export class BinanceService {
  private credentials: BinanceCredentials | null = null
  // private baseUrl = "https://api.binance.com" // In real app, this would be our Vercel API proxy

  constructor() {
    // Will be initialized via initializeFromBackend()
  }

  async initializeFromBackend(token: string) {
    // 1. Try Env Vars First (Vite)
    if (import.meta.env.VITE_BINANCE_API_KEY && import.meta.env.VITE_BINANCE_SECRET_KEY) {
        console.log("Initializing Binance Service from Environment Variables")
        this.setCredentials(import.meta.env.VITE_BINANCE_API_KEY, import.meta.env.VITE_BINANCE_SECRET_KEY)
        return
    }

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
  }

  getCredentials(): BinanceCredentials | null {
      return this.credentials
  }

  clearCredentials() {
      this.credentials = null
  }

  async validateConnection(): Promise<boolean> {
      if (!this.credentials?.apiKey) return false
      try {
          // Simple ping to account (requires signature)
          await this.getAccountBalance()
          return true
      } catch (e) {
          console.error("Connection validation failed:", e)
          return false
      }
  }

  // --- CRYPTO SIGNING HELPER ---
  private async signParams(queryString: string, secret: string): Promise<string> {
      const enc = new TextEncoder()
      const key = await window.crypto.subtle.importKey(
          "raw",
          enc.encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
      )
      const signature = await window.crypto.subtle.sign(
          "HMAC",
          key,
          enc.encode(queryString)
      )
      return Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("")
  }

  async getAccountBalance(): Promise<BinanceBalance[]> {
    if (!this.credentials) {
        // Fallback or error? For now, return empty if not configured to avoid breaking UI on startup
        console.warn("BinanceService: No credentials set yet.")
        return []
    }

    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`
    const signature = await this.signParams(queryString, this.credentials.secretKey)
    const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`

    try {
        const res = await fetch(url, {
            headers: {
                'X-MBX-APIKEY': this.credentials.apiKey
            }
        })

        if (!res.ok) {
            const errText = await res.text()
            throw new Error(`Binance API Error: ${res.status} ${errText}`)
        }

        const data = await res.json()
        // Map Binance response to our interface
        // data.balances = [{asset: "BTC", free: "0.001", locked: "0.00"}, ...]
        return data.balances.map((b: any) => ({
            asset: b.asset,
            free: parseFloat(b.free),
            locked: parseFloat(b.locked)
        })).filter((b: any) => b.free > 0 || b.locked > 0) // Filter empty wallets

    } catch (e) {
        console.error("getAccountBalance failed", e)
        throw e
    }
  }

  async placeOrder(symbol: string, side: "buy" | "sell", quantity: number, price?: number): Promise<{
      orderId: string,
      status: "FILLED" | "PENDING",
      avgPrice: number,
      executedQty: number
  }> {
       if (!this.credentials) throw new Error("No credentials provided")
       
       const timestamp = Date.now()
       const sideUpper = side.toUpperCase()
       // MARKET order if no price, LIMIT if price
       const type = price ? "LIMIT" : "MARKET"
       
       let params = `symbol=${symbol}&side=${sideUpper}&type=${type}&quantity=${quantity}&timestamp=${timestamp}`
       if (price) {
           params += `&price=${price}&timeInForce=GTC`
       }

       const signature = await this.signParams(params, this.credentials.secretKey)
       const url = `https://api.binance.com/api/v3/order?${params}&signature=${signature}`

       console.log(`Placing REAL ${sideUpper} order for ${symbol}...`)

       try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    'X-MBX-APIKEY': this.credentials.apiKey
                }
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.msg || "Unknown Binance Order Error")
            }

            // Map response
            let avgPrice = 0
            if (data.cummulativeQuoteQty && data.executedQty) {
                avgPrice = parseFloat(data.cummulativeQuoteQty) / parseFloat(data.executedQty)
            } else if (data.price) {
                avgPrice = parseFloat(data.price)
            }

            return {
                orderId: data.orderId.toString(),
                status: data.status, // "FILLED", "NEW", etc.
                avgPrice,
                executedQty: parseFloat(data.executedQty)
            }

       } catch (e) {
           console.error("placeOrder failed", e)
           throw e
       }
  }
}

export const binanceService = new BinanceService()
