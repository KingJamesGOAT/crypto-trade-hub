// Puter.js AI service with proper authentication
declare const puter: any;

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

class PuterAIService {
  
  async isSignedIn(): Promise<boolean> {
    if (typeof puter === 'undefined') return false;
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

  async chat(message: string): Promise<string> {
    try {
      if (typeof puter === 'undefined') {
        return "CRITICAL ERROR: 'puter.js' is missing. Please add <script src='https://js.puter.com/v2/'></script> to your index.html head.";
      }

      // 1. Try GPT-4o-mini first
      try {
          const response = await puter.ai.chat(message, { model: 'gpt-4o-mini' });
          return this.formatResponse(response);
      } catch (err) {
          console.warn("GPT-4o-mini failed, trying default model...", err);
          
          // 2. Fallback to Default (usually GPT-3.5) if 4o is rate-limited
          const fallback = await puter.ai.chat(message);
          return this.formatResponse(fallback);
      }

    } catch (error: any) {
      console.error('[AI Error]', error);
      return `AI Connection Failed: ${error.message || "Unknown error"}. (Check F12 Console)`;
    }
  }

  private formatResponse(response: any): string {
      if (typeof response === 'string') return response;
      if (response?.message?.content) return response.message.content;
      return JSON.stringify(response);
  }
}

export const aiService = new PuterAIService();
