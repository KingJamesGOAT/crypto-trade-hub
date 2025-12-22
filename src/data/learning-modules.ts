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
  { id: "intro", name: "1. Investment Fundamentals" },
  { id: "history", name: "2. The History of Crypto" },
  { id: "tech", name: "3. Blockchain Technology" },
  { id: "ecosystem", name: "4. The Modern Ecosystem" },
  { id: "platform", name: "5. Mastering Technical Analysis" },
];

export const learningModules: LearningModule[] = [
  // --- CHAPTER 1: INVESTMENT FUNDAMENTALS ---
  {
    id: "investing-mindset",
    categoryId: "intro",
    title: "The Investor's Mindset",
    description: "Understanding risk, reward, and the psychology of market cycles.",
    readTime: "5 min",
    difficulty: "Beginner",
    content: `Investing is distinct from trading or gambling. It is the allocation of resources with the expectation of future benefit. In the crypto markets, volatility is the price you pay for performance.\n\n**Key Concepts:**\n\n1. **Risk vs. Reward:** There is no "free lunch." Higher potential returns always carry higher risks of drawdown. A professional investor doesn't ask "How much can I make?", but "How much can I lose?"\n\n2. **Time Horizon:** Are you a scalper (minutes), a swing trader (days), or a holder (years)? Defining this prevents emotional decision-making.\n\n3. **Diversification:** Never allocate 100% of your capital to a single asset, no matter how convincing the narrative is.`,
    quiz: [
      {
        question: "What is the primary question a professional investor asks first?",
        options: ["How much can I make?", "How much can I lose?", "When does the market open?", "Is this coin going to the moon?"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "market-cycles",
    categoryId: "intro",
    title: "Market Cycles & Psychology",
    description: "Bull markets, bear markets, and avoiding the FOMO trap.",
    readTime: "4 min",
    difficulty: "Beginner",
    content: `Markets do not move in straight lines. They move in cycles driven by human emotion.\n\n**The Cycle Phases:**\n- **Accumulation:** Smart money buys quietly when prices are low and fear is high.\n- **Mark-Up (Bull Run):** The public enters, driving prices up. FOMO (Fear Of Missing Out) kicks in.\n- **Distribution:** Smart money sells to the late-comers.\n- **Mark-Down (Bear Market):** Prices crash, panic sets in, and the cycle resets.\n\n**The Golden Rule:** Be fearful when others are greedy, and greedy when others are fearful.`,
    quiz: [
      {
        question: "During which phase does 'Smart Money' typically buy?",
        options: ["Mark-Up (All Time High)", "Distribution", "Accumulation", "Panic Selling"],
        correctAnswer: 2
      }
    ]
  },

  // --- CHAPTER 2: HISTORY ---
  {
    id: "cypherpunks",
    categoryId: "history",
    title: "The Pre-History: Cypherpunks",
    description: "Cryptocurrency didn't start with Bitcoin. The 30-year quest for digital cash.",
    readTime: "6 min",
    difficulty: "Intermediate",
    content: `Bitcoin was not the first attempt at digital currency. It was the culmination of decades of research by a group known as the **Cypherpunks**.\n\n**Notable Predecessors:**\n- **DigiCash (1989):** David Chaum created anonymous electronic cash, but it was centralized and the company went bankrupt.\n- **Hashcash (1997):** Adam Back invented a "Proof of Work" system to stop email spam. This would later become the mining engine of Bitcoin.\n- **Bit Gold (1998):** Nick Szabo proposed a decentralized currency remarkably similar to Bitcoin, but couldn't solve the "Double Spend" problem without a central server.\n\nSatoshi Nakamoto solved what these pioneers could not.`,
    quiz: [
      {
        question: "What major problem did early digital currencies fail to solve before Bitcoin?",
        options: ["Transaction speed", "The Double Spend problem (without centralization)", "Marketing", "Internet access"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "bitcoin-origin",
    categoryId: "history",
    title: "2008: The Bitcoin Whitepaper",
    description: "Satoshi Nakamoto's solution to the Global Financial Crisis.",
    readTime: "5 min",
    difficulty: "Beginner",
    content: `On October 31, 2008, in the middle of the greatest financial collapse in modern history, a paper titled *"Bitcoin: A Peer-to-Peer Electronic Cash System"* was published by Satoshi Nakamoto.\n\n**The Innovation:**\nInstead of trusting a bank to update a ledger (account balances), Bitcoin trusts a network of computers using math. \n\n**Genesis Block:** On Jan 3, 2009, the first Bitcoin block was mined. Embedded in the code was the text: *"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks."* This signaled that Bitcoin was a protest against the failing traditional banking system.`,
    quiz: [
      {
        question: "Who published the Bitcoin Whitepaper?",
        options: ["Vitalik Buterin", "The NSA", "Satoshi Nakamoto", "Elon Musk"],
        correctAnswer: 2
      }
    ]
  },

  // --- CHAPTER 3: BLOCKCHAIN TECH ---
  {
    id: "blockchain-101",
    categoryId: "tech",
    title: "Blockchain Fundamentals",
    description: "Distributed ledgers, blocks, and why they are immutable.",
    readTime: "7 min",
    difficulty: "Intermediate",
    content: `A blockchain is essentially a database that no single person controls. Imagine a Google Sheet that everyone can view, but no one can delete lines from—only add new ones.\n\n**How it works:**\n1. **Transaction:** You send 1 BTC to Alice.\n2. **Block:** Your transaction is bundled with others into a 'Block'.\n3. **Hashing:** The block is sealed with a digital fingerprint called a 'Hash'. Crucially, this hash includes the fingerprint of the *previous* block.\n4. **Chaining:** Because Block B contains Block A's hash, if you try to hack Block A, you break the link to Block B. This makes the history **immutable** (unchangeable).`,
    quiz: [
      {
        question: "What ensures the security and order of blocks in a blockchain?",
        options: ["A password", "The Hash linking to the previous block", "The government", "Miners"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "mining-consensus",
    categoryId: "tech",
    title: "Consensus: PoW vs PoS",
    description: "How the network agrees on the truth without a boss.",
    readTime: "6 min",
    difficulty: "Advanced",
    content: `If there is no bank, who decides which transactions are real? This is the **Consensus Mechanism**.\n\n**Proof of Work (Bitcoin):**\nComputers (Miners) spend massive amounts of electricity solving puzzles. The winner gets to write the next block. It is secure because attacking the network would cost billions in energy.\n\n**Proof of Stake (Ethereum):**\nValidators lock up (Stake) their own coins as collateral. If they act maliciously, their money is destroyed (Slashing). This is more energy-efficient than mining.`,
    quiz: [
      {
        question: "In Proof of Stake, what protects the network?",
        options: ["Electricity usage", "Financial collateral (Staking)", "Legal contracts", "Police"],
        correctAnswer: 1
      }
    ]
  },

  // --- CHAPTER 4: ECOSYSTEM ---
  {
    id: "smart-contracts",
    categoryId: "ecosystem",
    title: "Smart Contracts & Ethereum",
    description: "Moving from 'Digital Gold' to 'Programmable Money'.",
    readTime: "5 min",
    difficulty: "Intermediate",
    content: `Bitcoin is a calculator (simple, secure). Ethereum is a smartphone (runs apps).\n\n**Smart Contracts:**\nThese are self-executing codes holding money. Example: *"If the weather API says it rained, pay the farmer insurance money."* No insurance agent required.\n\nThis technology enabled:\n- **DeFi:** Banking without banks.\n- **NFTs:** Digital ownership rights.\n- **DAOs:** Companies without CEOs.`,
    quiz: [
      {
        question: "What allows Ethereum to run complex applications?",
        options: ["Faster cables", "Smart Contracts", "Bigger blocks", "Lower fees"],
        correctAnswer: 1
      }
    ]
  },

  // --- CHAPTER 5: PLATFORM MASTERY (Technical Analysis) ---
  {
    id: "candlesticks",
    categoryId: "platform",
    title: "Reading Candlestick Charts",
    description: "Interpreting price action, wicks, and bodies.",
    readTime: "5 min",
    difficulty: "Beginner",
    content: `On CryptoTradeHub, we use **Candlestick Charts**. They tell a story about the battle between Buyers (Bulls) and Sellers (Bears).\n\n**The Body:** The thick part. Shows the open and close price.\n- Green: Price went UP.\n- Red: Price went DOWN.\n\n**The Wick (Shadow):** The thin line. Shows the extreme highs and lows.\n\n**Key Pattern - The Rejection:** A long wick on the bottom suggests sellers tried to push price down, but buyers pushed it back up. This is often a bullish signal.`,
    quiz: [
      {
        question: "What does a long bottom wick typically indicate?",
        options: ["Strong selling pressure", "Price rejection (Buying pressure)", "The market is broken", "No volatility"],
        correctAnswer: 1
      }
    ],
    mission: {
      title: "Spot the Wick",
      description: "Go to the Simulator and identify a green candle with a long bottom wick.",
      actionLink: "/simulator"
    }
  },
  {
    id: "indicators-rsi",
    categoryId: "platform",
    title: "Using Indicators: RSI",
    description: "Identifying Overbought and Oversold conditions.",
    readTime: "4 min",
    difficulty: "Intermediate",
    content: `The **Relative Strength Index (RSI)** is a momentum indicator ranging from 0 to 100. It helps identify when a price has moved too far, too fast.\n\n**How to use it:**\n- **RSI > 70 (Overbought):** The price might be too high. Sellers might step in soon. (Potential Sell Signal)\n- **RSI < 30 (Oversold):** The price might be too cheap. Buyers might step in soon. (Potential Buy Signal)\n\n*Warning:* In a strong trend, RSI can stay overbought for a long time. Never use it in isolation.`,
    quiz: [
      {
        question: "If RSI drops below 30, what is the general interpretation?",
        options: ["The asset is Overbought", "The asset is Oversold", "The trend is confirmed", "Sell immediately"],
        correctAnswer: 1
      }
    ],
    mission: {
      title: "Trade the Dip",
      description: "In the Simulator, wait for RSI to drop below 35 and place a Buy order.",
      actionLink: "/simulator"
    }
  }
];
