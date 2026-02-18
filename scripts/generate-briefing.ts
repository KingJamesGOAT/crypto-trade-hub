
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { DiscordAgent } from './services/discord';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
    console.error("❌ MISSING KEYS: Supabase or Gemini API Key missing.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const discord = new DiscordAgent();

async function fetchMarketContext() {
    // 1. Fetch Generic Global Macro (Mocked/RSS or real API if avail, using wide context)
    // For this implementation, we will fetch generic data from public crypto endpoints + static macro knowns
    
    try {
        const [global, trending] = await Promise.all([
            axios.get("https://api.coingecko.com/api/v3/global"),
            axios.get("https://api.coingecko.com/api/v3/search/trending")
        ]);
        
        const btcDominance = global.data.data.market_cap_percentage.btc;
        const totalVol = global.data.data.total_volume.usd;
        const trendList = trending.data.coins.map((c: any) => c.item.name).join(", ");
        
        return `
        Market Data:
        - BTC Dominance: ${btcDominance.toFixed(2)}%
        - Global Volume: $${(totalVol / 1e9).toFixed(2)} Billion
        - Trending Coins: ${trendList}
        - Date: ${new Date().toISOString()}
        `;
    } catch (e) {
        console.error("Error fetching market data", e);
        return "Market Data unavailable.";
    }
}

async function generateBriefing() {
    console.log("🤖 BRIEFING AGENT: Starting Daily Digest...");

    const marketData = await fetchMarketContext();
    
    // Use gemini-1.5-flash for better free tier limits and speed
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    You are a Senior Global Macro Strategist for a hedge fund. 
    Write a concise but professional "4-Hour Market Update" for the crypto traders.
    
    Context:
    ${marketData}
    
    Style: 
    - Bloomberg Terminal style. 
    - No Emojis. 
    - Short paragraphs.
    - Bullet points for "Key Catalysts".
    - Tone: Serious, Institutional, Direct.
    
    Structure:
    1. HEADLINE (Uppercase)
    2. MACRO VIEW (2 sentences)
    3. CRYPTO FLOWS (Based on the trending coins)
    4. RISKS (Speculate on current general risks like Inflation, Regulation, or Hype)
    
    Output strictly in Markdown.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Briefing Generated.");
        console.log(text);

        // Save to Database
        await supabase.from('market_briefings').insert({
            title: `MARKET UPDATE ${new Date().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}`,
            content: text,
            created_at: new Date().toISOString()
        });
        
        console.log("💾 Saved to DB.");

        // Send to Discord
        console.log("📨 Sending to Discord...");
        await discord.sendBriefing(text);
        console.log("✅ Sent to Discord.");
    } catch (e) {
        console.error("❌ AI Generation Error:", e);
    }
}

generateBriefing();
