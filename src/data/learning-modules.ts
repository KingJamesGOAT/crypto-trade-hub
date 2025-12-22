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
He proposed a blockchain that was **Programmable**. He launched Ethereum in 2015 with the concept of the **EVM (Ethereum Virtual Machine)** - a "World Computer" that anyone can rent.

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
    readTime: "8 min",
    difficulty: "Beginner",
    content: `### The Problem: Volatility
Cryptocurrency is famous for its explosive price action. Bitcoin can rise 100% in a year or drop 50% in a month. While this volatility is excellent for speculation and growing wealth, it makes crypto terrible for two specific things:

1. **Daily Commerce:** You wouldn't buy a coffee with Bitcoin if that same Bitcoin might be worth a steak dinner tomorrow.
2. **Preserving Wealth:** If the market crashes, traders need a "Safe Haven" to park their money without cashing out to a slow, traditional bank.

### The Solution: Stablecoins
A Stablecoin is a specific type of cryptocurrency designed to maintain a stable value, usually pegged 1:1 to a fiat currency like the US Dollar.
**1 USDT = $1.00 USD. Always.**

This innovation creates a "Bridge" between the traditional financial world (Fiat) and the digital world (Crypto). It gives you the stability of the dollar with the speed and programmability of the blockchain.

### The Three Types of Stablecoins

**1. Fiat-Collateralized (The Bank Model)**
* **Examples:** USDT (Tether), USDC (USD Coin).
* **How it works:** This is the simplest model. For every 1 digital token minted on the blockchain, a central company holds $1 of real cash (or equivalent assets like US Treasury Bonds) in a bank vault.
* **Pros:** Highly liquid and efficient. This is the standard for trading pairs on exchanges.
* **Cons:** Centralized. You have to trust that the company *actually* has the money. If the government seizes their bank accounts, the token could lose value.

**2. Crypto-Collateralized (The DeFi Model)**
* **Example:** DAI (MakerDAO).
* **How it works:** You don't trust a company; you trust a Smart Contract. To mint $100 of DAI, you must deposit *more* than $100 worth of Ethereum (e.g., $150) into a vault as collateral. This is called **Over-Collateralization**.
* **The Safety Mechanism:** If the price of your Ethereum drops too low, the smart contract automatically sells your ETH to pay back the debt. This ensures the system is always solvent without a human manager.
* **Pros:** Decentralized, transparent, and censorship-resistant.

**3. Algorithmic (The Experimental Model)**
* **How it works:** These coins use complex code to balance supply and demand to keep the price at $1.00, often without full backing.
* **Warning:** This is highly risky. The most famous failure was **Terra (UST)**, which collapsed in 2022, wiping out $40 billion in days. Most experts recommend sticking to Fiat or Crypto-backed stablecoins.

### Use Cases: Why Hold a Dollar on the Blockchain?
* **Trading Pairs:** Almost all crypto trading happens against stablecoins (e.g., BTC/USDT). It is the measuring stick of the market.
* **DeFi Lending:** You can lend your USDC to traders and earn interest (often 3% - 10% APY), which is significantly higher than a traditional savings account.
* **Cross-Border Payments:** Sending $1,000,000 via a bank wire takes 3-5 days and costs $50+. Sending $1,000,000 in USDC takes 15 seconds and costs pennies.`,
    quiz: [
      {
        question: "What is the primary purpose of a Stablecoin?",
        options: ["To double in value", "To maintain a stable value (usually $1)", "To pay for gas fees", "To remain anonymous"],
        correctAnswer: 1
      },
      {
        question: "How does a Crypto-Collateralized stablecoin like DAI maintain its value?",
        options: ["A bank holds real dollars", "It uses an algorithm", "It is over-collateralized by other crypto assets locked in a contract", "The government backs it"],
        correctAnswer: 2
      }
    ]
  },

  // --- MODULE 6: DEFI ---
  {
    id: "defi-explained",
    categoryId: "ecosystem",
    title: "6. DeFi (Decentralized Finance)",
    description: "Uniswap, Aave, and banking without bankers.",
    readTime: "10 min",
    difficulty: "Intermediate",
    content: `### Introduction: Banking Without Bankers
Traditional Finance ("TradFi") relies entirely on intermediaries.
* To buy a stock, you need a broker (Robinhood).
* To save money, you need a bank (Chase).
* To get a loan, you need a credit officer to approve your score.

**DeFi (Decentralized Finance)** rebuilds these services using **Smart Contracts** on the blockchain. It removes the human middleman and replaces him with code. The result is a financial system that is open 24/7, accessible to anyone with an internet connection, and completely transparent.

### Pillar 1: The Decentralized Exchange (DEX)
* **Example:** Uniswap.
* **The Innovation:** Automated Market Makers (AMMs).
* **How it works:** In a traditional stock market, there is an "Order Book" where buyers are matched with sellers. On a DEX, there is no order book. Instead, users trade against a **Liquidity Pool** - a giant pile of coins locked in a smart contract.
* **The Price:** The price is determined mathematically by the ratio of coins in the pool. If you buy ETH from the pool, you reduce the supply of ETH and increase the supply of USDC, which automatically raises the price of ETH.

### Pillar 2: Lending & Borrowing
* **Example:** Aave, Compound.
* **How it works:** You can deposit your Bitcoin or Ethereum into a "Pool" to earn interest. Other users can borrow from that pool.
* **No Credit Checks:** DeFi doesn't care about your credit score or your job. It works on **Collateral**. To borrow $1,000, you might need to lock up $1,500 worth of Bitcoin. If you don't pay it back, the protocol keeps your Bitcoin.
* **Flash Loans:** A uniquely crypto concept where you can borrow millions of dollars for *free*, instantly, as long as you pay it back in the exact same transaction block. This is used by bots for arbitrage.

### Pillar 3: Yield Farming
* **Concept:** Putting your crypto to work.
* **How it works:** By depositing your coins into a Liquidity Pool (e.g., putting $1000 of ETH and $1000 of USDC into Uniswap), you effectively become the "Bank."
* **The Reward:** Every time a trader swaps tokens, they pay a 0.3% fee. That fee goes directly to you (the Liquidity Provider). This allows regular people to earn passive income from market volume.

### The Risks of DeFi
DeFi is the "Wild West" of finance.
1. **Smart Contract Risk:** If there is a bug in the open-source code, a hacker can drain the entire pool. There is no FDIC insurance to bail you out.
2. **Impermanent Loss:** When you provide liquidity, if the price of one asset changes drastically compared to the other, you might end up with less money than if you had just held the coins in your wallet.
3. **Rug Pulls:** Scammers can create a fake DeFi project, attract deposits, and then steal the funds. Always audit the project before depositing.`,
    quiz: [
      {
        question: "What replaces the 'Market Maker' or 'Bank' in a Decentralized Exchange (DEX)?",
        options: ["The government", "Liquidity Pools (User funds)", "A CEO", "Miners"],
        correctAnswer: 1
      },
      {
         question: "What happens if the value of your collateral drops too low in a DeFi loan?",
         options: ["The bank calls you", "Nothing", "The smart contract automatically sells your collateral (Liquidation)", "You get a fine"],
         correctAnswer: 2
      }
    ]
  },

  // --- MODULE 7: LAYER 2 SCALING ---
  {
    id: "layer2-scaling",
    categoryId: "ecosystem",
    title: "7. Layer 2s & Scaling",
    description: "Why ETH is slow and how Arbitrum/Optimism fix it.",
    readTime: "8 min",
    difficulty: "Advanced",
    content: `### The Scalability Problem
Imagine Ethereum is a single highway. When it launched, there were only a few cars, so traffic moved fast and tolls (Gas Fees) were cheap.
As DeFi and NFTs exploded in popularity, the highway became gridlocked. At peak times, sending a simple transaction could cost $100 and take 30 minutes.

This is known as the **Blockchain Trilemma**: It is hard to be Decentralized, Secure, and Scalable all at the same time. Ethereum chose Security and Decentralization, which sacrificed Speed.

### The Solution: Layer 2s (L2)
Instead of widening the highway (which is technically difficult), engineers decided to build **Elevated Expressways** on top of it. These are called Layer 2 Scaling Solutions.

**How Layer 2 Works (The "Rollup"):**
1. **Execution:** You leave the Ethereum mainnet (Layer 1) and move your funds to a Layer 2 network (like Arbitrum or Base). You do all your trading, swapping, and gaming there. It is lightning fast and costs pennies.
2. **Batching:** The Layer 2 doesn't send every single transaction to Ethereum. Instead, it "rolls up" thousands of transactions into a single bundle.
3. **Settlement:** It saves a compressed summary of that bundle onto the Ethereum Layer 1.
* **The Result:** You get the security of Ethereum (because the final data lives there) but the speed of a separate network.

### Types of Layer 2s

**1. Optimistic Rollups**
* **Examples:** Arbitrum, Optimism.
* **Mechanism:** They operate on an "Innocent until proven guilty" model. They assume all transactions are valid to speed things up. However, they allow a 7-day "Challenge Window" where anyone can prove a transaction was fraudulent.
* **User Experience:** Fast and cheap, but withdrawing money back to Layer 1 can take a week (due to the challenge window).

**2. ZK-Rollups (Zero Knowledge)**
* **Examples:** ZK-Sync, Starknet.
* **Mechanism:** They use advanced cryptography (Zero Knowledge Proofs) to mathematically *prove* the transactions are valid instantly.
* **The Holy Grail:** Vitalik Buterin has stated that ZK-Rollups are the likely long-term winner because they are mathematically secure without the 7-day wait time.

### Why This Matters for Investors
The future of crypto is likely **"Modular."**
* **Layer 1 (Ethereum):** Will become the "Settlement Layer" - the bedrock security foundation that normal people rarely interact with directly.
* **Layer 2 (Arbitrum/Base):** Will become the "Execution Layer" - where all the apps, games, and trading actually happen.
* **Investing Tip:** Many Layer 2s have their own tokens. Evaluating them depends on how many apps and users are migrating to their specific "Expressway."`,
    quiz: [
      {
        question: "How do Layer 2 rollups reduce fees?",
        options: ["They use a fundamentally different blockchain", "They bundle thousands of transactions into one batch", "They make miners work for free", "They remove security"],
        correctAnswer: 1
      },
      {
        question: "What is the primary difference between Optimistic and ZK Rollups?",
        options: ["Optimistic Rollups use AI", "ZK Rollups use mathematical proofs to validate transactions instantly", "Optimistic Rollups are slower", "ZK Rollups are owned by Facebook"],
        correctAnswer: 1
      }
    ]
  },

  // --- MODULE 8: TOKENOMICS ---
  {
    id: "tokenomics-101",
    categoryId: "ecosystem",
    title: "8. Tokenomics 101",
    description: "Supply caps, inflation, and spotting bad projects.",
    readTime: "12 min",
    difficulty: "Intermediate",
    content: `### Why "Price" Does Not Equal "Value"
New investors often look at a coin priced at **$0.000001** and think: *"If this goes to just $1, I will be a billionaire!"*
**This is the single most dangerous fallacy in crypto.**

To analyze a crypto investment properly, you must ignore the price per coin and look at the **Tokenomics** (Token Economics).

### 1. Market Cap vs. Supply
* **Circulating Supply:** The number of coins currently in public hands.
* **Max Supply:** The maximum number of coins that will ever exist.
* **Market Cap:** (Price) x (Circulating Supply).

**The Reality Check:**
* **Bitcoin:** Price $60,000. Supply 19 Million. Market Cap = $1.1 Trillion.
* **Shiba Inu:** Price $0.00002. Supply 589 Trillion. Market Cap = $12 Billion.
For Shiba Inu to reach $1.00, its Market Cap would have to be **$589 Trillion**, which is more than all the money in the entire world combined. **Always check the Market Cap, not the price.**

### 2. Fully Diluted Valuation (FDV)
Sometimes a project looks cheap because only 10% of the tokens are unlocked.
* **Example:** A new project has a Market Cap of $10M. But 90% of the tokens are locked and held by the developers.
* **The Trap:** When those tokens unlock, the supply will increase 10x. If demand doesn't also increase 10x, the price **must** crash.
* **FDV:** This metric calculates the value if *all* tokens were in circulation today. Always compare Market Cap to FDV. If FDV is massive, you are at risk of being "dumped on."

### 3. Allocation & Vesting Schedules
Who owns the coins?
* **Fair Launch (e.g., Bitcoin):** Everyone had to mine or buy from day one. No free coins for founders.
* **Pre-Mine / VC Allocation:** The team and Venture Capitalists (VCs) bought tokens cheaply before the public.
* **Vesting:** This is the lock-up period. You need to verify the **"Cliff"** - the date when the VCs are allowed to sell. If a massive unlock is happening next week, buying now is essentially purchasing their exit liquidity.

### 4. Utility: What is the Token For?
A token must have a reason to exist, or its value is pure speculation.
* **Gas Token:** (e.g., ETH, SOL). You *must* buy it to use the network. This creates constant natural demand.
* **Governance:** (e.g., UNI). Allows you to vote on protocol changes.
* **Yield/Staking:** Allows you to earn more tokens. (Warning: If the yield comes from printing new tokens, this is inflationary and devalues your holding).
* **Burn Mechanism:** (e.g., BNB, ETH). The protocol destroys a portion of tokens regularly. This reduces supply, which can increase price if demand stays steady.

**Summary:** Good Tokenomics = High Utility + Low/Controlled Inflation + Fair Distribution.`,
    quiz: [
      {
        question: "If a project has a low Market Cap but a massive FDV, what is the risk?",
        options: ["The project is undervalued", "Massive future inflation (unlocks) will lower the price", "The project is a scam", "There is no liquidity"],
        correctAnswer: 1
      },
      {
        question: "Why is 'Price per coin' a bad metric for valuation?",
        options: ["It doesn't tell you the trend", "It ignores the total number of coins (Supply)", "It changes too fast", "It is manipulated"],
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
    readTime: "10 min",
    difficulty: "Intermediate",
    content: `### What is Fundamental Analysis (FA)?
Technical Analysis (TA) involves looking at lines on a chart to predict where the price might go next.
Fundamental Analysis (FA) involves looking at the business itself to determine if the asset is actually worth anything.

In the stock market, FA means looking at Price-to-Earnings (P/E) ratios and balance sheets. In Crypto, where many projects have no revenue, FA requires a different toolkit.

### 1. The Team & Track Record
The first rule of crypto investing: Bet on the Jockey, not the Horse.
* **Identity:** Is the team public (Doxxed) or anonymous? Anonymous teams aren't always bad (Satoshi was anon), but they carry higher rug-pull risks.
* **History:** Have they built successful protocols before? Or is this their first project?
* **The "Bus Factor":** If the lead developer got hit by a bus tomorrow, would the project survive? If the answer is "No," the project is too centralized.

### 2. On-Chain Metrics (The "Truth")
People lie. Blockchains don't. You can verify the health of a project by checking the data.
* **TVL (Total Value Locked):** How much money have users deposited into the protocol? High TVL ($1B+) indicates trust. Low TVL indicates a ghost town.
* **Active Addresses:** How many unique wallets are actually using the app daily? A project with a $1B market cap but only 50 daily users is massively overvalued.
* **Transaction Volume:** Is money moving? High volume generates fees, which supports the token price.

### 3. Developer Activity
Crypto is software. If the software stops improving, it dies.
* **GitHub Commits:** You can view a project's code repository publicly. Are developers pushing updates every day? Or has the code not been touched in 6 months? "Vaporware" projects often have flashy websites but empty GitHubs.

### 4. The "Moat" (Competitive Advantage)
Why does this project exist?
* **The Fork Problem:** Since crypto is open-source, anyone can copy (fork) Uniswap's code and launch "SushiSwap."
* **Liquidity Network Effects:** Why do people stay with Uniswap? Because that's where the liquidity is. Moving liquidity is hard. A strong moat is defined by **Sticky Liquidity** - users who stay even when a competitor offers slightly higher rewards.

### 5. Tokenomics Audit (Recap)
Even the best software is a bad investment if the tokenomics are predatory.
* **Emissions:** Is the project printing 10% new tokens every month to pay "Yield"? That is hyperinflation. The price will likely trend to zero.
* **Revenue Share:** Does holding the token entitle you to a percentage of the protocol's fees? If not, the token is just a "Governance Meme" with no intrinsic value.`,
    quiz: [
      {
        question: "What is the most reliable metric for a DeFi protocol's success?",
        options: ["Twitter followers", "TVL (Total Value Locked) and User Revenue", "The price of the token", "Celebrity endorsements"],
        correctAnswer: 1
      },
      {
        question: "What does 'Vaporware' refer to?",
        options: ["A privacy coin", "A project with big promises but no code/product", "Gas fees", "Liquid staking"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "market-psychology",
    categoryId: "analysis",
    title: "10. Market Cycles & Psychology",
    description: "The 4 phases of a market cycle.",
    readTime: "8 min",
    difficulty: "Beginner",
    content: `### The Emotional Rollercoaster
Markets do not move in straight lines. They move in waves driven by human emotion. Because humans haven't changed in 10,000 years, these cycles repeat with frightening predictability.
Every crypto cycle (typically 4 years, driven by the Bitcoin Halving) follows the same four phases.

### Phase 1: Accumulation (The "Stealth" Phase)
* **Sentiment:** Boredom, Disbelief, Anger.
* **Price Action:** The market has crashed and is now moving sideways (ranging) for months. Volatility is low.
* **The Players:** "Smart Money" (Institutions, Whales, Contrarians) are quietly buying. They are absorbing the coins sold by investors who gave up in the crash.
* **Strategy:** This is the time to buy heavily, but it feels the hardest psychologically because "Crypto seems dead."

### Phase 2: Mark-Up (The Bull Run)
* **Sentiment:** Hope > Optimism > Euphoria.
* **Price Action:** Highs are broken. The chart goes parabolic. Media starts reporting on "Crypto Millionaires."
* **The Players:** The Retail Public enters. Your Uber driver asks you about Shiba Inu.
* **The Trap:** As prices hit All-Time Highs (ATH), the "Smart Money" begins selling their bags to the new Retail buyers. This is the point of maximum financial risk, but it feels like the safest time to invest.

### Phase 3: Distribution (The Top)
* **Sentiment:** Complacency. "This time is different." "Supercycle."
* **Price Action:** Prices stall. Volatility increases. We see "Lower Highs" on the chart.
* **The Players:** Whales are exiting. Retail is holding, waiting for the "next leg up."
* **Warning Sign:** When bad news is ignored and good news fails to pump the price, the buyers are exhausted.

### Phase 4: Mark-Down (The Bear Market)
* **Sentiment:** Anxiety > Panic > Depression.
* **Price Action:** Violent crashes. -80% or -90% drawdowns. Projects go bankrupt.
* **The Players:** Retail panic sells at a loss. Smart Money waits on the sidelines with cash.
* **The Cycle Reset:** Only when the last "weak hand" has sold does the selling pressure stop, and Accumulation begins again.

### The Cheat Sheet
* **Be Fearful when others are Greedy:** When your grandma asks how to buy Dogecoin, it's time to sell.
* **Be Greedy when others are Fearful:** When the news says "Crypto is dead," it's time to buy.`,
    quiz: [
      {
        question: "In which phase is it most profitable (but psychologically hardest) to buy?",
        options: ["Mark-Up", "Distribution", "Accumulation / Mark-Down", "All-Time High"],
        correctAnswer: 2
      },
      {
        question: "Who is usually selling during the 'Mark-Up' (Bull Run) phase?",
        options: ["Retail investors", "Smart Money (Whales)", "Miners", "No one"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "order-books",
    categoryId: "analysis",
    title: "11. Order Books & Liquidity",
    description: "Bids, Asks, Spreads, and Slippage explained.",
    readTime: "8 min",
    difficulty: "Advanced",
    content: `### What Happens When You Click "Buy"?
When you trade on an exchange (like Binance or Coinbase), you aren't buying from the "Exchange." You are buying from another person. The Exchange is just the matchmaker.
To understand trading, you must understand the Order Book.

### 1. The Order Book
Imagine a list divided into two sides:
* **The Bids (Green/Left):** A list of people waiting to BUY. They want the lowest price possible.
  * Example: "I will buy 1 BTC for $59,000."
* **The Asks (Red/Right):** A list of people waiting to SELL. They want the highest price possible.
  * Example: "I will sell 1 BTC for $59,005."

The price you see on the screen (e.g., $59,002) is simply the mid-point or the last traded price.

### 2. The Spread
The difference between the highest Bid and the lowest Ask is called the Spread.
* **High Liquidity (Bitcoin):** The spread is tiny ($0.01). Buyers and sellers agree closely on price.
* **Low Liquidity (Shitcoins):** The spread is huge. Someone might be selling for $1.00, but the next buyer is only offering $0.80. If you buy, you instantly lose 20% value.

### 3. Market Orders vs. Limit Orders
This is the most critical mechanical skill for a trader.

**A. Limit Order (The "Maker")**
* **Action:** "I want to buy BTC, but only if it hits $58,000."
* **Effect:** You add liquidity to the book. You sit in the queue.
* **Pros:** You get the exact price you want. Lower fees (Maker Fees).
* **Cons:** Your order might never get filled if the price doesn't drop.

**B. Market Order (The "Taker")**
* **Action:** "I don't care about the price! Get me in NOW!"
* **Effect:** You remove liquidity. You eat the orders currently on the book.
* **Pros:** Instant execution.
* **Cons:** Higher fees (Taker Fees). Dangerous due to Slippage.

### 4. Slippage & Liquidity
Imagine there is only 1 BTC for sale at $60,000. The next person is selling 1 BTC at $61,000.
If you try to buy 2 BTC with a Market Order:
1. You buy the first one at $60,000.
2. You are forced to buy the second one at $61,000.
3. Your average price is $60,500.

You just moved the price up by $1,000 and paid more than you expected. This is **Slippage**.
In low-liquidity markets (meme coins), a large market order can crash or pump the price by 50% instantly. Always use Limit Orders on illiquid coins.`,
    quiz: [
      {
        question: "What happens if you place a massive Market Buy order on a coin with low liquidity?",
        options: ["You get a discount", "You cause high Slippage (pay a much higher price)", "The trade is rejected", "Nothing happens"],
        correctAnswer: 1
      },
      {
        question: "Which type of order guarantees the PRICE but not the execution?",
        options: ["Market Order", "Limit Order", "Stop Loss", "Sniper Order"],
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
    readTime: "10 min",
    difficulty: "Beginner",
    content: `### The Language of Price
In the 1700s, a Japanese rice trader named Munehisa Homma discovered that markets were not just influenced by supply and demand, but by the emotions of traders. He developed a visual method to track these emotions, which we now call Japanese Candlesticks.

Unlike a simple "Line Chart" that only shows the closing price, a Candlestick tells a complete story about what happened during a specific time period (e.g., 1 hour or 1 day).

### 1. Anatomy of a Candle
Every candle consists of two main parts: the Body and the Wicks (or Shadows).

**The Body (The Real Move):** The thick, colored part. It represents the range between the Open price and the Close price.
* **Green Candle (Bullish):** The Close was higher than the Open. Buyers won the round.
* **Red Candle (Bearish):** The Close was lower than the Open. Sellers won the round.

**The Wicks (The Extremes):** The thin lines sticking out of the top and bottom.
* **Top Wick:** The highest price reached during that time.
* **Bottom Wick:** The lowest price reached during that time.

**Why Wicks Matter:** A long wick tells you about a Rejection.
* *Example:* A long bottom wick means sellers pushed the price down, but buyers stepped in aggressively and pushed it back up before the candle closed. This is a sign of hidden buying strength.

### 2. Single Candle Patterns
Recognizing single candles can give you an immediate signal of a reversal.

**The Doji (Indecision)**
* **Look:** A cross shape. The Open and Close are almost identical, with wicks on both sides.
* **Meaning:** Buyers and Sellers fought to a draw. The market is confused. A trend reversal might be coming.

**The Hammer (Bullish Reversal)**
* **Look:** A small body at the top and a very long bottom wick (at least 2x the body size).
* **Meaning:** Sellers tried to crash the price, but failed. Buyers took control. If this appears at the bottom of a downtrend, buy.

**The Shooting Star (Bearish Reversal)**
* **Look:** The opposite of a Hammer. A small body at the bottom and a long top wick.
* **Meaning:** Buyers tried to pump the price, but failed. Sellers slammed it back down. If this appears at the top of an uptrend, sell.

### 3. Multi-Candle Patterns
* **Bullish Engulfing:** A small Red candle followed immediately by a massive Green candle that completely "swallows" the previous one. This screams that momentum has shifted violently to the upside.
* **Bearish Engulfing:** A small Green candle followed by a massive Red candle. The buyers have been crushed.`,
    quiz: [
      {
        question: "What does a 'Hammer' candle (long bottom wick) usually signal?",
        options: ["Universal downtrend", "Potential Reversal to the Upside (Bullish)", "Indecision", "Nothing"],
        correctAnswer: 1
      },
      {
        question: "What does a 'Doji' candle represent?",
        options: ["Strong buying power", "Strong selling power", "Indecision (Market is confused)", "The market is closed"],
        correctAnswer: 2
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
    readTime: "8 min",
    difficulty: "Beginner",
    content: `### The Battlefield Map
If Candlesticks are the soldiers, Support and Resistance are the terrain. Markets do not move randomly. They have "memory." Prices tend to react at specific levels where they reversed in the past.

### 1. Support (The Floor)
Support is a price level where a downtrend tends to pause due to a concentration of demand (buying interest).
* **Psychology:** "Bitcoin is too cheap at $50,000. I'll buy if it drops there."
* **The Bounce:** When price hits support, it often bounces back up.
* **The Break:** If price crashes below support, it indicates extreme weakness. The floor has collapsed.

### 2. Resistance (The Ceiling)
Resistance is a price level where an uptrend tends to pause due to a concentration of supply (selling interest).
* **Psychology:** "I'll sell my Bitcoin when it hits $70,000 to break even."
* **The Rejection:** When price hits resistance, it often drops.
* **The Breakout:** If price blasts above resistance, it is extremely bullish. The ceiling has been shattered, and the sky is the limit.

### 3. The Flip (Role Reversal)
This is the most powerful concept in structure trading: Old Resistance becomes New Support.
* **Scenario:** Bitcoin struggles to break $60,000 (Resistance). Finally, it smashes through to $65,000.
* **The Retest:** Price usually dips back down to $60,000.
* **The Flip:** Buyers who missed the breakout now wait at $60,000 to enter. The level that used to be a Ceiling acts as a new Floor. This "Retest and Bounce" is the safest entry signal in trading.

### 4. Trendlines
Horizontal lines are great, but markets often move in diagonals.
* **Uptrend Line:** Connect the "Higher Lows." As long as price stays above this rising line, the trend is healthy. If it breaks below, the trend is dead.
* **Downtrend Line:** Connect the "Lower Highs." This acts as a sliding ceiling pushing price down.`,
    quiz: [
      {
        question: "What usually happens when a Resistance level is successfully broken?",
        options: ["It disappears", "It becomes new Support", "The price crashes", "Trading stops"],
        correctAnswer: 1
      },
      {
        question: "What is the safest entry signal described?",
        options: ["Buying the breakout immediately", "Buying the 'Retest and Bounce' of previous resistance", "Buying when RSI is 90", "Buying a downtrend"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "indicators-mastery",
    categoryId: "technical",
    title: "14. Key Indicators (RSI, MACD, MA)",
    description: "Using math to confirm your bias.",
    readTime: "10 min",
    difficulty: "Intermediate",
    content: `### Using the Dashboard
Indicators are mathematical calculations applied to price and volume. They are not crystal balls; they are like the dashboard of a car. They tell you how fast you are going (Momentum) or if the engine is overheating (Overbought).

### 1. Relative Strength Index (RSI)
**Type:** Momentum Oscillator. **Range:** 0 to 100. **Purpose:** To identify if an asset is "Overbought" or "Oversold."
* **Overbought (> 70):** The price has risen too fast, too quickly. The buyers are exhausted. A correction (dip) is likely. **Signal:** Sell/Short.
* **Oversold (< 30):** The price has dumped too hard. Panic sellers are gone. A relief bounce is likely. **Signal:** Buy/Long.
* **Pro Tip (Divergence):** If Price makes a New High, but RSI makes a Lower High, the trend is losing power. A crash is imminent.

### 2. Moving Average Convergence Divergence (MACD)
**Type:** Trend-Following Momentum. **Components:** The MACD Line (Fast) and the Signal Line (Slow). **Purpose:** To spot the start of a new trend.
* **The Bullish Crossover:** When the MACD line crosses above the Signal line. Momentum has shifted to the upside. Green Histogram bars appear.
* **The Bearish Crossover:** When the MACD line crosses below the Signal line. Momentum has shifted to the downside. Red Histogram bars appear.

### 3. Moving Averages (MA)
**Type:** Trend Smoothing. **Purpose:** To filter out noise and see the true direction of the market.
* **SMA (Simple Moving Average):** The average price over X days.
* **EMA (Exponential Moving Average):** Gives more weight to recent prices. Reacts faster.
* **The Golden Cross vs. Death Cross:**
  * **Golden Cross:** When the short-term average (e.g., 50-Day MA) crosses above the long-term average (e.g., 200-Day MA). This signals the start of a massive Bull Market.
  * **Death Cross:** When the 50-Day crosses below the 200-Day. This signals a long-term Bear Market.`,
    quiz: [
      {
        question: "What is a 'Golden Cross'?",
        options: ["When price hits an all time high", "When the 50 MA crosses ABOVE the 200 MA", "When RSI hits 100", "When Bitcoin halves"],
        correctAnswer: 1
      },
      {
        question: "If RSI is above 70, the asset is considered...",
        options: ["Oversold (Cheap)", "Overbought (Expensive)", "Dead", "Trending sideways"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "risk-management",
    categoryId: "technical",
    title: "15. Risk Management (The Holy Grail)",
    description: "Position sizing and why 90% of traders fail.",
    readTime: "10 min",
    difficulty: "Advanced",
    content: `### The Only Secret
You can master every pattern and every indicator, but if you fail at Risk Management, you will go broke. Novice traders focus on how much they can win. Professional traders focus on how much they can lose.

### 1. Position Sizing (The 1% Rule)
Never risk more than 1% to 2% of your total portfolio on a single trade.
* **Scenario:** You have $10,000. You should never lose more than $100 on one bad idea.
* **Why?** If you risk 10% per trade and lose 5 times in a row (which happens!), you have lost 50% of your money. You now need a 100% gain just to break even.
* **Survival:** If you risk 1%, you can be wrong 20 times in a row and still be in the game.

### 2. Stop Loss (The Seatbelt)
A Stop Loss is an automatic order to sell if the price drops to a specific level. It is your insurance policy.
* **The Mistake:** "I'll just watch it and sell if it drops."
* **The Reality:** When it drops, you will freeze. You will hope it comes back. It will drop more. You will become a "Bag Holder."
* **The Rule:** Set your Stop Loss the moment you enter the trade. Never move it down.

### 3. Risk-to-Reward Ratio (R:R)
Never take a trade unless the potential Reward is at least 2x the potential Risk.
* **Bad Trade:** Risking $100 to make $100 (1:1 Ratio). You need to be right 55% of the time to profit.
* **Good Trade:** Risking $100 to make $300 (1:3 Ratio).
* **If you take 10 trades:**
    * You lose 7 trades (-$700).
    * You win 3 trades (+$900).
    * **Net Profit:** +$200.
* **Magic:** With a good R:R ratio, you can be wrong 70% of the time and still make money.

### 4. Leverage Kills
Leverage is borrowing money from the exchange to bet bigger.
* **10x Leverage:** If price moves up 10%, you double your money. BUT, if price drops 10%, you are **Liquidated** (you lose everything instantly).
* **The Trap:** Crypto is volatile. A 10% drop happens weekly. High leverage guarantees you will eventually hit zero. Stick to Spot trading (1x) until you are consistently profitable.`,
    quiz: [
      {
        question: "If you have a $10,000 account and follow the 1% rule, what is the maximum amount you can lose on one trade?",
        options: ["$1", "$100", "$1,000", "$500"],
        correctAnswer: 1
      },
      {
        question: "Why is a 1:3 Risk/Reward ratio better than 1:1?",
        options: ["You can be wrong more often and still make profit", "It guarantees you win the trade", "It reduces fees", "It makes the trade faster"],
        correctAnswer: 0
      }
    ],
    mission: {
      title: "Calculate Risk",
      description: "Open a trade in the Simulator with a Stop Loss set to exactly 1% of your demo balance.",
      actionLink: "/simulator"
    }
  }
];
