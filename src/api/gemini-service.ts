// src/api/gemini-service.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export class GeminiService {
  private apiKey: string | null = null;
  private model: any = null; // Typing as any to avoid complex SDK types in this demo file

  constructor() {
    this.apiKey = localStorage.getItem("gemini_api_key");
    if (this.apiKey) {
      this.initializeModel(this.apiKey);
    }
  }

  initializeModel(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem("gemini_api_key", apiKey);
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    } catch (e) {
        console.error("Failed to init Gemini", e)
    }
  }

  clearKey() {
    this.apiKey = null;
    this.model = null;
    localStorage.removeItem("gemini_api_key");
  }

  getKey() {
      return this.apiKey;
  }

  async sendMessage(
    history: ChatMessage[],
    newMessage: string,
    contextSummary: string
  ): Promise<string> {
    // 1. Mock Mode Check
    if (!this.apiKey || !this.model) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return this.getMockResponse(newMessage, contextSummary);
    }

    // 2. Real API Call
    try {
        // Construct prompt with context
        const systemInstruction = `
You are a helpful crypto trading assistant for the "CryptoTradeHub" platform.
Here is the user's current portfolio context:
${contextSummary}

Rules:
- Be concise and helpful.
- If the user asks about their portfolio, refer to the data above.
- If the user asks about market strategies, give general advice (DCA, Grid, etc).
- Do not give financial advice.
        `;

        // Simplified chat history for the API
        // For gemini-pro, we can pass history or just single turn with context.
        // We'll stick to single turn for simplicity or construct a chat session if needed.
        // Let's use the chat session.
        
        const chat = this.model.startChat({
            history: history.map(h => ({
                role: h.role === "user" ? "user" : "model",
                parts: [{ text: h.content }]
            })),
            generationConfig: {
                maxOutputTokens: 250,
            },
        });

        const result = await chat.sendMessage(systemInstruction + "\n\nUser Question: " + newMessage);
        const response = await result.response;
        return response.text();

    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble connecting to Gemini right now. Please check your API key.";
    }
  }

  private getMockResponse(message: string, context: string): string {
      const msg = message.toLowerCase();
      if (msg.includes("portfolio") || msg.includes("balance") || msg.includes("money")) {
          return `Based on your portfolio data, you are currently holding valid positions. (Note: Add your Gemini Key in Settings to get real AI analysis of: ${context.substring(0, 50)}...)`;
      }
      if (msg.includes("bitcoin") || msg.includes("btc")) {
          return "Bitcoin is the leading cryptocurrency. In your simulator, you can practice trading it without risk. (Mock Response)";
      }
      return "I am a simulated AI assistant. To enable my full capabilities, please add a valid Gemini API Key in the Settings page.";
  }
}

export const geminiService = new GeminiService();
