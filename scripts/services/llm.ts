import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export class LLMAgent {
    
    // QUANT AGENT: Technical Analysis
    async analyzeSetup(coin: string, price: number, indicators: any): Promise<any> {
        const prompt = `
        You are an elite Crypto Quant Trader. Analyze this technical data for ${coin}:
        
        Data:
        - Price: $${price}
        - Trend (EMA200): ${indicators.isUpTrend ? "BULLISH" : "BEARISH"}
        - Momentum (MACD): ${indicators.isMacdPositive ? "POSITIVE" : "NEGATIVE"}
        - RSI/Stoch: K=${indicators.k.toFixed(2)} / D=${indicators.d.toFixed(2)}
        
        Task:
        Is this a high probability BUY entry? 
        Reply STRICTLY in this JSON format:
        {
            "decision": "BUY" | "WAIT" | "SELL",
            "confidence": "HIGH" | "MED" | "LOW",
            "reasoning": "One short sentence explaining why."
        }
        `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (e: any) {
            console.error("❌ AI Error Details:", e.message || e);
            return { decision: "WAIT", confidence: "LOW", reasoning: "AI Error" };
        }
    }

    // RESEARCHER AGENT: News Analysis
    async generateBriefing(newsItems: string[]): Promise<string> {
        const prompt = `
        You are a Senior Market Analyst. Summarize these crypto headlines into a 3-bullet point briefing.
        Identify if the overall sentiment is Fear or Greed.
        
        Headlines:
        ${newsItems.join("\n")}
        `;
        
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e) {
            return "Unable to generate briefing.";
        }
    }
}
