export interface LearningModule {
  id: string
  title: string
  description: string
  content: string // Markdown or HTML content
  readTime: string
}

export const learningModules: LearningModule[] = [
  {
    id: "fundamentals",
    title: "1. Blockchain & Fundamentals",
    description: "Understand the core technology: Blockchain, Mining vs Staking, and Wallets.",
    readTime: "15 min",
    content: `
# Blockchain & Cryptocurrency Fundamentals

## What is Blockchain?
A blockchain is a distributed database or ledger that is shared among the nodes of a computer network. As a database, a blockchain stores information electronically in digital format.

## Mining vs. Staking
- **Mining (Proof of Work)**: Miners solve complex mathematical puzzles to secure the network (e.g., Bitcoin).
- **Staking (Proof of Stake)**: Validators lock up coins to secure the network (e.g., Ethereum).

## Wallets & Security
- **Public Key**: Your address (like an email address). Safe to share.
- **Private Key**: Your password. NEVER share this.
    `
  },
  {
    id: "markets",
    title: "2. Types of Markets",
    description: "Spot, Margin, Futures, and Options. Detailed breakdown of market types.",
    readTime: "12 min",
    content: `
# Types of Cryptocurrency Markets

## Spot Markets
Buying and selling the actual asset. You own the coin. Safest for beginners.
**Focus of this platform:** We rely primarily on Spot trading to minimize risk.

## Margin Trading
Borrowing money to increase position size. High risk, high reward.

## Futures & Derivatives
Betting on future price movements without owning the asset.
    `
  },
  {
    id: "strategies",
    title: "3. Trading Strategies",
    description: "Day trading, Swing trading, DCA, Grid, and Momentum strategies explained.",
    readTime: "20 min",
    content: `
# Trading Strategies

## Core Strategies for CryptoTradeHub

1. **DCA (Dollar Cost Averaging)**: Buying a fixed amount regularly. Best for long-term growth.
2. **Grid Trading**: Profiting from volatility in sideways markets.
3. **Momentum Trading**: Following the trend in bull/bear markets.

## Other Approaches
- **Day Trading**: In and out same day. High stress.
- **Swing Trading**: Holding for days to weeks.
    `
  },
  {
    id: "technical-analysis",
    title: "4. Technical Analysis",
    description: "Mastering charts: Support/Resistance, Moving Averages, RSI, and MACD.",
    readTime: "25 min",
    content: `
# Technical Analysis Fundamentals

## Key Indicators
- **Moving Averages (SMA/EMA)**: Smooth out price action to identifying direction.
- **RSI (Relative Strength Index)**: Identifies overbought (>70) and oversold (<30) conditions.
- **MACD**: Momentum indicator showing relationship between two moving averages.

## Support & Resistance
Identify price levels where the market has historically reversed.
    `
  },
  {
    id: "risk-management",
    title: "5. Risk Management",
    description: "The most important section. Position sizing, Stop Losses, and leverage.",
    readTime: "15 min",
    content: `
# Risk Management - The Foundation

## The Golden Rule
**Never risk more than 2% of your capital on a single trade.**

## Tools
- **Stop Loss**: Automatic exit if price goes against you.
- **Take Profit**: Automatic exit to lock in gains.
- **Diversification**: Don't put all eggs in one basket.
    `
  },
  {
    id: "bot-strategies",
    title: "6. Bot Strategies Deep Dive",
    description: "Detailed logic behind the DCA, Grid, and Momentum bots.",
    readTime: "20 min",
    content: `
# Bot Strategies Deep Dive

## Grid Bot Logic
Places buy orders below current price and sell orders above. Profits from "noise".

## Momentum Bot Logic
Buys when Moving Averages cross (Golden Cross) and RSI confirms trend.

## DCA Bot Logic
Simple periodic buying to average entry price.
    `
  },
  {
    id: "real-execution",
    title: "7. Real Market Execution",
    description: "Fees, Slippage, Latency, and Order Types.",
    readTime: "10 min",
    content: `
# Real Market Execution

## Hidden Costs
- **Maker/Taker Fees**: Typically 0.1% per trade.
- **Slippage**: difference between expected price and fill price.
- **Spread**: difference between buy and sell prices.

## Order Types
- **Market Order**: Immediate fill, pays spread.
- **Limit Order**: Set price, precise fill, might not execute.
    `
  },
]
