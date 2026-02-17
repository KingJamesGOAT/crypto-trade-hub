import { LLMAgent } from './services/llm';
import * as dotenv from 'dotenv';

dotenv.config();

import axios from 'axios';

async function testLLM() {
    console.log("🧪 Testing Gemini 2.5 API...");
    const key = process.env.GEMINI_API_KEY;
    const model = "gemini-2.5-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    
    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Hello, are you online?" }] }]
        });
        console.log(`✅ SUCCESS: ${model} is working!`);
        console.log(`Response: ${JSON.stringify(response.data.candidates[0].content.parts[0].text, null, 2)}`);
    } catch (error: any) {
        console.error(`❌ FAILED ${model}:`);
        if (error.response) {
             console.error(`Status: ${error.response.status}`);
             console.error(JSON.stringify(error.response.data, null, 2));
        } else {
             console.error(error.message);
        }
    }
}

testLLM();
