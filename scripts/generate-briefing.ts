
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
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
    
    You must return a raw JSON object (NO markdown wrapping like \`\`\`json) with the following strictly named keys:
    
    1. "ui_sentiment_score": A float between -1.0 (Extreme Bear) and 1.0 (Extreme Bull).
    2. "ui_summary": A single punchy, 1-sentence headline for the dashboard UI (max 100 chars).
    3. "ui_narratives": An array of exactly 3 string tags representing the current meta (e.g. ["Altseason", "L2 Scaling", "DeFi 2.0"]).
    4. "discord_report": A fully formatted Markdown string designed for a Discord webhook or long-form email. 
    
    RULES FOR 'discord_report':
    - Start with a bold **Daily Strategist Brief** header.
    - Write exactly 5 to 6 lines of dense, institutional text summarizing the market flow, the news, and what to look out for over the next few days. Do not write short 1-line blurbs. Give a real analysis paragraph.
    - End the report with the 3 ui_narratives formatted as hashtags on separate lines.
    - Do not use emojis in the main paragraph. Use a serious, Bloomberg-terminal tone.
    `;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    ui_sentiment_score: { type: SchemaType.NUMBER, description: "Between -1.0 and 1.0" },
                    ui_summary: { type: SchemaType.STRING, description: "1 sentence UI headline" },
                    ui_narratives: { 
                        type: SchemaType.ARRAY, 
                        items: { type: SchemaType.STRING },
                        description: "Exactly 3 tags"
                    },
                    discord_report: { type: SchemaType.STRING, description: "Full markdown report" }
                },
                required: ["ui_sentiment_score", "ui_summary", "ui_narratives", "discord_report"]
            }
        }
    });

    try {
        const result = await model.generateContent(prompt);
        let rawText = result.response.text();
        
        // Strip markdown code blocks if the model wrapped the JSON
        if (rawText.startsWith('```json')) {
            rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (rawText.startsWith('```')) {
            rawText = rawText.replace(/```\n?/g, '').trim();
        }
        
        const parsed = JSON.parse(rawText);

        console.log("✅ Briefing Generated.");

        // Save to Database (Map the JSON to the UI table columns)
        await supabase.from('market_briefings').insert({
            title: `MARKET UPDATE`,
            summary: parsed.ui_summary,
            content: parsed.discord_report, // Save full report in case we want to show it later
            sentiment_score: parsed.ui_sentiment_score,
            key_narratives: parsed.ui_narratives,
            created_at: new Date().toISOString()
        });
        
        console.log("💾 Saved to DB.");

        // Send to Discord
        console.log("📨 Sending to Discord...");
        
        // Add footer to the Discord report
        const finalDiscordMessage = `${parsed.discord_report}\n\n*Generated by Gemini 1.5 Pro • ${new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/Zurich' })} (Zurich)*`;
        
        await discord.sendBriefing(finalDiscordMessage);
        console.log("✅ Sent to Discord.");
    } catch (e: any) {
        console.error("❌ AI Generation Error:", e.message || e);
        process.exit(1); // Force GitHub Action to fail so the user sees it
    }
}

generateBriefing();
