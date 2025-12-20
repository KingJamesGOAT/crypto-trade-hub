import { useEffect, useState } from "react"
import { getSimplePrice } from "@/api/coingecko"

export function Home() {
  const [btcPrice, setBtcPrice] = useState<number | null>(null)

  useEffect(() => {
    async function fetchPrice() {
      const data = await getSimplePrice(["bitcoin"])
      if (data && data.bitcoin) {
        setBtcPrice(data.bitcoin.usd)
      }
    }
    fetchPrice()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to CryptoTradeHub. Your complete trading ecosystem.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="text-sm font-medium">Total Balance</div>
          <div className="text-2xl font-bold">CHF 10,000.00</div>
          <div className="text-xs text-muted-foreground">+0% from last month</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="text-sm font-medium">Bitcoin Price</div>
          <div className="text-2xl font-bold">
            {btcPrice ? `$${btcPrice.toLocaleString()}` : "Loading..."}
          </div>
          <div className="text-xs text-muted-foreground">Live from CoinGecko</div>
        </div>
      </div>
    </div>
  )
}
