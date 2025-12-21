export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface LearningModule {
  id: string
  title: string
  description: string
  content: string // Markdown or HTML content
  readTime: string
  quiz?: QuizQuestion[]
}

export const learningModules: LearningModule[] = [
  {
    id: "fundamentals",
    title: "1. Blockchain & Fundamentals",
    description: "Understand the core technology: Blockchain, Mining vs Staking, and Wallets.",
    readTime: "15 min",
    content: `
# 1. Blockchain & Fundamentals

## What is Blockchain Technology?
Blockchain is a revolutionary distributed ledger technology that records transactions in a chain of blocks, where each block contains cryptographic hashes linking it to the previous block. This creates an immutable historical record that is maintained simultaneously across thousands of independent computers (nodes) worldwide, eliminating the need for a central authority like a bank.

Think of it as a digital ledger similar to a bank's transaction record, but instead of one organization controlling it, millions of computers verify and maintain identical copies. When a transaction occurs, it's broadcast to the entire network, verified by multiple participants, bundled with other transactions into a "block," and then permanently added to the chain in chronological order. Once added, that block cannot be altered without recalculating all subsequent blocks, which is computationally impossible with enough network participants.

### Key Characteristics of Blockchain
*   **Decentralization**: No single point of control. Instead of trusting one company (like a bank), the network is maintained by thousands of independent nodes. Each node can verify transactions independently. This eliminates single points of failure and prevents any individual from manipulating the system.
*   **Immutability**: Once a transaction is recorded on the blockchain, it becomes virtually impossible to change or delete. This is because each block contains a cryptographic hash (a unique fingerprint) of the previous block. If someone tries to alter a past transaction, the hash changes, breaking the chain and alerting the network to the tampering attempt.
*   **Transparency**: All transactions are visible to all participants (though identities can remain pseudonymous). Anyone can download the entire blockchain history and verify every transaction independently. This radical transparency makes fraud extremely difficult.
*   **Security**: Cryptography (mathematical algorithms) secures every transaction. Private keys control access to funds, and public keys serve as addresses. The mathematics makes it computationally infeasible to forge transactions or steal funds without the private key.
*   **Consensus**: Before transactions are added to the blockchain, the network must reach agreement through a consensus mechanism (like Proof of Work or Proof of Stake). This prevents double-spending and ensures only valid transactions are recorded.

## Consensus Mechanisms: How Networks Agree
A consensus mechanism is the process by which a decentralized network agrees on what transactions are valid and in what order they occurred. Without a central authority, the network needs a way to verify transactions and prevent fraud.

### Proof of Work (PoW)
Bitcoin and the original Ethereum use Proof of Work. Here's how it works:
1.  **The Process**:
    *   Miners collect pending transactions from the network (the "mempool")
    *   Miners compete to solve a complex mathematical puzzle (finding a specific number that, when hashed with the block data, produces a hash starting with a certain number of zeros)
    *   The first miner to solve the puzzle broadcasts their solution to the network
    *   Other miners verify the solution is correct in seconds (much faster than solving it)
    *   The winning block is added to the blockchain, and the miner receives newly created cryptocurrency + transaction fees as reward
    *   The process repeats for the next block
2.  **Why It's Secure**:
    *   To alter a past transaction, an attacker would need to recalculate the entire chain (all past blocks) faster than the network is creating new blocks
    *   This requires controlling 51%+ of the network's computing power
    *   The cost of equipment and electricity makes this impractical for established networks
    *   As more miners join, the difficulty increases automatically to maintain a consistent block time (10 minutes for Bitcoin)
3.  **Energy Consumption**: PoW requires massive computing power, consuming roughly as much electricity as a small country. This is often criticized but is a fundamental security feature.

### Proof of Stake (PoS)
Ethereum switched to Proof of Stake in 2022 (called "The Merge"). Instead of miners solving puzzles, validators lock up ("stake") cryptocurrency as collateral.
1.  **The Process**:
    *   Validators deposit cryptocurrency (32 ETH for Ethereum) into a smart contract, locking it up
    *   The network randomly selects validators to propose new blocks (weighted by their stake)
    *   Other validators attest to (verify) the proposed block
    *   If the block is valid, it's added to the chain
    *   Validators earn fees and new coins as rewards
    *   If a validator proposes invalid blocks, they lose part of their stake ("slashing") as punishment
2.  **Why It's Secure**:
    *   Attacking the network requires owning 51%+ of staked coins
    *   The cost of purchasing 51% of an established coin is astronomical
    *   If someone tries to attack and gets caught, their entire stake is forfeited (slashing)
    *   Validators have strong financial incentive to behave honestly
3.  **Environmental Benefits**: PoS uses ~99.95% less energy than PoW because validation doesn't require solving computationally difficult puzzles.

## Mining vs Staking Summary
| Feature | Mining (Proof of Work) | Staking (Proof of Stake) |
| :--- | :--- | :--- |
| **Who** | Anyone with powerful computers (GPUs or ASICs) | Anyone with coins to lock up as collateral |
| **Activity** | Solve complex mathematical puzzles | Validate transactions and propose blocks |
| **Reward** | Winner gets newly created coins + fees | Fees + new coins, typically 3-10% annual yield |
| **Cost** | Expensive hardware + high electricity costs | Opportunity cost (coins locked up) |
| **Risk** | None (except sunk hardware cost) | High (slashing if validator misbehaves) |
| **Examples** | Bitcoin, Litecoin, Dogecoin | Ethereum, Cardano, Solana |

## Wallets & Security
A cryptocurrency wallet is not like a traditional bank account. It's more like a physical safe deposit box where you hold the only key.

### Public Key (Your Wallet Address)
*   Think of it like your email address or bank account number.
*   It's completely public - you can share it with anyone.
*   Anyone can send you cryptocurrency by sending to this address.
*   Typically looks like: \`0x742d35Cc6634C0532925a3b844Bc3e7b1265876C\` (Ethereum) or \`1A1z7agoat4ztL8J8vFcKpM2zFGYZC2sZk\` (Bitcoin).

### Private Key
*   Like the password to your email, but much more powerful.
*   **Never share with anyone, ever.**
*   If someone has your private key, they can steal all your cryptocurrency.
*   Typically looks like: \`5KN7MzqK5wt2TP1fQCYyHBtDrXdJuXbUzm4A9rKAteYV3QHX\` (256-bit random number).
*   Should be stored offline, in a hardware wallet, or in a secure vault.

### Transaction Confirmation and Finality
When you send cryptocurrency, several things happen:
1.  **Transaction Broadcast (0-60s)**: You sign and broadcast a transaction. It enters the "mempool" as "Pending".
2.  **First Confirmation**: A miner/validator includes it in a block. It is now on-chain.
3.  **Finality**: More blocks are added on top.
    *   **Bitcoin**: 6 confirmations (~60 mins) is considered irreversible.
    *   **Ethereum**: ~12-15 minutes for full finality.
    `,
    quiz: [
      {
        question: "What is blockchain's main advantage?",
        options: [
          "Speed",
          "Decentralization and immutability",
          "Low cost",
          "Easy to use"
        ],
        correctAnswer: 1,
        explanation: "Blockchain's core value is removing central authorities (decentralization) and creating a permanent record that cannot be changed (immutability)."
      },
      {
        question: "Proof of Work vs Proof of Stake - which is more energy efficient?",
        options: [
          "Proof of Work",
          "Proof of Stake",
          "Same",
          "Depends on market"
        ],
        correctAnswer: 1,
        explanation: "Proof of Stake eliminates the need for energy-intensive mining rigs, reducing energy consumption by ~99.95%."
      }
    ]
  },
  {
    id: "markets",
    title: "2. Types of Markets",
    description: "Spot, Margin, Futures, and Options. Detailed breakdown of market types.",
    readTime: "12 min",
    content: `
# 2. Types of Markets

## Spot Markets: Buy and Hold
The spot market is where you buy actual cryptocurrency and take immediate possession. If you buy 1 BTC on Binance's spot market, you own that BTC and can withdraw it to your personal wallet.

**Advantages**:
*   Simplest form of crypto investing.
*   You actually own the asset.
*   No leverage, no forced liquidation.
*   Lowest fees (typically 0.1%).

**Disadvantages**:
*   Requires upfront capital.
*   Returns depend on price appreciation only.
*   Can't profit from price declines (cannot short).

**Best For**: Beginners, Long-term investors (HODLers), and our DCA/Grid strategies.

## Margin Trading: Borrow to Amplify
Margin trading lets you borrow money from the exchange to amplify your gains.
*   **Leverage**: Using 1,000 USDT to open a 3,000 USDT position (3x leverage).
*   **Long**: Profit if price goes UP.
*   **Short**: Profit if price goes DOWN (selling borrowed coins).
*   **Liquidation Risk**: If the market moves against you, the exchange force-closes your position to recover the loan. You can lose your entire initial capital.

**Example**:
*   You have 1,000 USDT. You use 3x leverage (3,000 USDT).
*   Price rises 10%: Your position gains 300 USDT. **Profit: +30%**.
*   Price drops 10%: Your position loses 300 USDT. **Loss: -30%**.

## Futures Markets
Contracts to buy or sell an asset at a future date.
*   **Perpetual Futures**: The most common type in crypto. They never expire.
*   **Funding Rates**: A fee paid between Longs and Shorts every 8 hours to keep the contract price close to the Spot price.
*   **High Leverage**: Often up to 100x (Extremely risky).

**Warning**: We do not recommend Futures for beginners due to high liquidation risk and complexity.

## Options
The right (but not obligation) to buy (Call) or sell (Put) an asset at a specific price.
*   **Call Option**: Bet on price going UP.
*   **Put Option**: Bet on price going DOWN.
*   Used primarily for hedging or advanced speculation.

## Summary Table
| Feature | Spot | Margin | Futures | Perpetuals |
| :--- | :--- | :--- | :--- | :--- |
| **You Own Coin** | Yes | Yes | No | No |
| **Leverage** | 1x only | Up to 5-20x | Up to 100x | Up to 100x |
| **Can Short** | No | Yes | Yes | Yes |
| **Liquidation** | No | Yes | Yes | Yes |
| **Fees** | Low (0.1%) | Low + Interest | Maker/Taker | Maker/Taker + Funding |
| **Best For** | Beginners | Active Traders | Speculators | Hedging |
    `,
    quiz: [
      {
        question: "Maximum leverage before liquidation risk is extreme?",
        options: [
          "2x",
          "5x",
          "10x",
          "100x"
        ],
        correctAnswer: 3,
        explanation: "100x leverage means a mere 1% price move against you will result in 100% loss of your principal (Liquidation)."
      },
      {
        question: "What happens to Grid Trading in a strong bull market?",
        options: [
          "Profits increase",
          "Fails, gets stuck with losses",
          "Performs same",
          "No impact"
        ],
        correctAnswer: 1,
        explanation: "Grid trading works best in sideways markets. In a strong trend, the price leaves your grid range, leaving you either with no position (sold too early) or holding losses."
      }
    ]
  },
  {
    id: "strategies",
    title: "3. Trading Strategies",
    description: "Time-based strategies: Scalping, Day Trading, Swing Trading, and Position Trading.",
    readTime: "20 min",
    content: `
# 3. Time-Based Trading Strategies

## Scalping: The Speed Trader
Scalping is trading with the shortest possible time horizon - seconds to minutes. Scalpers make dozens to hundreds of tiny trades per day.
*   **Goal**: Capture very small price changes.
*   **Pros**: Many opportunities, limited exposure time.
*   **Cons**: High fees impact, requires extreme speed/automation.
*   **Best For**: Bots or professional traders.

## Day Trading: Trade Within a Single Day
Day traders open and close positions within a single trading day. No positions are held overnight.
*   **Goal**: 1-3% profit per trade.
*   **Pros**: No overnight gap risk, frequent opportunities.
*   **Cons**: High stress, requires constant monitoring (full-time job).
*   **Statistic**: 92% of day traders lose money over the long term.

## Swing Trading: Days to Weeks
Swing traders hold positions for multiple days to weeks, trying to capture "swings" in price.
*   **Goal**: Capture a larger trend move (5-20%).
*   **Pros**: Less time commitment, less stress than day trading.
*   **Cons**: Overnight risk (news can happen while you sleep).
*   **Best For**: Part-time traders, working professionals.

## Position Trading / Long-Term Investing
Holding for months to years, betting on macro trends or adoption.
*   **Goal**: 50-500% returns over years.
*   **Pros**: Lowest stress, maximal tax efficiency, "Buy and Hold".
*   **Cons**: Capital tied up for long periods, need conviction to hold through crashes.

## Strategy Comparison
| Strategy | Timeframe | Effort | Risk | Avg Profit Target |
| :--- | :--- | :--- | :--- | :--- |
| **Scalping** | Minutes | Very High | High | 0.1% - 0.5% |
| **Day Trading** | Hours | High | High | 1% - 3% |
| **Swing Trading** | Days/Weeks | Medium | Medium | 5% - 20% |
| **Position** | Months/Years | Low | Low | 50% + |
    `,
    quiz: [
      {
        question: "Day traders typically aim for what profit per trade?",
        options: [
          "0.1%",
          "1-3%",
          "10-20%",
          "50%+"
        ],
        correctAnswer: 1,
        explanation: "Day trading relies on compounding small, consistent gains. Aiming for 1-3% limits risk while building up over many trades."
      }
    ]
  },
  {
    id: "technical-analysis",
    title: "4. Technical Analysis",
    description: "Mastering charts: Support/Resistance, Moving Averages, RSI, and MACD.",
    readTime: "25 min",
    content: `
# 4. Technical Analysis (TA)

## Support and Resistance
*   **Support**: A price level where buying pressure is strong enough to prevent further decline. "Buying the dip."
*   **Resistance**: A ceiling where selling pressure stops the trend. "Selling the rip."
*   **Strategy**: Buy near support (low risk), Sell near resistance.

## Moving Averages (MA)
Smoothes out price noise to show the trend.
*   **SMA (Simple)**: Average of last N candles.
*   **Golden Cross**: When the 50-day MA crosses **above** the 200-day MA. A strong Bullish signal.
*   **Death Cross**: When the 50-day MA crosses **below** the 200-day MA. A strong Bearish signal.

## RSI (Relative Strength Index)
Momentum indicator ranging from 0 to 100.
*   **> 70 (Overbought)**: Price rose too fast, likely to reverse down (Sell signal).
*   **< 30 (Oversold)**: Price fell too fast, likely to bounce up (Buy signal).

## MACD (Moving Average Convergence Divergence)
Tracks momentum changes.
*   **Bullish Crossover**: MACD line crosses ABOVE signal line.
*   **Bearish Crossover**: MACD line crosses BELOW signal line.

## Candlestick Patterns
*   **Doji**: Open and Close are almost equal. Indicates indecision.
*   **Hammer**: Long lower wick. Indicates buyers rejected lower prices (Bullish reversal).
*   **Engulfing**: A large green candle completely "eats" the previous small red candle (Bullish).

## The Golden Rule: Multiple Confirmations
Never trade based on one indicator alone.
*   **Example Strong Setup**: Price hits Support AND RSI is Oversold AND Hammer candle forms.
    `,
    quiz: [
      {
        question: "RSI > 70 means?",
        options: [
          "Bullish buying opportunity",
          "Overbought, likely to reverse down",
          "Strong momentum continues",
          "Price at new high"
        ],
        correctAnswer: 1,
        explanation: "An RSI over 70 suggests the asset has been bought too aggressively ('overbought') and is statistically likely to cool off or correct downwards."
      }
    ]
  },
  {
    id: "risk-management",
    title: "5. Risk Management",
    description: "The most important section. Position sizing, Stop Losses, and leverage.",
    readTime: "15 min",
    content: `
# 5. Risk Management: The Critical Foundation

## The 2% Rule
Never risk more than **2%** of your total capital on a single trade.
*   **Example**: Account = $10,000. Max risk = $200.
*   If your Stop Loss is 5% away, your position size is $4,000. ($4,000 * 5% = $200 loss).
*   This ensures you can survive a losing streak without going bankrupt.

## Stop Loss (SL)
An automatic order to exit a trade if the price goes against you.
*   **Hard SL**: Set immediately at entry.
*   **Trailing SL**: Moves up as price rises to lock in profits.
*   **Psychology**: You MUST accept the small loss to prevent a catastrophic loss.

## Risk/Reward Ratio (R:R)
Always aim for at least 1:2.
*   Risk $1 to make $2.
*   With a 1:2 ratio, you can be wrong 60% of the time and still be profitable.

## Leverage Kills
Leverage multiplies your losses.
*   **2x Leverage**: A 50% drop wipes you out.
*   **10x Leverage**: A 10% drop wipes you out.
*   **100x Leverage**: A 1% drop wipes you out.
*   **Recommendation**: Stick to Spot (1x) until you are consistently profitable.

## Drawdown
The peak-to-trough decline in your portfolio.
*   Recovering from a 50% loss requires a 100% gain!
*   Protecting your capital is more important than chasing gains.
    `,
    quiz: [
      {
        question: "What's the maximum recommended risk per trade?",
        options: [
          "1%",
          "2%",
          "5%",
          "10%"
        ],
        correctAnswer: 1,
        explanation: "Risking only 2% ensures you can survive a losing streak. If you risk 10%, a few bad trades can destroy your account."
      },
      {
        question: "If you risk 5% per trade and have 20 consecutive losses, what % of capital remains?",
        options: [
          "90%",
          "50%",
          "36%",
          "<1%"
        ],
        correctAnswer: 2,
        explanation: "Compounding losses are brutal. 0.95^20 = 0.358. You would have only ~36% left, not bankrupt, but severely damaged. (Note: The original text said <1% which was math error in source, corrected here to 36% logic or clarifying bankrupt risk)."
      }
    ]
  },
  {
    id: "bot-strategies",
    title: "6. Bot Strategies Deep Dive",
    description: "Detailed logic behind the DCA, Grid, and Momentum bots.",
    readTime: "20 min",
    content: `
# 6. Bot Strategies & Algorithms

## 1. Dollar-Cost Averaging (DCA)
The Conservative Bot.
*   **Strategy**: "Buy $50 of BTC every day/week, regardless of price."
*   **Logic**:
    *   Buys MORE coins when price is LOW.
    *   Buys FEWER coins when price is HIGH.
    *   Lowers your average entry price over time.
*   **Best For**: Long-term accumulation of blue-chip assets (BTC/ETH). Passive investors.
*   **Pros**: Removes emotion, simple, requires zero maintenance.
*   **Cons**: Boring, won't catch "bottoms" perfectly.

## 2. Grid Trading
The Moderate Bot (Range Trading).
*   **Strategy**: Places a ladder of Buy/Sell orders relative to price.
*   **Logic**:
    *   Price drops: Buy.
    *   Price rises: Sell the chunk you just bought.
    *   Profits from market volatility ("chop").
*   **Best For**: Sideways/Range-bound markets.
*   **Pros**: Profits when the market is doing nothing.
*   **Cons**: **Fails in strong trends**. If price pumps, you sell too early. If price dumps, you hold "bags".

## 3. Momentum Trading
The Aggressive Bot.
*   **Strategy**: "Buy high, sell higher." Follow the trend.
*   **Logic**:
    *   Enter when Moving Averages cross (Golden Cross) or RSI breakouts.
    *   Ride the trend with a Trailing Stop.
    *   Exit when momentum signals fade.
*   **Best For**: Strong Bull or Bear markets.
*   **Pros**: Can capture massive 50%+ moves in short time.
*   **Cons**: **Fails in sideways markets** (getting chopped up by false signals).

## Which Strategy When?
*   **Bull Market**: Momentum
*   **Bear Market**: DCA (Accumulate for next cycle) or Momentum Short
*   **Sideways Market**: Grid Trading
    `,
    quiz: [
      {
        question: "Which strategy is best in a ranging market?",
        options: [
          "DCA",
          "Grid Trading",
          "Momentum",
          "Scalping"
        ],
        correctAnswer: 1,
        explanation: "Grid trading is designed specifically to profit from the 'chop' or volatility within a specific price range, buying low and selling high automatically."
      }
    ]
  },
  {
    id: "real-execution",
    title: "7. Real Market Execution",
    description: "Fees, Slippage, Latency, and Order Types.",
    readTime: "10 min",
    content: `
# 7. Real Market Execution

## Fees: The Hidden Cost
Every trade costs money. Over-trading can kill a profitable strategy.
*   **Maker Fee**: ~0.1% (Adding liquidity with Limit orders).
*   **Taker Fee**: ~0.1% (Taking liquidity with Market orders).
*   **Round-Trip**: Buying and Selling costs ~0.2% total.
*   **Impact**: If your strategy makes 1% per trade, fees eat 20% of your profit!

## Slippage
The difference between the price you see and the price you actually get.
*   **Market Orders**: execute instantly, but can slip if liquidity is low.
*   **Volatility**: During a crash, specific prices might not exist. Your "Stop Loss at $40,000" might actually fill at $39,500.

## Order Types
*   **Market Order**: "Buy NOW at any price." Fast, high slippage risk.
*   **Limit Order**: "Buy ONLY at $42,000 or better." Zero slippage, but might not fill.
*   **Stop-Limit**: "If price hits $41,000, place a limit order at $40,900."

## Liquidity & Latency
*   **Liquidity**: How easily you can buy/sell without moving the price. BTC has high liquidity; small altcoins have low liquidity.
*   **Latency**: The delay between clicking "Buy" and the exchange receiving it. Pro HFT firms fight for milliseconds; retail traders fight for seconds.

## Quiz: Module 7
**Q1: What's Binance's typical round-trip fee cost?**
*   A) 0.05%
*   B) 0.1%
*   C) 0.2% (Correct - ~0.1% buy + ~0.1% sell)
*   D) 0.5%

---
# GLOSSARY

*   **ATH (All-Time High)**: The highest price ever recorded.
*   **ATL (All-Time Low)**: The lowest price ever recorded.
*   **Bull Market**: A market that is rising over time.
*   **Bear Market**: A market that is falling over time.
*   **HODL**: "Hold On for Dear Life." Keeping your crypto long-term despite volatility.
*   **FUD**: "Fear, Uncertainty, Doubt." Negative news/rumors used to drive price down.
*   **FOMO**: "Fear Of Missing Out." Buying because price is skyrocketing (usually a bad idea).
*   **Liquidation**: When the exchange force-closes your leveraged position because you ran out of margin.
*   **Slippage**: The difference between expected price and filled price.
*   **Spread**: The difference between the highest Buy price (Bid) and lowest Sell price (Ask).
*   **Whale**: An individual or entity holding a massive amount of crypto, capable of moving the market.
    `,
    quiz: [
      {
        question: "What's Binance's typical round-trip fee cost?",
        options: [
          "0.05%",
          "0.1%",
          "0.2%",
          "0.5%"
        ],
        correctAnswer: 2,
        explanation: "While individual trades are ~0.1% (maker/taker), a 'round trip' involves both entering and exiting the position, so the total cost is ~0.2%."
      }
    ]
  },
]
