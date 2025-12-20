export interface Trade {
  id: string
  timestamp: number
  type: 'simulator' | 'paper' | 'real'
  coin: string
  side: 'buy' | 'sell'
  entryPrice: number
  quantity: number
  totalValue: number
  fee: number
  status: 'open' | 'closed'
}

export interface Holding {
  coin: string
  quantity: number
  averageEntryPrice: number
  currentPrice: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
}

export interface Portfolio {
  simulator: {
    initialCapital: number
    currentBalance: number
    totalInvested: number
    totalWithdrawn: number
  }
  holdings: {
    [coin: string]: Holding
  }
  trades: Trade[]
}
