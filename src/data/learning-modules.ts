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
  // --- MODULE 1: MONEY & BITCOIN ---
  {
    id: "history-money-bitcoin",
    categoryId: "foundation",
    title: "1. Money & The Birth of Bitcoin",
    description: "From the history of barter to the 2008 Financial Crisis. Why Bitcoin was inevitable.",
    readTime: "12 min",
    difficulty: "Beginner",
    content: `**The Evolution of Value**
To understand Bitcoin, we must first ask: *What is money?*
Money is not wealth; it is a technology for moving wealth across time and space. Throughout history, humanity has iterated on this technology:
1. **Barter:** Direct trade (My chicken for your shoes). Limitation: 'Coincidence of wants'.
2. **Collectibles:** Shells, beads, rare stones. Limitation: Hard to divide or transport.
3. **Store of Value (Gold):** Durable, scarce, and fungible. Limitation: Heavy and dangerous to transport.
4. **Fiat Currency:** Paper money backed by government decree (USD, EUR). Limitation: Can be printed infinitely.

**The Problem with Fiat (The "Soft" Money)**
Since 1971, when the US dollar was decoupled from gold, money became "Fiat" (Latin for "let it be done"). Its value relies entirely on trust in the government.
Because central banks can print money at will to fund wars or bail out corporations, the supply of money constantly increases. This is **Inflation**. It effectively steals purchasing power from savers. If you saved $100 in 1970, it is worth less than $15 today.

**The Catalyst: The 2008 Financial Crisis**
In 2008, the global banking system collapsed due to reckless gambling with user deposits (Subprime Mortgages). Governments responded by printing trillions of dollars to bail out the very banks that caused the crisis. Trust in centralized institutions hit an all-time low.

**Enter Satoshi Nakamoto**
On October 31, 2008, a whitepaper titled *"Bitcoin: A Peer-to-Peer Electronic Cash System"* was published by an anonymous cryptographer named Satoshi Nakamoto.
Satoshi didn't just invent a new currency; he solved the **"Double Spend Problem"** without a bank. For the first time in history, we had a digital asset that was:
* **Scarce:** Only 21,000,000 BTC will ever exist.
* **Decentralized:** No CEO, no server, no headquarters.
* **Censorship Resistant:** No government can freeze a Bitcoin wallet.

**The Genesis Block**
On January 3, 2009, Satoshi mined the first block. Embedded in the code was a secret message: *"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks."*
This proved the date of origin and forever immortalized Bitcoin's purpose: A peaceful protest against the corrupt traditional banking system.`,
    quiz: [
      {
        question: "What is the primary flaw of Fiat currency described in this lesson?",
        options: ["It is too heavy to carry", "It is backed by Gold", "It can be printed infinitely by central banks (Inflation)", "It is purely digital"],
        correctAnswer: 2
      },
      {
        question: "What was the specific event in 2008 that likely triggered the creation of Bitcoin?",
        options: ["The invention of the iPhone", "The Global Financial Crisis and Bank Bailouts", "The election of Obama", "The dot-com bubble"],
        correctAnswer: 1
      }
    ]
  },

  // --- MODULE 2: BLOCKCHAIN MECHANICS ---
  {
    id: "blockchain-mechanics",
    categoryId: "foundation",
    title: "2. Blockchain Under the Hood",
    description: "Distributed Ledgers, Hashing, and Mining. How it actually works.",
    readTime: "15 min",
    difficulty: "Intermediate",
    content: `Many people think "Blockchain" is magic. It isn't. It is simply a specific type of database. To understand it, we need to break it down into three specific technologies:

**1. The Distributed Ledger (The Spreadsheet)**
Imagine a Google Sheet that everyone in the world can view, but no single person is the "Admin."
* **Traditional Bank:** The bank has the master ledger. If they delete a row, your money is gone. You trust them.
* **Blockchain:** *Everyone* downloads a copy of the ledger. If one person tries to cheat and write "I have 1,000 BTC" in their copy, the thousands of other computers (Nodes) compare it to their files, see the mismatch, and reject the liar. This is called **Consensus**.

**2. Hashing (The Digital Fingerprint)**
How do we secure the data? We use a mathematical function called **SHA-256**.
A "Hash Function" takes any amount of data (a word, a book, a transaction) and turns it into a unique string of characters.
* Input: "Hello" -> Hash: \`185f8db3...\`
* Input: "Hello." (added a dot) -> Hash: \`f96b697d...\` (Completely different!)
This means if a hacker tries to change a transaction from 5 years ago (even by 1 cent), the Hash of that block changes completely. The network instantly notices the tamper.

**3. The "Chain" of Blocks**
Transactions aren't saved one by one; they are bundled into "Blocks" (like pages in a book).
* Block 1 has a Hash (Fingerprint).
* Block 2 contains its own transactions **PLUS the Hash of Block 1**.
* Block 3 contains the Hash of Block 2.
This links them together mathematically. If you hack Block 1, the Hash changes. Since Block 2 includes Block 1's Hash, Block 2 is now invalid. Then Block 3 breaks. To hack Bitcoin, you would have to re-do the math for the entire history of the chain, which is thermodynamically impossible.

**4. Mining (Proof of Work)**
Who gets to add the next page?
Computers (Miners) compete to solve a difficult math puzzle (guessing a random number that results in a specific Hash). This requires massive amounts of electricity.
* **Why waste energy?** It's not waste; it's security. The cost of electricity makes it too expensive to attack the network. To overpower Bitcoin, you would need more energy than a medium-sized country.
The winner gets to write the next block and is rewarded with new Bitcoin.`,
    quiz: [
      {
        question: "Why is the 'Chain' structure important?",
        options: ["It makes the database look cool", "It links blocks so that changing past data breaks all future blocks", "It allows faster internet speeds", "It saves electricity"],
        correctAnswer: 1
      },
      {
        question: "What is the role of 'Nodes' in the network?",
        options: ["To hack the system", "To issue new passwords", "To keep a copy of the ledger and reject invalid transactions", "To increase transaction fees"],
        correctAnswer: 2
      }
    ]
  },

  // --- MODULE 3: ETHEREUM ---
  {
    id: "ethereum-revolution",
    categoryId: "foundation",
    title: "3. The Ethereum Revolution",
    description: "From 'Digital Calculators' to 'World Computers'. The birth of Smart Contracts.",
    readTime: "12 min",
    difficulty: "Intermediate",
    content: `**Bitcoin vs. Ethereum: The Analogy**
* **Bitcoin** is a pocket calculator. It does one thing perfectly: it handles numbers (money). It is simple, secure, and robust.
* **Ethereum** is a Smartphone. It isn't just a calculator; it has an App Store. You can build games, banks, and social networks on top of it.

**The Origin Story**
In 2013, a 19-year-old programmer named Vitalik Buterin (a writer for Bitcoin Magazine) proposed that blockchain could do more than just track payments. He wanted to make blockchain **Programmable**.
He launched Ethereum in 2015 with the concept of the **EVM (Ethereum Virtual Machine)**—a global supercomputer that anyone can rent.

**The Breakthrough: Smart Contracts**
A Smart Contract is a computer program stored on the blockchain that runs automatically when conditions are met. It replaces the "Middleman."
* **Traditional Insurance:** You pay a premium. A hurricane hits your farm. You file a claim. An agent visits. The company decides if they want to pay you. (Slow, Trust-based).
* **Smart Contract Insurance:** You send funds to a contract linked to a Weather API. If wind speed > 100mph, the contract *instantly* releases funds to your wallet. (Fast, Code-based, No middleman).

**What Ethereum Enabled (The Ecosystem)**
Because of this programmability, entire industries were rebuilt on-chain:
1.  **DeFi (Decentralized Finance):** Uniswap and Aave allow you to trade and lend money without a bank.
2.  **NFTs (Non-Fungible Tokens):** Tokenized ownership of art, music, or real estate.
3.  **DAOs:** Companies owned by code and voted on by token holders, not managed by a CEO.

**Gas Fees**
To prevent people from spamming this "World Computer" with infinite loops, Ethereum charges a fee for every computation. This is called **Gas**, paid in ETH. The more complex the transaction, the more Gas it costs.`,
    quiz: [
      {
        question: "What is the best analogy for the difference between Bitcoin and Ethereum?",
        options: ["Gold vs Silver", "Calculator vs Smartphone", "Bank vs Stock Market", "Email vs Letter"],
        correctAnswer: 1
      },
      {
        question: "What is a Smart Contract?",
        options: ["A legally binding paper document", "Self-executing code that runs when conditions are met", "A contract signed by smart people", "An AI lawyer"],
        correctAnswer: 1
      }
    ]
  },

  // --- MODULE 4: WALLETS & SECURITY ---
  {
    id: "wallets-custody",
    categoryId: "foundation",
    title: "4. Wallets, Custody & Security",
    description: "Public Keys, Private Keys, and the 'Not Your Keys, Not Your Coins' rule.",
    readTime: "10 min",
    difficulty: "Beginner",
    content: `**The Misconception**
A crypto wallet does *not* store crypto. Your Bitcoin lives on the blockchain, not on your phone.
A wallet stores your **Keys**. It is a keychain, not a vault.

**Public vs. Private Keys**
Cryptography uses a pair of keys:
1.  **Public Key (The Mailbox):** This is your Address (e.g., \`0x71C...\`). You can give this to anyone safely. People use it to send you money.
2.  **Private Key (The Key to the Mailbox):** This is a long string of secret code that signs transactions. *Anyone who has this key owns your money.* You must never share it.

**The Seed Phrase**
Because Private Keys look like gibberish (\`5Kb8kLf9zg...\`), wallets convert them into a **12 or 24-word Seed Phrase** (e.g., "army van defense carry...").
This phrase is the master key to your entire financial life. If you lose your phone, you can restore your wallet on a new device using these words. If you lose these words, your money is gone forever. There is no "Forgot Password" support.

**Types of Custody**
* **Custodial (The Bank Model):** Exchanges like Binance or Coinbase hold the keys for you.
    * *Risk:* If the exchange goes bankrupt (like FTX or Mt. Gox), you lose everything.
* **Non-Custodial (Self-Custody):** You hold the keys (MetaMask, Phantom).
    * *Risk:* You are responsible for your own security.

**Hot vs. Cold Wallets**
* **Hot Wallet:** Connected to the internet (Browser extension, Mobile App). Convenient for trading, but vulnerable to hacks.
* **Cold Wallet (Hardware Wallet):** A physical device (Ledger, Trezor) that keeps keys offline. It connects via USB/Bluetooth only to sign a transaction. Even if your computer has a virus, your keys are safe inside the device.

**The Golden Rule:**
"Not Your Keys, Not Your Coins." For any significant amount of money, move it off the exchange and into a hardware wallet.`,
    quiz: [
      {
        question: "If you lose your Seed Phrase (Recovery Phrase), who can recover your money?",
        options: ["The wallet support team", "Satoshi Nakamoto", "No one. It is lost forever.", " The FBI"],
        correctAnswer: 2
      },
      {
        question: "Which type of wallet provides the highest security for long-term storage?",
        options: ["Hot Wallet (Mobile App)", "Custodial Wallet (Exchange)", "Cold Storage (Hardware Wallet)", "Writing it in a Google Doc"],
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
