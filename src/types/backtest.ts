export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type StrategyType = "DCA" | "Grid" | "Momentum"

export interface BaseStrategyConfig {
  initialCapital: number
  id: string
}

export interface DCAConfig extends BaseStrategyConfig {
  type: "DCA"
  buyAmount: number
  frequencyDays: number
}

export interface GridConfig extends BaseStrategyConfig {
  type: "Grid"
  lowerBound: number
  upperBound: number
  grids: number
}

export interface MomentumConfig extends BaseStrategyConfig {
  type: "Momentum"
  shortPeriod: number // e.g., 9
  longPeriod: number // e.g., 21
  rsiPeriod?: number // Optional for MeanRev overlap
}

export interface GridConfig extends BaseStrategyConfig {
    type: "Grid" // Acts as Mean Reversal in V2
    rsiPeriod: number
    rsiLimit: number
    bollingerSd: number
    lowerBound?: number // Legacy
    upperBound?: number // Legacy
    grids?: number // Legacy
}

export type StrategyConfig = DCAConfig | GridConfig | MomentumConfig

export interface BacktestTrade {
  id: string
  entryTime: number
  exitTime?: number
  side: "buy" | "sell"
  price: number
  quantity: number
  pnl?: number
  pnlPercent?: number
  status: "open" | "closed"
}

export interface BacktestResult {
  totalReturn: number
  totalReturnPercent: number
  benchmarkReturn: number
  benchmarkReturnPercent: number
  maxDrawdown: number
  winRate: number
  trades: BacktestTrade[]
  equityCurve: { time: number; value: number }[]
}
