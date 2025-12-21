// Puter.js AI service with proper authentication
declare const puter: any;

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

class PuterAIService {
  async isSignedIn(): Promise<boolean> {
    try {
      if (typeof puter === 'undefined') return false;
      return puter.auth.isSignedIn();
    } catch {
      return false;
    }
  }

  async signIn(): Promise<boolean> {
    try {
      console.log('[Puter] Signing in...');
      await puter.auth.signIn();
      console.log('[Puter] ✅ Signed in');
      return true;
    } catch (error) {
      console.error('[Puter] Sign in failed:', error);
      return false;
    }
  }

  async getUsername(): Promise<string | null> {
    try {
      if (!await this.isSignedIn()) return null;
      const user = await puter.auth.getUser();
      return user.username;
    } catch {
      return null;
    }
  }

  async chat(message: string): Promise<string> {
    try {
      if (!await this.isSignedIn()) {
        return "Please sign in to use the AI assistant.";
      }

      console.log('[Puter] Sending message...');
      
      const response = await puter.ai.chat(
        `You are a crypto trading assistant for CryptoTradeHub. Help users understand blockchain, trading strategies (DCA, Grid, Momentum), and risk management. Keep answers concise and educational.\n\nUser: ${message}`,
        { model: 'gpt-4o-mini' }
      );

      console.log('[Puter] ✅ Response received');
      return response || "No response";
    } catch (error: any) {
      console.error('[Puter] Error:', error);
      return "Error: " + (error.message || "Failed to get response");
    }
  }
}

export const aiService = new PuterAIService();
