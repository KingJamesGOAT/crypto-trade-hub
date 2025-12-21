export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // A
  { term: "51% Attack", definition: "A hypothetical situation where more than half of the computing power on a blockchain network is controlled by a single person or group, allowing them to manipulate the chain." },
  { term: "Address", definition: "A unique string of characters used to send and receive cryptocurrency. It is like a bank account number." },
  { term: "Airdrop", definition: "A marketing stunt where a project distributes free tokens to wallet addresses to create awareness and liquidity." },
  { term: "Algorithm", definition: "A set of rules or instructions given to a computer to help it calculate an answer to a problem." },
  { term: "All-Time High (ATH)", definition: "The highest price a cryptocurrency has ever reached in its history." },
  { term: "All-Time Low (ATL)", definition: "The lowest price a cryptocurrency has ever reached." },
  { term: "Altcoin", definition: "Any cryptocurrency other than Bitcoin (e.g., Ethereum, Solana, Litecoin)." },
  { term: "AML (Anti-Money Laundering)", definition: "Laws and regulations intended to prevent criminals from disguising illegally obtained funds as legitimate income." },
  { term: "API (Application Programming Interface)", definition: "A software intermediary that allows two applications to talk to each other." },
  { term: "Arbitrage", definition: "The practice of buying a digital asset on one exchange and selling it on another to profit from a price difference." },
  { term: "ASIC", definition: "Application-Specific Integrated Circuit. A piece of hardware designed essentially for mining a specific cryptocurrency." },
  { term: "Ask Price", definition: "The minimum price that a seller is willing to accept for an asset." },
  { term: "Asset", definition: "A resource with economic value that an individual, corporation, or country owns or controls with the expectation that it will provide a future benefit." },
  { term: "Atomic Swap", definition: "A technology that allows the direct exchange of two different cryptocurrencies on different blockchains without an intermediary." },
  { term: "Audit", definition: "An examination of the code and security of a blockchain project, usually performed by a specialized third-party firm." },

  // B
  { term: "Bag Holder", definition: "An investor who holds onto a cryptocurrency that has dropped significantly in value, often to the point of being worthless." },
  { term: "Bear Market", definition: "A market condition where prices are falling or are expected to fall, encouraging selling." },
  { term: "Bear Trap", definition: "A false signal that the rising trend of an asset is reversing and heading downward, prompting investors to sell, only for the price to recover." },
  { term: "Benchmark", definition: "A standard or point of reference against which things may be compared or assessed." },
  { term: "BEP-20", definition: "A token standard on the Binance Smart Chain (BSC) that extends ERC-20, the most common Ethereum token standard." },
  { term: "Beta", definition: "A measure of the volatility, or systematic risk, of a security or a portfolio in comparison to the market as a whole." },
  { term: "Bid Price", definition: "The highest price a buyer is willing to pay for an asset." },
  { term: "Bitcoin (BTC)", definition: "The first decentralized cryptocurrency, created by Satoshi Nakamoto in 2009." },
  { term: "Bitcoin Halving", definition: "An event that halves the rate at which new Bitcoins are created, occurring roughly every four years." },
  { term: "Block", definition: "A file containing information on transactions completed during a given time period. Blocks are chained together to form a blockchain." },
  { term: "Block Explorer", definition: "An online tool to view all transactions, past and current, on the blockchain." },
  { term: "Block Height", definition: "The number of blocks preceding a specific block on a blockchain, representing its position in the chain." },
  { term: "Block Reward", definition: "The payment awarded to a miner or validator for successfully validating a new block." },
  { term: "Blockchain", definition: "A distributed ledger technology where data is stored in blocks that are linked together in substantial chronological order." },
  { term: "Bollinger Bands", definition: "A technical analysis tool defined by a set of trendlines plotted two standard deviations (positively and negatively) away from a simple moving average (SMA)." },
  { term: "Bot", definition: "Automated software that can perform tasks such as trading cryptocurrencies at speeds impossible for humans." },
  { term: "Bridge", definition: "A connection that allows the transfer of tokens or data between two different, otherwise incompatible blockchain networks." },
  { term: "Bubble", definition: "An economic cycle characterized by the rapid escalation of asset prices followed by a contraction." },
  { term: "Bull Market", definition: "A market condition where prices are rising or are expected to rise, encouraging buying." },
  { term: "Bull Trap", definition: "A false signal that a declining trend in a stock or index has reversed and is heading upwards." },
  { term: "Burn", definition: "The process of permanently removing tokens from circulation to reduce supply and potentially increase value." },
  { term: "Buy Wall", definition: "A huge buy order or cluster of buy orders at a specific price level that prevents the price from falling lower." },

  // C
  { term: "Candlestick", definition: "A type of price chart used in technical analysis that displays the high, low, open, and closing prices of a security for a specific period." },
  { term: "Capital", definition: "Financial assets or the financial value of assets, such as cash." },
  { term: "Capitulation", definition: "When investors give up any previous gains in any security or market by selling their positions during a declining period to get out of the market." },
  { term: "CeFi (Centralized Finance)", definition: "Financial services specifically for crypto assets that operate through a centralized intermediary or exchange." },
  { term: "Central Bank Digital Currency (CBDC)", definition: "A digital currency issued by a central bank, unlike cryptocurrencies which are decentralized." },
  { term: "Circulating Supply", definition: "The best approximation of the number of coins that are circulating in the market and in the general public's hands." },
  { term: "Cold Storage", definition: "Storing cryptocurrency offline, such as in a hardware wallet or paper wallet, to protect it from hacking." },
  { term: "Collateral", definition: "An asset that a borrower offers a lender to secure a loan." },
  { term: "Confirmation", definition: "A measure of how many blocks have passed since a transaction was added to the blockchain." },
  { term: "Consensus Mechanism", definition: "The process used to achieve agreement on a single data value among distributed processes or systems (e.g., PoW, PoS)." },
  { term: "Correction", definition: "A decline of 10% or greater in the price of a security, asset, or financial market." },
  { term: "CPU Mining", definition: "The process of mining cryptocurrency using a Central Processing Unit (CPU)." },
  { term: "Cross-Chain", definition: "Technology that improves the interconnection between blockchain networks by allowing the exchange of information and value." },
  { term: "Crypto Winter", definition: "A prolonged period of low asset prices in the cryptocurrency market." },
  { term: "Custodial Wallet", definition: "A wallet where private keys are held by a third party, such as an exchange." },

  // D
  { term: "DAO (Decentralized Autonomous Organization)", definition: "An organization represented by rules encoded as a computer program that is transparent, controlled by the organization members and not influenced by a central government." },
  { term: "DApp (Decentralized Application)", definition: "A digital application or program that runs on a blockchain or P2P network of computers instead of a single computer." },
  { term: "Dead Cat Bounce", definition: "A temporary recovery in share prices after a substantial fall, caused by speculators buying in order to cover their positions." },
  { term: "DeFi (Decentralized Finance)", definition: "Financial services accessible to anyone with an internet connection, built on public blockchains like Ethereum." },
  { term: "Deflationary", definition: "A decrease in the general price level of goods and services; in crypto, it often refers to a token model where the supply decreases over time." },
  { term: "DEX (Decentralized Exchange)", definition: "A peer-to-peer marketplace where transactions occur directly between crypto traders without a central intermediary." },
  { term: "Diamond Hands", definition: "Slang for an investor who holds onto an investment despite risks, drops, and volatility." },
  { term: "Difficulty", definition: "A measure of how difficult it is to find a hash below a given target, determining the complexity of mining." },
  { term: "Digital Signature", definition: "A mathematical scheme for demonstrating the authenticity of digital messages or documents." },
  { term: "Dip", definition: "A brief decline in an asset's price, often seen as a buying opportunity ('Buy the Dip')." },
  { term: "Distributed Ledger", definition: "A database that is consensually shared and synchronized across multiple sites, institutions, or geographies." },
  { term: "Diversification", definition: "A risk management strategy that mixes a wide variety of investments within a portfolio." },
  { term: "Dominance", definition: "A measure of Bitcoin's market capitalization relative to the total market capitalization of all cryptocurrencies." },
  { term: "Double Spend", definition: "The risk that a digital currency can be spent twice." },
  { term: "Dump", definition: "A sudden sell-off of digital assets." },
  { term: "Dust", definition: "A trace amount of cryptocurrency that is smaller than the minimum transaction fee, making it unspendable." },
  { term: "DYOR", definition: "Do Your Own Research. A common disclaimer in the crypto community." },

  // E
  { term: "Encryption", definition: "The method by which information is converted into secret code that hides the information's true meaning." },
  { term: "Enterprise Blockchain", definition: "Permissioned blockchains designed for enterprise use cases where privacy and control are paramount." },
  { term: "ERC-20", definition: "The technical standard for fungible tokens created using the Ethereum blockchain." },
  { term: "ERC-721", definition: "The technical standard for non-fungible tokens (NFTs) on the Ethereum blockchain." },
  { term: "Escrow", definition: "A financial arrangement where a third party holds and regulates payment of the funds required for two parties involved in a given transaction." },
  { term: "Ethereum (ETH)", definition: "A decentralized, open-source blockchain with smart contract functionality." },
  { term: "ETF (Exchange-Traded Fund)", definition: "An investment fund usually designed to track the performance of a specific index or asset class." },
  { term: "Exchange", definition: "A marketplace where cryptocurrencies can be bought, sold, or traded." },

  // F
  { term: "Faucet", definition: "A website or app that distributes small amounts of crypto as a reward for completing easy tasks." },
  { term: "Fiat", definition: "Government-issued currency that is not backed by a physical commodity, such as gold or silver (e.g., USD, EUR)." },
  { term: "FOMO", definition: "Fear Of Missing Out. The anxiety that an exciting or interesting event may currently be happening elsewhere, often synonymous with buying an asset just because the price is rising." },
  { term: "Fork", definition: "A change in the protocol of a blockchain that can result in two paths: soft forks (backward compatible) and hard forks (non-backward compatible)." },
  { term: "FUD", definition: "Fear, Uncertainty, and Doubt. A strategy to influence perception by disseminating negative and dubious or false information." },
  { term: "Full Node", definition: "A computer that fully validates transactions and blocks on a blockchain." },
  { term: "Fundamental Analysis", definition: "A method of evaluating a security in an attempt to measure its intrinsic value, by examining related economic, financial, and other qualitative and quantitative factors." },
  { term: "Futures", definition: "A legal agreement to buy or sell a particular commodity or asset at a predetermined price at a specified time in the future." },

  // G
  { term: "Gas", definition: "The fee required to successfully conduct a transaction or execute a contract on the Ethereum blockchain platform." },
  { term: "Gas Limit", definition: "The maximum amount of gas that the user is willing to spend on a particular transaction." },
  { term: "Genesis Block", definition: "The very first block of a blockchain." },
  { term: "Golden Cross", definition: "A candlestick pattern that is a bullish signal in which a relatively short-term moving average crosses above a long-term moving average." },
  { term: "Governance Token", definition: "A token that gives its holder the right to vote on the development and direction of a blockchain project." },
  { term: "Gwei", definition: "A denomination of Ether used to measure gas prices. 1 ETH = 1,000,000,000 Gwei." },

  // H
  { term: "Halving", definition: "See Bitcoin Halving." },
  { term: "Hard Cap", definition: "The absolute maximum amount of money a project intends to raise during an ICO." },
  { term: "Hard Fork", definition: "A radical change to a network's protocol that makes previously valid blocks and transactions invalid, or vice-versa." },
  { term: "Hardware Wallet", definition: "A physical device that securely stores a user's private keys offline." },
  { term: "Hash", definition: "A function that converts an input of letters and numbers into an encrypted output of a fixed length." },
  { term: "Hash Rate", definition: "The measure of a miner's performance (speed) in solving the cryptographic puzzles." },
  { term: "HODL", definition: "A typo of 'hold' that became a backronym for 'Hold On for Dear Life'. It refers to a passive investment strategy were you bold not sell." },
  { term: "Hot Wallet", definition: "A cryptocurrency wallet that is connected to the internet." },

  // I
  { term: "ICO (Initial Coin Offering)", definition: "A type of funding using cryptocurrencies. Mostly usually a way for a projects to raise capital." },
  { term: "Immutability", definition: "The ability of a blockchain ledger to remain unchanged, for an unaltered history of transactions." },
  { term: "Inflation", definition: "The rate at which the value of a currency is falling and, consequently, the general level of prices for goods and services is rising." },
  { term: "Interoperability", definition: "The ability of different blockchain systems to exchange information and work together." },
  { term: "IPFS (InterPlanetary File System)", definition: "A protocol and peer-to-peer network for storing and sharing data in a distributed file system." },

  // K
  { term: "Key Logger", definition: "Spyware that records every keystroke made on a computer, often used to steal passwords and private keys." },
  { term: "KYC (Know Your Customer)", definition: "The process of a business verifying the identity of its clients." },

  // L
  { term: "Layer 1", definition: "The underlying main blockchain architecture (e.g., Bitcoin, Ethereum)." },
  { term: "Layer 2", definition: "A secondary framework or protocol that is built on top of an existing blockchain system (e.g., Lightning Network, Polygon)." },
  { term: "Ledger", definition: "A record-keeping system that tracks financial transactions." },
  { term: "Leverage", definition: "The use of borrowed capital to increase the potential return of an investment." },
  { term: "Lightning Network", definition: "A second-layer protocol that operates on top of a blockchain (usually Bitcoin) to enable instant transactions with lower fees." },
  { term: "Limit Order", definition: "An order to buy or sell a stock at a specific price or better." },
  { term: "Liquidity", definition: "The ease with which an asset can be converted into ready cash without affecting its market price." },
  { term: "Liquidity Pool", definition: "A crowdsourced pool of cryptocurrencies or tokens locked in a smart contract that is used to facilitate trades between the assets on a decentralized exchange." },
  { term: "Litecoin (LTC)", definition: "A peer-to-peer cryptocurrency and open-source software project released under the MIT/X11 license." },
  { term: "Long", definition: "A trading position where the trader buys an asset expecting its price to rise." },

  // M
  { term: "Mainnet", definition: "The fully operational and independent blockchain network where actual transactions take place." },
  { term: "Market Cap", definition: "The total market value of a cryptocurrency's circulating supply." },
  { term: "Market Order", definition: "An order to buy or sell a security immediately at the best available current price." },
  { term: "Margin Trading", definition: "A method of trading assets using funds provided by a third party." },
  { term: "Mempool", definition: "A holding area for transactions waiting to be confirmed by a blockchain network." },
  { term: "Metaverse", definition: "A virtual reality space in which users can interact with a computer-generated environment and other users." },
  { term: "Miner", definition: "A participant in a blockchain network who uses computing power to validate transactions and create new blocks." },
  { term: "Mining", definition: "The process by which new cryptocurrency coins are entered into circulation and new transactions are confirmed by the network." },
  { term: "Mining Pool", definition: "The pooling of resources by miners, who share their processing power over a network, to split the reward equally, according to the amount of work they contributed." },
  { term: "Minting", definition: "The process of generating new coins or tokens." },
  { term: "Moon", definition: "A situation where there is a continuous upward movement in the price of a cryptocurrency." },
  { term: "Moving Average (MA)", definition: "A widely used indicator in technical analysis that helps smooth out price action by filtering out the 'noise' from random short-term price fluctuations." },
  { term: "Multi-Signature (Multi-Sig)", definition: "A digital signature scheme that requires more than one private key to authorize a transaction." },

  // N
  { term: "NFT (Non-Fungible Token)", definition: "A type of cryptographic token that represents a unique asset." },
  { term: "Node", definition: "A computer that connects to a blockchain network." },
  { term: "Nonce", definition: "An abbreviation for 'number only used once,' which is a number added to a hashed or encrypted block in a blockchain." },

  // O
  { term: "Off-Chain", definition: "Transactions that occur outside of a given blockchain." },
  { term: "On-Chain", definition: "Transactions that are recorded on the blockchain itself and shared with all participants." },
  { term: "Open Source", definition: "Software for which the original source code is made freely available and may be redistributed and modified." },
  { term: "Oracle", definition: "A third-party service that connects smart contracts with the outside world, primarily to feed information from the world to the smart contract." },
  { term: "Order Book", definition: "An electronic list of buy and sell orders for a specific security or financial instrument organized by price level." },
  { term: "OTC (Over-The-Counter)", definition: "Trading that is done directly between two parties without the supervision of an exchange." },

  // P
  { term: "P2P (Peer-to-Peer)", definition: "A distributed application architecture that partitions tasks or workloads between peers." },
  { term: "Paper Wallet", definition: "A physical piece of paper that contains the public and private keys needed to access cryptocurrency." },
  { term: "Phishing", definition: "A cybercrime in which a target or targets are contacted by email, telephone or text message by someone posing as a legitimate institution to lure individuals into providing sensitive data." },
  { term: "Platform", definition: "A group of technologies that are used as a base upon which other applications, processes or technologies are developed." },
  { term: "Ponzi Scheme", definition: "A fraudulent investing scam promising high rates of return with little risk to investors." },
  { term: "Portfolio", definition: "A collection of financial investments like stocks, bonds, commodities, cash, and cash equivalents." },
  { term: "Pre-Sale", definition: "A sale of tokens held before the public ICO." },
  { term: "Private Key", definition: "A sophisticated form of cryptography that allows a user to access his or her cryptocurrency." },
  { term: "Proof of Stake (PoS)", definition: "A consensus mechanism that selects validators in proportion to their quantity of holdings in the associated cryptocurrency." },
  { term: "Proof of Work (PoW)", definition: "A consensus mechanism that requires members of a network to expend effort solving an arbitrary mathematical puzzle to prevent anybody from gaming the system." },
  { term: "Protocol", definition: "A set of rules for data exchange." },
  { term: "Public Key", definition: "A cryptographic code that allows a user to receive cryptocurrencies into his or her account." },
  { term: "Pump and Dump", definition: "A scheme that attempts to boost the price of a stock or security through fake recommendations." },

  // R
  { term: "Ransomware", definition: "Malware which is used to deny access to a computer system or data until a ransom is paid." },
  { term: "Recovery Phrase", definition: "A list of words that store all the information needed to recover a cryptocurrency wallet." },
  { term: "Regulation", definition: "Rules or directives made and maintained by an authority." },
  { term: "Resistance", definition: "A price level where a rising asset faces selling pressure, preventing it from rising further." },
  { term: "Return on Investment (ROI)", definition: "A performance measure used to evaluate the efficiency of an investment." },
  { term: "Roadmap", definition: "A visual summary that maps out the vision and direction of a product offering over time." },
  { term: "Rug Pull", definition: "A malicious maneuver in the crypto industry where crypto developers abandon a project and run away with investors' funds." },

  // S
  { term: "Satoshi", definition: "The smallest unit of Bitcoin. 1 Satoshi = 0.00000001 BTC." },
  { term: "Satoshi Nakamoto", definition: "The pseudonym used by the unknown person or persons who developed Bitcoin." },
  { term: "Scalability", definition: "The property of a system to handle a growing amount of work by adding resources to the system." },
  { term: "Scam", definition: "A deceptive scheme or trick used to cheat someone out of something, especially money." },
  { term: "SEC", definition: "The U.S. Securities and Exchange Commission, a government agency that oversees securities transactions." },
  { term: "Seed Phrase", definition: "See Recovery Phrase." },
  { term: "SegWit (Segregated Witness)", definition: "An implemented process update that changed the way data is stored on the Bitcoin blockchain." },
  { term: "Sharding", definition: "A database partitioning technique used by blockchain companies with the goal of increasing scalability." },
  { term: "Shitcoin", definition: "A pejorative term used to describe a cryptocurrency that has little to no value or no immediate, discernible purpose." },
  { term: "Short", definition: "A trading strategy where an investor sells an asset with the intention of buying it back later at a lower price." },
  { term: "Sidechain", definition: "A separate blockchain that is attached to its parent blockchain using a two-way peg." },
  { term: "Slippage", definition: "The difference between the expected price of a trade and the price at which the trade is executed." },
  { term: "Smart Contract", definition: "A self-executing contract with the terms of the agreement between buyer and seller being directly written into lines of code." },
  { term: "Soft Cap", definition: "The minimum amount of capital that a project ostensibly needs to proceed." },
  { term: "Soft Fork", definition: "A change to the software protocol where only previously valid transaction blocks are made invalid." },
  { term: "Solana", definition: "A high-performance blockchain supporting builders around the world creating crypto apps that scale today." },
  { term: "Stablecoin", definition: "A cryptocurrency designed to minimize the volatility of the price of the stablecoin, usually pegged to a fiat currency." },
  { term: "Staking", definition: "The process of participating in a proof-of-stake (PoS) system to validate transactions and earn rewards." },
  { term: "Stop-Loss Order", definition: "An order placed with a broker to buy or sell a specific stock once the stock reaches a certain price." },
  { term: "Support", definition: "A price level where a falling asset finds buying pressure, preventing it from falling further." },

  // T
  { term: "Technical Analysis", definition: "A trading discipline employed to evaluate investments and identify trading opportunities in price trends and patterns seen on charts." },
  { term: "Testnet", definition: "An alternative blockchain used for testing. Testnet coins are distinct and valid only on the testnet." },
  { term: "Ticker", definition: "A symbol or abbreviation used to uniquely identify publicly traded shares of a particular stock or cryptocurrency." },
  { term: "Token", definition: "A unit of value that exists on a blockchain." },
  { term: "Tokenomics", definition: "The study of the economic institutions, policies, and ethics of the production, distribution, and consumption of goods and services." },
  { term: "Total Supply", definition: "The total amount of coins or tokens that exist right now, minus any coins that have been verifiably burned." },
  { term: "TPS (Transactions Per Second)", definition: "A measure of the speed of a blockchain network." },
  { term: "Trading Pair", definition: "Two different assets that are traded for each other on an exchange (e.g., BTC/USD)." },
  { term: "Transaction Fee", definition: "The amount of cryptocurrency that must be paid to execute a transaction on the blockchain." },
  { term: "Trustless", definition: "A quality of the blockchain system that allows transactions to be verified without the need for a third party." },

  // U
  { term: "Utility Token", definition: "A token that provides users with access to a product or service." },

  // V
  { term: "Validator", definition: "A participant on a Proof-of-Stake (PoS) blockchain who is responsible for verifying transactions." },
  { term: "Volatility", definition: "A statistical measure of the dispersion of returns for a given security or market index." },
  { term: "Volume", definition: "The amount of an asset or security that changes hands over some period of time, often expressed in terms of the number of shares or contracts." },

  // W
  { term: "Wallet", definition: "A software program or physical device that stores public and private keys and interacts with various blockchain." },
  { term: "Web3", definition: "An idea for a new iteration of the World Wide Web based on blockchain technology." },
  { term: "Whale", definition: "A term used to describe individuals or entities that hold large amounts of cryptocurrency." },
  { term: "White Paper", definition: "A document released by a crypto project that gives technical details of its concept and roadmap." },
  { term: "Whitelist", definition: "A list of approved participants for an event, such as an ICO or NFT mint." },

  // Y
  { term: "Yield Farming", definition: "An investment strategy in DeFi that involves lending or staking cryptocurrency tokens to generate high returns or rewards in the form of additional cryptocurrency." },

  // Z
  { term: "Zero-Knowledge Proof", definition: "A method by which one party (the prover) can prove to another party (the verifier) that they know a value x, without conveying any information apart from the fact that they know the value x." }
];
