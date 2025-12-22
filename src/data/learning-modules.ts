
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface LearningModule {
  id: string;
  categoryId: "basics" | "history" | "crypto-tech" | "platform-mastery" | "advanced-trading";
  title: string;
  description: string;
  content: string; // Supports basic Markdown-like spacing
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTimeMinutes: number;
  xpReward: number;
  quiz: QuizQuestion[];
  mission?: {
    task: string;
    actionLink: string; // e.g., "/simulator"
  };
}

export const COURSE_CATEGORIES = [
  { id: "basics", name: "1. The Investor's Mindset" },
  { id: "history", name: "2. History of Money & Crypto" },
  { id: "crypto-tech", name: "3. Blockchain Fundamentals" },
  { id: "platform-mastery", name: "4. Mastering CryptoTradeHub" },
  { id: "advanced-trading", name: "5. Technical Analysis" },
];

export const learningModules: LearningModule[] = [
  // --- CATEGORY 1: BASICS ---
  {
    id: "investing-101",
    categoryId: "basics",
    title: "Introduction to Investment",
    description: "Why do we invest? Learn the difference between saving, gambling, and calculating risk.",
    difficulty: "Beginner",
    readTimeMinutes: 5,
    xpReward: 100,
    content: `Investing is not about 'getting rich quick'. It is the act of allocating resources, usually money, with the expectation of generating an income or profit. \n\nIn crypto, this is volatile. The Golden Rule is: **Risk vs. Reward**. Higher potential returns always come with higher risk of loss. \n\nKey Concepts:\n1. **Diversification:** Don't put all eggs in one basket.\n2. **Time Horizon:** Are you a trader (minutes/hours) or an investor (years)?\n3. **Compound Interest:** The eighth wonder of the world.`,
    quiz: [
      {
        question: "What is the primary relationship between Risk and Reward?",
        options: ["Higher Risk = Lower Reward", "Higher Risk = Higher Potential Reward", "There is no relationship", "Risk is irrelevant in crypto"],
        correctAnswer: 1
      }
    ]
  },

  // --- CATEGORY 2: HISTORY ---
  {
    id: "history-crypto",
    categoryId: "history",
    title: "History of Cryptography",
    description: "From the Cypherpunks to the Pizza Day. Where did this technology come from?",
    difficulty: "Beginner",
    readTimeMinutes: 7,
    xpReward: 150,
    content: `Cryptocurrency didn't start with Bitcoin. It started in the 1980s with the 'Cypherpunks', a group of activists advocating for privacy through cryptography. \n\n**Pre-Bitcoin Attempts:**\n- **DigiCash (1989):** David Chaum created an anonymous electronic money, but it was centralized.\n- **Bit Gold (1998):** Nick Szabo designed a mechanism for a decentralized digital currency.\n\nThen, in 2008, the mysterious Satoshi Nakamoto published the Bitcoin Whitepaper, solving the 'Double Spend' problem without a central bank.`,
    quiz: [
      {
        question: "Who is the creator of Bitcoin?",
        options: ["Vitalik Buterin", "The NSA", "Satoshi Nakamoto", "Elon Musk"],
        correctAnswer: 2
      }
    ]
  },
  {
    id: "bitcoin-fundamentals",
    categoryId: "history",
    title: "What is Bitcoin (BTC)?",
    description: "Understanding the digital gold standard. Supply caps, halvings, and decentralization.",
    difficulty: "Beginner",
    readTimeMinutes: 6,
    xpReward: 150,
    content: `Bitcoin is a decentralized peer-to-peer electronic cash system. \n\n**Why is it valuable?**\n1. **Scarcity:** There will only ever be 21 Million BTC.\n2. **The Halving:** Every 4 years, the inflation rate is cut in half, making new Bitcoin harder to find.\n3. **Decentralization:** No government controls it. It runs on thousands of computers (nodes) worldwide.`,
    quiz: [
      {
        question: "What is the maximum supply of Bitcoin?",
        options: ["Unlimited", "21 Million", "100 Million", "Depends on the miners"],
        correctAnswer: 1
      }
    ]
  },

  // --- CATEGORY 3: BLOCKCHAIN TECH ---
  {
    id: "blockchain-101",
    categoryId: "crypto-tech",
    title: "Blockchain Fundamentals",
    description: "How does the technology actually work? Blocks, chains, and consensus.",
    difficulty: "Intermediate",
    readTimeMinutes: 8,
    xpReward: 200,
    content: `Imagine a Google Sheet that everyone can read, but no single person can delete or edit past rows. That is a blockchain.\n\n**How it works:**\n1. **Transaction:** You send money.\n2. **Block:** Transactions are bundled into a 'Block'.\n3. **Hash:** The block is sealed with a digital fingerprint (Hash).\n4. **Chain:** The next block contains the fingerprint of the previous one. If you hack one block, the chain breaks.\n\nThis creates an immutable ledger of truth.`,
    quiz: [
      {
        question: "What makes a blockchain secure?",
        options: ["A password", "The Hash linking blocks together", "The government", "Antivirus software"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "ecosystem-modern",
    categoryId: "crypto-tech",
    title: "The Modern Ecosystem",
    description: "Ethereum, Smart Contracts, DeFi, and Layer 2s.",
    difficulty: "Intermediate",
    readTimeMinutes: 8,
    xpReward: 200,
    content: `Bitcoin is a calculator (Money). Ethereum is a Computer (Apps). \n\n**Smart Contracts:** Self-executing code. 'If X happens, send money to Y'. This enabled:\n- **DeFi (Decentralized Finance):** Banks without bankers (Uniswap, Aave).\n- **NFTs:** Digital ownership.\n- **Layer 2s:** Faster networks (Arbitrum, Base) that sit on top of Ethereum to make it cheap.`,
    quiz: [
      {
        question: "What distinguishes Ethereum from Bitcoin?",
        options: ["It is faster", "It supports Smart Contracts (Programmable Money)", "It is cheaper", "It has no limit"],
        correctAnswer: 1
      }
    ]
  },

  // --- CATEGORY 4: PLATFORM MASTERY (UI GUIDE) ---
  {
    id: "charts-types",
    categoryId: "platform-mastery",
    title: "Understanding Charts",
    description: "Line charts vs. Candlesticks. How to read the language of price.",
    difficulty: "Beginner",
    readTimeMinutes: 5,
    xpReward: 150,
    content: `On CryptoTradeHub, we use **Candlestick Charts**. \n\n**Anatomy of a Candle:**\n- **Body (Green/Red):** The distance between Open and Close price.\n- **Wick (Thin line):** The highest and lowest price reached during that time.\n\nIf the candle is GREEN, the price went UP. If RED, it went DOWN. A long 'Wick' on the bottom often means buyers are pushing the price back up (Rejection).`,
    quiz: [
      {
        question: "What does a long bottom wick usually indicate?",
        options: ["Strong Selling pressure", "Buying pressure (Price rejection)", "The market is broken", "Nothing"],
        correctAnswer: 1
      }
    ],
    mission: {
      task: "Open the Simulator and identify a green candle with a long bottom wick.",
      actionLink: "/simulator"
    }
  },
  {
    id: "trading-metrics",
    categoryId: "platform-mastery",
    title: "Trading Metrics Explained",
    description: "What do Volume, Market Cap, and PnL actually mean?",
    difficulty: "Beginner",
    readTimeMinutes: 5,
    xpReward: 150,
    content: `**Volume:** The total amount of money traded in a time period. High volume = High conviction. A price move with low volume is often a 'fakeout'.\n\n**Market Cap:** Price × Circulating Supply. This tells you the true size of a coin. \n\n**Unrealized PnL:** Profit you *would* make if you sold now. It's not real until you click sell!`,
    quiz: [
      {
        question: "If price goes up but Volume is very low, what might happen?",
        options: ["The trend is strong", "The price will likely reverse (Fakeout)", "Volume doesn't matter", "Moon"],
        correctAnswer: 1
      }
    ]
  },

  // --- CATEGORY 5: TECHNICALS ---
  {
    id: "indicators-rsi",
    categoryId: "advanced-trading",
    title: "Indicator: RSI",
    description: "The Relative Strength Index. How to spot Overbought and Oversold conditions.",
    difficulty: "Intermediate",
    readTimeMinutes: 6,
    xpReward: 300,
    content: `RSI measures the speed of price changes. It ranges from 0 to 100.\n\n**The Rule:**\n- **RSI > 70:** Overbought. (Price might drop -> SELL signal).\n- **RSI < 30:** Oversold. (Price might bounce -> BUY signal).\n\n*Pro Tip:* In a strong bull market, RSI can stay overbought for a long time. Use it with other indicators.`,
    quiz: [
      {
        question: "What does RSI below 30 typically suggest?",
        options: ["The asset is Overbought", "The asset is Oversold (Potential Buy)", "The asset is crashing to zero", "Hold"],
        correctAnswer: 1
      }
    ],
    mission: {
      task: "Use the Simulator. Wait for RSI to dip below 35 and place a Buy order.",
      actionLink: "/simulator"
    }
  }
];
