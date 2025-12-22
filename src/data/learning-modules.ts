export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface LearningModule {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  content: string; // We will use this to render paragraphs
  readTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  quiz: QuizQuestion[];
  mission?: {
    title: string;
    description: string;
    actionLink: string;
  };
}

export const COURSE_CATEGORIES = [
  { id: "foundation", name: "Phase 1: The Foundation (What & Why)" },
  { id: "ecosystem", name: "Phase 2: The Ecosystem (The Landscape)" },
  { id: "analysis", name: "Phase 3: Market Analysis (The Strategy)" },
  { id: "technical", name: "Phase 4: Technical Mastery (The Charts)" },
];

export const learningModules: LearningModule[] = [
  // --- PHASE 1: THE FOUNDATION ---
  {
    id: "money-bitcoin",
    categoryId: "foundation",
    title: "1. Money & The Birth of Bitcoin",
    description: "Fiat currency, the 2008 Crisis, and why Bitcoin is 'Digital Gold'.",
    readTime: "6 min",
    difficulty: "Beginner",
    content: `Money has evolved from barter (cows) to commodity money (gold) to fiat currency (government paper). \n\n**The Problem with Fiat:**\nFiat money, like the USD or EUR, is backed by nothing but trust in the government. Central banks can print infinite amounts, causing inflation. In 2008, the Global Financial Crisis exposed the fragility of this system, as banks gambled with people's money and were bailed out by taxpayers.\n\n**Enter Bitcoin (2009):**\nSatoshi Nakamoto created Bitcoin as an alternative. It is "Hard Money" because:\n1. **Fixed Supply:** There will never be more than 21 million BTC.\n2. **Decentralized:** No government controls it.\n3. **Digital Gold:** It stores value over time, protecting purchasing power from inflation.`,
    quiz: [
      {
        question: "Why is Bitcoin considered 'Hard Money'?",
        options: ["It is backed by gold bars", "It has a fixed supply cap (21M) that cannot be inflated", "It is printed by the government", "It is made of metal"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "blockchain-explained",
    categoryId: "foundation",
    title: "2. Blockchain Under the Hood",
    description: "Distributed ledgers, hashing, and blocks explained simply.",
    readTime: "7 min",
    difficulty: "Intermediate",
    content: `Forget the complex math for a second. A blockchain is simply a **Distributed Ledger**.\n\n**The Analogy:**\nImagine a Google Sheet that everyone in the world can view, but no one can edit or delete past rows—only add new ones at the bottom. And once a row is added, it is locked forever.\n\n**How it works:**\n1. **Transactions** are grouped together into a "Block" (like a page of a record book).\n2. **Miners** compete to seal this block using a cryptographic "Hash" (a digital fingerprint).\n3. **Chaining:** The new block contains the fingerprint of the previous block. If you try to change an old record, the fingerprint changes, breaking the chain. This makes the history **Immutable** (unchangeable).`,
    quiz: [
      {
        question: "What makes the blockchain history 'Immutable'?",
        options: ["The government watches it", "Blocks are linked by Hashes; changing one breaks the chain", "It is stored in a vault", "Miners are paid to guard it"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "ethereum-revolution",
    categoryId: "foundation",
    title: "3. The Ethereum Revolution",
    description: "From Calculators to Computers: Smart Contracts and dApps.",
    readTime: "6 min",
    difficulty: "Intermediate",
    content: `If Bitcoin is a pocket calculator (does one thing perfectly), Ethereum is a smartphone (runs applications).\n\n**Smart Contracts:**\nVitalik Buterin realized blockchain could do more than just send money. He created **Smart Contracts**: self-executing code that lives on the blockchain.\n\n*Example:* "If User A sends 1 ETH, automatically send them Token B."\n\nThis eliminated the need for middlemen in finance, art, and gaming, giving birth to **dApps** (Decentralized Applications).`,
    quiz: [
      {
        question: "What is the primary innovation of Ethereum compared to Bitcoin?",
        options: ["It is faster", "It allowed for Smart Contracts (Programmable Money)", "It has a lower supply", "It is more anonymous"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "wallets-security",
    categoryId: "foundation",
    title: "4. Wallets, Custody & Security",
    description: "Hot vs. Cold wallets and the 'Not Your Keys' rule.",
    readTime: "8 min",
    difficulty: "Beginner",
    content: `In crypto, there is no "Forgot Password" button. You are your own bank.\n\n**The Golden Rule:** Not Your Keys, Not Your Coins. If you leave money on an exchange (like Binance), you don't own it—they do (IOU).\n\n**Types of Wallets:**\n1. **Hot (Software) Wallet:** Connected to the internet (e.g., MetaMask). Good for trading, higher risk.\n2. **Cold (Hardware) Wallet:** Offline device (e.g., Ledger). Impossible to hack remotely. Best for long-term storage.\n\n**Seed Phrase:** Your 12-24 words are your master key. Never share them. Never type them into a website.`,
    quiz: [
      {
        question: "What is the safest way to store large amounts of crypto?",
        options: ["On an exchange (Binance/Coinbase)", "In a Hot Wallet (MetaMask)", "In a Cold/Hardware Wallet (Ledger)", "In a text file on your desktop"],
        correctAnswer: 2
      }
    ]
  },

  // --- PHASE 2: THE ECOSYSTEM ---
  {
    id: "stablecoins",
    categoryId: "ecosystem",
    title: "5. Stablecoins & The Bridge",
    description: "USDT, USDC, DAI: How crypto connects to the dollar.",
    readTime: "5 min",
    difficulty: "Beginner",
    content: `Crypto is volatile. Sometimes you need safety without cashing out to a bank. Enter **Stablecoins**.\n\nThese are tokens pegged 1:1 to a fiat currency (usually USD).\n\n**Types:**\n- **Fiat-Collateralized (USDT, USDC):** A company holds $1 in a bank for every 1 token issuing. Trust depends on the company auditing.\n- **Decentralized (DAI):** Backed by crypto collateral (ETH) governed by code.\n\nStablecoins are the bridge that allows traders to exit volatility instantly and are the fuel for DeFi.`,
    quiz: [
      {
        question: "What is the primary purpose of a Stablecoin?",
        options: ["To double in value", "To maintain a stable value (usually $1)", "To pay for gas fees", "To remain anonymous"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "defi-explained",
    categoryId: "ecosystem",
    title: "6. DeFi (Decentralized Finance)",
    description: "Uniswap, Aave, and banking without bankers.",
    readTime: "7 min",
    difficulty: "Intermediate",
    content: `DeFi re-creates traditional financial services (trading, lending, borrowing) using Smart Contracts instead of banks.\n\n**DEX (Decentralized Exchange):** \nUniswap allows you to trade without depositing money to a company. It uses **Liquidity Pools**—users pool their money together to enable trading for others, earning a fee in return.\n\n**Lending Protocols:**\nAave allows you to lend your crypto to earn interest, or deposit collateral to borrow cash, all instantly and permissionlessly.`,
    quiz: [
      {
        question: "What replaces the 'Market Maker' or 'Bank' in a Decentralized Exchange (DEX)?",
        options: ["The government", "Liquidity Pools (User funds)", "A CEO", "Miners"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "layer2-scaling",
    categoryId: "ecosystem",
    title: "7. Layer 2s & Scaling",
    description: "Why ETH is slow and how Arbitrum/Optimism fix it.",
    readTime: "6 min",
    difficulty: "Advanced",
    content: `Ethereum became too popular. Fees skyrocketed ($50+ per transaction). \n\n**The Solution: Layer 2 (L2):**\nImagine Ethereum (L1) as a congested highway. L2s (Arbitrum, Optimism, Base) are high-speed express lanes built on top of it.\n\n**Rollups:**\nL2s bundle thousands of transactions off-chain, compress them into a single piece of data, and post proof to Ethereum. This inherits Ethereum's security but with 100x lower fees and instant speed.`,
    quiz: [
      {
        question: "How do Layer 2 rollups reduce fees?",
        options: ["They use a fundamentally different blockchain", "They bundle thousands of transactions into one batch", "They make miners work for free", "They remove security"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "tokenomics-101",
    categoryId: "ecosystem",
    title: "8. Tokenomics 101",
    description: "Supply caps, inflation, and spotting bad projects.",
    readTime: "8 min",
    difficulty: "Intermediate",
    content: `Before buying a coin, you must study its **Token Economics**.\n\n**Key Metrics:**\n1. **Market Cap vs. FDV:** \n   - Market Cap = Price × Circulating Supply.\n   - FDV (Fully Diluted Value) = Price × Total Supply (including locked coins).\n   *Trap:* If FDV is 10x higher than Market Cap, massive inflation is coming.\n\n2. **Allocations:** Did the team and VCs get 50% of the supply? Beware of them dumping on you.\n\n3. **Utility:** Does the token actually *do* anything, or is it just for voting?`,
    quiz: [
      {
        question: "If a project has a low Market Cap but a massive FDV, what is the risk?",
        options: ["The project is undervalued", "Massive future inflation (unlocks) will lower the price", "The project is a scam", "There is no liquidity"],
        correctAnswer: 1
      }
    ]
  },

  // --- PHASE 3: MARKET ANALYSIS ---
  {
    id: "fundamental-analysis",
    categoryId: "analysis",
    title: "9. Fundamental Analysis",
    description: "Evaluating team, roadmap, and on-chain activity.",
    readTime: "6 min",
    difficulty: "Intermediate",
    content: `Fundamental Analysis (FA) is researching the *business* behind the token.\n\n**The Checklist:**\n1. **Team:** Are they anonymous? Have they built successful products before?\n2. **Product-Market Fit:** Does this solve a real problem (e.g., decentralized storage) or is it a solution looking for a problem?\n3. **On-Chain Data:** Don't trust PR. Look at TVL (Total Value Locked) and Daily Active Users. Is anyone actually using the protocol?\n4. **Revenue:** Does the protocol generate fees? Who gets those fees?`,
    quiz: [
      {
        question: "What is the most reliable metric for a DeFi protocol's success?",
        options: ["Twitter followers", "TVL (Total Value Locked) and User Revenue", "The price of the token", "Celebrity endorsements"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "market-psychology",
    categoryId: "analysis",
    title: "10. Market Cycles & Psychology",
    description: "The 4 phases of a market cycle.",
    readTime: "5 min",
    difficulty: "Beginner",
    content: `Assets move in cycles driven by human emotion. Each cycle has 4 phases:\n\n1. **Accumulation:** Price moves sideways at the bottom. Smart money buys quietly.\n2. **Mark-Up:** The breakout. Trend explodes upward. Public enters. FOMO peaks at the top.\n3. **Distribution:** Smart money sells to retail investors. Price stalls at the highs.\n4. **Mark-Down:** Price collapses. Panic selling. The cycle resets.\n\n*Lesson:* You usually want to be buying when you feel bored (Accumulation) or scared (Mark-Down), not excited.`,
    quiz: [
      {
        question: "In which phase is it most profitable (but psychologically hardest) to buy?",
        options: ["Mark-Up", "Distribution", "Accumulation / Mark-Down", "All-Time High"],
        correctAnswer: 2
      }
    ]
  },
  {
    id: "order-books",
    categoryId: "analysis",
    title: "11. Order Books & Liquidity",
    description: "Bids, Asks, Spreads, and Slippage explained.",
    readTime: "6 min",
    difficulty: "Advanced",
    content: `When you click "Buy", you aren't buying from the exchange. You are buying from another user selling.\n\n**The Order Book:**\n- **Bids (Green):** Buyers waiting at lower prices.\n- **Asks (Red):** Sellers waiting at higher prices.\n\n**Liquidity:** The "depth" of the order book. If you try to buy $1M of Bitcoin but there are only $100k of sell orders nearby, you will push the price up. This price difference is called **Slippage**.\n\n*Tip:* Always use Limit Orders to avoid slippage.`,
    quiz: [
      {
        question: "What happens if you place a massive Market Buy order on a coin with low liquidity?",
        options: ["You get a discount", "You cause high Slippage (pay a much higher price)", "The trade is rejected", "Nothing happens"],
        correctAnswer: 1
      }
    ]
  },

  // --- PHASE 4: TECHNICAL MASTERY ---
  {
    id: "candlesticks-advanced",
    categoryId: "technical",
    title: "12. Japanese Candlesticks",
    description: "Reading price action: Hammers, Engulfing, and Dojis.",
    readTime: "7 min",
    difficulty: "Beginner",
    content: `A candlestick gives you 4 data points: Open, High, Low, Close (OHLC).\n\n**Bullish Patterns:**\n- **Hammer:** Small body, long bottom wick. Shows sellers exhausted, buyers stepped in.\n- **Bullish Engulfing:** A large green candle completely "eats" the previous red one.\n\n**Bearish Patterns:**\n- **Shooting Star:** Long top wick. Buyers rejected.\n- **Doji:** Tiny body (Open = Close). Represents warning/indecision.`,
    quiz: [
      {
        question: "What does a 'Hammer' candle (long bottom wick) usually signal?",
        options: ["Universal downtrend", "Potential Reversal to the Upside (Bullish)", "Indecision", "Nothing"],
        correctAnswer: 1
      }
    ],
    mission: {
      title: "Pattern Hunter",
      description: "Find a Hammer or Engulfing candle on the Bitcoin daily chart in the Simulator.",
      actionLink: "/simulator"
    }
  },
  {
    id: "support-resistance",
    categoryId: "technical",
    title: "13. Support, Resistance & Trendlines",
    description: "Identifying floors and ceilings in price.",
    readTime: "6 min",
    difficulty: "Beginner",
    content: `Prices have memory. \n\n**Support (Floor):** A price level where buyers historically step in. The price bounces off this level.\n**Resistance (Ceiling):** A price level where sellers historically step in. The price gets rejected here.\n\n**The Flip:** When Resistance is broken, it often becomes new Support.\n\n**Trendlines:** Connecting the lows in an uptrend (or highs in a downtrend). A break of the trendline signals the trend might be over.`,
    quiz: [
      {
        question: "What usually happens when a Resistance level is successfully broken?",
        options: ["It disappears", "It becomes new Support", "The price crashes", "Trading stops"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "indicators-mastery",
    categoryId: "technical",
    title: "14. Key Indicators (RSI, MACD, MA)",
    description: "Using math to confirm your bias.",
    readTime: "8 min",
    difficulty: "Intermediate",
    content: `Indicators lag price, but help confirm trends.\n\n**1. RSI (Relative Strength Index):**\n- Over 70 = Overbought (expensive).\n- Under 30 = Oversold (cheap).\n\n**2. Moving Averages (MA):**\n- **200 SMA:** The definitive long-term trend. Price above 200 SMA = Bull Market.\n- **Golden Cross:** When short-term MA (50) crosses above long-term MA (200). Very Bullish.\n\n**3. MACD:** Measures momentum. A crossover of the signal lines indicates momentum shift.`,
    quiz: [
      {
        question: "What is a 'Golden Cross'?",
        options: ["When price hits an all time high", "When the 50 MA crosses ABOVE the 200 MA", "When RSI hits 100", "When Bitcoin halves"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "risk-management",
    categoryId: "technical",
    title: "15. Risk Management (The Holy Grail)",
    description: "Position sizing and why 90% of traders fail.",
    readTime: "6 min",
    difficulty: "Advanced",
    content: `This is the most important lesson. You can have a 90% win rate and still go broke without this.\n\n**The 1% Rule:** Never risk more than 1% of your total account on a single trade. If you have $10,000, your Stop Loss should lose you max $100.\n\n**Stop Loss:** A predefined order to sell if you are wrong. It protects you from ruin.\n\n**Risk/Reward Ratio (R:R):** Always aim for at least 1:2. Risk $1 to make $2. This way, you can be wrong 50% of the time and still make money.`,
    quiz: [
      {
        question: "If you have a $10,000 account and follow the 1% rule, what is the maximum amount you can lose on one trade?",
        options: ["$1", "$100", "$1,000", "$500"],
        correctAnswer: 1
      }
    ],
    mission: {
      title: "Calculate Risk",
      description: "Open a trade in the Simulator with a Stop Loss set to exactly 1% of your demo balance.",
      actionLink: "/simulator"
    }
  }
];
