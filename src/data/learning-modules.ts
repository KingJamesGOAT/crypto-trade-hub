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
    content: `**Part 1: What is Money?**
To understand why Bitcoin exists, we first have to ask a fundamental question: What is money?

Money is not wealth itself. It is a technology we use to move wealth across time and space. Throughout human history, we have upgraded this technology several times:

1. **The Era of Barter**
The System: Direct trade. "I will give you my chicken if you give me your shoes."
The Limitation: The "Coincidence of Wants." If I have a chicken but you don't want a chicken, we cannot trade. Commerce was slow and local.

2. **The Era of Collectibles**
The System: Humans began using rare items like seashells, beads, or unique stones as a neutral medium of exchange.
The Limitation: These items were hard to divide (you can't break a stone in half easily) and hard to transport in large quantities.

3. **The Era of Store of Value (Gold)**
The System: Gold became the global standard. It was durable (doesn't rot), scarce (hard to find), and fungible (one ounce of gold is equal to any other ounce).
The Limitation: It is heavy. Transporting $1 million in gold across the ocean is dangerous and expensive.

4. **The Era of Fiat Currency**
The System: Paper money backed by government decree (USD, EUR, JPY).
The Limitation: It can be printed infinitely.

**Part 2: The Problem with Fiat**
Since 1971, when the US dollar was fully decoupled from gold, the world has operated on "Fiat" money (Latin for "Let it be done").

Fiat money has value only because we trust the government that issues it. However, this trust comes with a heavy cost: Inflation.

Because central banks can print money at will to fund wars, social programs, or bail out corporations, the supply of money constantly increases. When supply goes up, value goes down.
*   **The Hidden Tax:** Inflation is effectively a tax on savers. If you saved $100 in 1970, that money has lost over 85% of its purchasing power today.
*   **The Incentive:** Fiat encourages spending and debt, rather than saving and building long-term wealth.

**Part 3: The Catalyst (2008)**
In 2008, the global financial system nearly collapsed. Banks had gambled recklessly with user deposits on subprime mortgages.

When the bubble burst, governments didn't let the banks fail. Instead, they printed trillions of dollars to bail them out. The message was clear: "Privatize the gains, socialize the losses."

Trust in centralized institutions hit an all-time low. The world was ready for an alternative.

**Part 4: Enter Satoshi Nakamoto**
On October 31, 2008, a whitepaper titled *"Bitcoin: A Peer-to-Peer Electronic Cash System"* was published by an anonymous cryptographer named Satoshi Nakamoto.

Satoshi proposed a radical idea: A form of digital cash that didn't require a bank to verify transactions. He solved the "Double Spend Problem" using cryptography, creating the first digital asset that was:
*   **Scarce:** Only 21,000,000 BTC will ever exist. No one can print more.
*   **Decentralized:** It has no CEO, no headquarters, and no servers. It runs on thousands of independent computers.
*   **Censorship Resistant:** No government can freeze a Bitcoin wallet or block a transaction.

**Part 5: The Genesis Block**
On January 3, 2009, Satoshi mined the first block of the Bitcoin blockchain. Buried inside the code was a secret message:
*"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks."*

This message served two purposes:
1.  It proved the date the network launched.
2.  It forever immortalized Bitcoin's purpose: A peaceful protest against the corrupt traditional banking system.`,
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
    content: `**The "Magic" Explained**
Many people think Blockchain is a complex, magical technology. It isn't. It is simply a specific type of Database.
To understand it, imagine a **Shared Google Sheet**.

*   **Traditional Database (The Bank):** The bank has a private Excel sheet. They control it. If they delete a row, your money is gone. You must trust them.
*   **Blockchain (The Public Ledger):** Everyone on the network downloads a copy of the same Excel sheet.

**1. The Distributed Ledger**
If you want to send 1 Bitcoin to Alice, you shout it out to the network.
Every computer (Node) on the network opens their copy of the ledger and checks: "Does he actually have 1 Bitcoin?"
*   If **yes**, everyone adds the transaction to their file.
*   If **no** (you are trying to cheat), the network rejects you.

This implies that for a hacker to fake a transaction, they would have to hack thousands of computers around the world simultaneously. This is called **Consensus**.

**2. Hashing (The Digital Fingerprint)**
How do we ensure nobody changes the history later? We use a mathematical function called **SHA-256**.
A "Hash Function" takes any amount of data (a word, a book, or a list of transactions) and turns it into a unique string of characters called a Hash.
*   Input: "Hello" -> Hash: \`185f8db3...\`
*   Input: "Hello." (added a dot) -> Hash: \`f96b697d...\`

Notice that changing one tiny dot completely changed the Hash.

**3. The "Chain" of Blocks**
Transactions aren't saved one by one; they are bundled into groups called **Blocks** (like pages in a book).
*   Block 1 has a Hash.
*   Block 2 contains its own transactions **PLUS the Hash of Block 1**.
*   Block 3 contains the Hash of Block 2.

This is the breakthrough. If a hacker tries to erase a transaction in Block 1, the Hash of Block 1 changes. Because Block 2 holds Block 1's Hash, Block 2 now becomes invalid. Then Block 3 becomes invalid.
To hack Bitcoin, you wouldn't just need to hack one block; you would have to re-do the math for the entire history of the chain, which is physically impossible. This makes the blockchain **Immutable** (unchangeable).

**4. Mining (Proof of Work)**
Who gets to add the next page to the book? Computers known as **Miners** compete to solve a difficult mathematical puzzle.
*   **The Cost:** Solving this puzzle requires massive amounts of electricity.
*   **The Reward:** The winner gets to write the next block and is rewarded with new Bitcoin.
*   **The Security:** Why waste all that energy? It is the "wall" that protects the money. To attack Bitcoin, you would need to spend billions of dollars on energy, making the attack more expensive than the potential theft.`,
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
    content: `**Calculator vs. Smartphone**
If Bitcoin is "Digital Gold," what is Ethereum? The best analogy is to compare a **Pocket Calculator** to a **Smartphone**.
*   **Bitcoin (The Calculator):** It does one thing perfectly. It secures money. It is simple, robust, and rarely changes. You wouldn't want your bank vault to play Angry Birds.
*   **Ethereum (The Smartphone):** It allows developers to build applications on top of it. It isn't just a currency; it is a global operating system.

**The Vision**
In 2013, a 19-year-old programmer named Vitalik Buterin realized that blockchain technology could do more than just track financial balances.
He proposed a blockchain that was **Programmable**. He launched Ethereum in 2015 with the concept of the **EVM (Ethereum Virtual Machine)**—a "World Computer" that anyone can rent.

**Smart Contracts**
The core innovation of Ethereum is the **Smart Contract**. A Smart Contract is a computer program stored on the blockchain that runs automatically when specific conditions are met. It replaces the **Middleman**.

*Example: Flight Insurance*
*   **The Old Way:** You pay a premium. Your flight is cancelled. You file a paper claim. An agent reviews it. They might deny you.
*   **The Smart Contract Way:** You send funds to a contract linked to flight data. The moment the flight is marked "Cancelled" in the database, the contract instantly releases the refund to your wallet. No paperwork, no agent, no trust required.

**The Birth of dApps**
Because of Smart Contracts, developers began building **Decentralized Applications (dApps)**.
*   **DeFi (Decentralized Finance):** Apps like Uniswap allow you to trade stocks or crypto without a broker.
*   **NFTs (Digital Ownership):** Tokens that prove ownership of unique assets like art, music, or gaming items.
*   **DAOs:** Organizations managed by code and voting, rather than a Board of Directors.

**Understanding "Gas"**
Because Ethereum is a global computer, it has limited processing power. To prevent people from spamming the network with infinite loops, you must pay a fee for every step of computation.
This fee is called **Gas**. It is paid in ETH. The more complex your transaction (e.g., minting an NFT vs. sending money), the more Gas you must pay.`,
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
    content: `**The Great Misconception**
The most common misunderstanding in crypto is this: "My coins are inside my wallet."
This is false. Your coins live on the blockchain network. They never leave the internet. Your wallet does not store coins; it stores your **Keys**. It is a keychain, not a vault.

**Public vs. Private Keys**
Cryptography uses a pair of keys to ensure security:
1.  **The Public Key (The Mailbox)**
    *   This is your "Address" (e.g., \`0x71C...\`).
    *   You can give this to anyone safely.
    *   People use it to send you money, just like putting a letter in a mailbox slot.

2.  **The Private Key (The Metal Key)**
    *   This is a long string of secret code.
    *   It is the only thing that can open the mailbox and take the money out.
    *   **WARNING:** Anyone who has this key owns your money. If you lose it, the money is locked in the mailbox forever.

**The Seed Phrase**
Because Private Keys look like computer gibberish, modern wallets convert them into a 12 or 24-word **Seed Phrase** (e.g., "army van defense carry...").
This phrase is the master key to your entire financial life.
If you lose your phone/computer, you can buy a new one, type in these 12 words, and your money will reappear.
*Never store these words in a computer file, photo, or email. Hackers scan for them. Write them on paper.*

**Hot vs. Cold Wallets**
*   **Hot Wallet (e.g., MetaMask, Phantom):**
    *   A software app connected to the internet.
    *   Pros: Convenient, fast, connects to websites.
    *   Cons: Vulnerable to malware and hacks. Keep only "spending money" here.

*   **Cold Wallet (e.g., Ledger, Trezor):**
    *   A physical USB device that keeps your keys offline at all times.
    *   Pros: Extremely secure. Even if your computer has a virus, the keys never leave the device.
    *   Cons: Less convenient for quick trading.

**The Golden Rule**
"Not Your Keys, Not Your Coins." If you leave your money on an exchange (like Binance or Coinbase), they hold the Private Keys. You are trusting them. If they go bankrupt (like FTX), your money is gone.`,
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
    content: `**The Volatility Problem**
Cryptocurrency is famous for its volatility. Bitcoin can drop 10% in a single hour. While this is great for speculation, it makes it terrible for day-to-day commerce. You wouldn't want to pay for coffee with a currency that might be worth half as much tomorrow.
To solve this, the industry created **Stablecoins**.

**What is a Stablecoin?**
A Stablecoin is a cryptocurrency that is "pegged" to a stable asset, usually the US Dollar. \`1 USDT = $1.00 USD\`. Always.
This gives traders the best of both worlds:
1.  The speed and programmability of crypto (send it anywhere in seconds).
2.  The stability of the US Dollar.

**Types of Stablecoins**
1.  **Fiat-Collateralized (USDT, USDC)**
    *   **How it works:** For every 1 digital token they issue, a company (like Tether or Circle) keeps $1 of real cash or treasury bonds in a bank vault.
    *   **Pros:** Highly efficient and liquid.
    *   **Cons:** Centralized. You have to trust that the company actually has the money.

2.  **Crypto-Collateralized (DAI)**
    *   **How it works:** You don't trust a bank; you trust a Smart Contract. To mint $100 of DAI, you might have to lock up $150 worth of Ethereum in a vault. If the price of ETH crashes, the contract automatically sells your ETH to pay back the debt.
    *   **Pros:** Decentralized and transparent.
    *   **Cons:** "Capital Inefficient" (you need money to make money).

**Why Do We Need Them?**
Stablecoins are the "Dry Powder" of the crypto ecosystem.
*   **Trading:** If you think Bitcoin is about to crash, you sell it for USDT to protect your value.
*   **DeFi:** You can lend your USDT to others and earn interest, just like a bank, but typically with higher rates.
*   **Payments:** Sending $1,000,000 internationally via a bank takes days and costs high fees. Sending $1,000,000 in USDC takes seconds and costs pennies.`,
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
