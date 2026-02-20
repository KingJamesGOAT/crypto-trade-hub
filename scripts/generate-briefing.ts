
import { createClient } from '@supabase/supabase-js';
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

    await discord.sendAlert("Agent Waking Up", [{ name: "Status", value: "Scanning markets" }], 0x00ff00);

    const marketData = await fetchMarketContext();
    
    // Use gemini-1.5-flash for better free tier limits and speed
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
        const result = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            }
        );
        const text = result.data.candidates[0].content.parts[0].text;

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
        const safeText = text.length > 1000 ? text.substring(0, 1000) + '...' : text;
        await discord.sendBriefing(safeText);
        console.log("✅ Sent to Discord.");
    } catch (e) {
        console.error("❌ AI Generation Error:", e);
    }
}

generateBriefing();
