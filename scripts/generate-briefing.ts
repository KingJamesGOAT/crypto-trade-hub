
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { DiscordAgent } from './services/discord';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GROQ_API_KEY) {
    console.error("❌ MISSING KEYS: Supabase or Groq API Key missing.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const discord = new DiscordAgent();

async function fetchMarketContext() {
    let newsContext = "No recent news available.";
    
    try {
        const response = await axios.get("https://min-api.cryptocompare.com/data/v2/news/?lang=EN");
        const data = response.data;
        
        if (data.Message === "News list successfully returned" && data.Data && data.Data.length > 0) {
            const headlines = data.Data.slice(0, 5).map((a: any) => `- ${a.title}`).join('\n');
            newsContext = `Top Recent Headlines:\n${headlines}`;
        }
    } catch (e) {
        console.error("News fetch failed", e);
    }

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
        
        ${newsContext}
        `;
    } catch (e) {
        return `Market Data unavailable.\n\n${newsContext}`;
    }
}

async function generateBriefing() {
    console.log("🤖 BRIEFING AGENT: Starting Daily Digest...");

    const marketData = await fetchMarketContext();
    
    const prompt = `
    You are a Senior Global Macro Strategist for a crypto hedge fund. 
    Analyze the provided Market Data and News Headlines.
    
    Context:
    ${marketData}
    
    CRITICAL: You must return ONLY a raw JSON object. Do NOT wrap the JSON in markdown code blocks like \`\`\`json. Just start with { and end with }.
    
    The JSON must contain the following strictly named keys:
    
    1. "ui_sentiment_score": A float between -1.0 (Extreme Bear) and 1.0 (Extreme Bull).
    2. "ui_summary": A single punchy, 1-sentence headline for the dashboard UI (max 100 chars).
    3. "ui_narratives": An array of exactly 3 string tags representing the current meta (e.g. ["Altseason", "L2 Scaling", "DeFi 2.0"]).
    4. "discord_report": A fully formatted Markdown string designed for a Discord webhook or long-form email. 
    
    RULES FOR 'discord_report':
    - Do NOT start with a title or header. Just start directly with the analysis.
    - Write exactly 5 to 6 lines of dense, institutional text summarizing the market flow, the news, and what to look out for over the next few days. 
    - Include the most important news of the day.
    - End the report with the 3 ui_narratives formatted as hashtags on separate lines.
    - ABSOLUTELY NO EMOJIS in the text. Use a serious, Bloomberg-terminal tone.
    `;

    try {
        const result = await axios.post(
            `https://api.groq.com/openai/v1/chat/completions`,
            {
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.4,
                response_format: { type: "json_object" }
            },
            { 
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                } 
            }
        );
        
        let rawText = result.data.choices[0].message.content;
        
        // Strip markdown code blocks if the model wrapped the JSON
        if (rawText.startsWith('```json')) {
            rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (rawText.startsWith('```')) {
            rawText = rawText.replace(/```\n?/g, '').trim();
        }
        
        const parsed = JSON.parse(rawText);

        console.log("✅ Briefing Generated.");

        // Save to Database (Map the JSON to the UI table columns)
        const { error: dbError } = await supabase.from('market_briefings').insert({
            title: `MARKET UPDATE`,
            summary: parsed.ui_summary,
            content: parsed.discord_report, // Save full report in case we want to show it later
            sentiment_score: parsed.ui_sentiment_score,
            key_narratives: parsed.ui_narratives,
            created_at: new Date().toISOString()
        });
        
        if (dbError) {
            throw new Error(`Supabase Insert Failed: ${dbError.message}`);
        }
        
        console.log("💾 Saved to DB.");

        // Send to Discord
        console.log("📨 Sending to Discord...");
        
        // Add footer to the Discord report
        const finalDiscordMessage = `${parsed.discord_report}\n\n*Generated by Groq Llama 3 • ${new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/Zurich' })} (Zurich)*`;
        
        await discord.sendBriefing(finalDiscordMessage);
        console.log("✅ Sent to Discord.");
    } catch (e: any) {
        // Deep error logging
        if (e.response && e.response.data) {
            console.error("❌ AI Generation Error Response:", JSON.stringify(e.response.data, null, 2));
        } else {
            console.error("❌ AI Generation Error:", e.message || e);
        }
        process.exit(1); // Force GitHub Action to fail so the user sees it
    }
}

generateBriefing();
