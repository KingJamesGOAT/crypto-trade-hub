declare const puter: any;

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

// 1. THE BRAIN: Context about YOUR website
const SYSTEM_PROMPT = `
You are the expert AI Trading Mentor for 'CryptoTradeHub', a professional paper-trading simulator.
Your knowledge base:
- **Simulator Logic:** We use a 'Strategy Engine'. 
  - 'Momentum Mode' (Scalping) activates when ADX > 25 (Trending). It buys breakouts of the 20-candle High.
  - 'Grid Mode' (Reversal) activates when ADX < 25 (Ranging). It buys RSI < 30 dips using 3 layered limit orders.
- **Risk Management:** We use the Kelly Criterion for position sizing and 0.1% simulated fees.
- **Tools:** We have a Backtester (Time Machine), Learning Modules, and Live News Sentiment analysis.

Rules:
- Keep answers concise and trader-focused.
- If asked about the bot, explain the logic above.
- Do not hallucinate features we don't have.
`;

class PuterAIService {
  
  // 2. THE FIX: Wait for the script to load on GitHub Pages
  private async waitForPuter(retries = 10): Promise<boolean> {
    if (typeof puter !== 'undefined') return true;
    if (retries <= 0) return false;
    
    // Wait 500ms and try again
    await new Promise(r => setTimeout(r, 500));
    return this.waitForPuter(retries - 1);
  }

  async isSignedIn(): Promise<boolean> {
    const loaded = await this.waitForPuter();
    if (!loaded) return false;
    return puter.auth.isSignedIn();
  }

  async getUsername(): Promise<string | null> {
    if (!await this.isSignedIn()) return null;
    const user = await puter.auth.getUser();
    return user.username;
  }

  async signIn(): Promise<boolean> {
    if (typeof puter === 'undefined') {
        alert("System Error: Puter.js script is missing from index.html");
        return false;
    }
    await puter.auth.signIn();
    return this.isSignedIn();
  }

  async chat(userMessage: string): Promise<string> {
    try {
      const loaded = await this.waitForPuter();
      if (!loaded) {
        return "System Error: AI Service failed to load. Please refresh the page.";
      }

      // 3. Combine System Prompt + User Message
      const fullContext = `${SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`;

      // Try the fast model first
      try {
          const response = await puter.ai.chat(fullContext, { model: 'gpt-4o-mini' });
          return this.formatResponse(response);
      } catch (err) {
          console.warn("GPT-4o-mini busy, switching to backup...", err);
          const fallback = await puter.ai.chat(fullContext);
          return this.formatResponse(fallback);
      }

    } catch (error: any) {
      console.error('[AI Error]', error);
      return `Connection Error: ${error.message || "Please check your internet"}.`;
    }
  }

  private formatResponse(response: any): string {
      const text = typeof response === 'string' ? response : response?.message?.content;
      if (!text || text.trim().length === 0) return "I'm thinking, but the network didn't send a response. Try again.";
      return text;
  }
}

export const aiService = new PuterAIService();
