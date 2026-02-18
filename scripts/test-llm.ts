import { LLMAgent } from './services/llm';
import * as dotenv from 'dotenv';

dotenv.config();

async function testLLM() {
    console.log("🧪 Testing LLMAgent with Gemini 1.5 Flash...");
    const agent = new LLMAgent();
    
    // Mock Indicators
    const indicators = {
        isUpTrend: true,
        isMacdPositive: true,
        k: 20,
        d: 15
    };

    console.log("...sending request...");
    const result = await agent.analyzeSetup("BTC", 50000, indicators);
    console.log("Result:", JSON.stringify(result, null, 2));
}

testLLM();
