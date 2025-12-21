import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const BINANCE_API_KEY = process.env.BINANCE_API_KEY || '';
const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);

    // Verify JWT
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Return API keys
    return res.status(200).json({
      geminiApiKey: GEMINI_API_KEY,
      binanceApiKey: BINANCE_API_KEY,
      binanceSecretKey: BINANCE_SECRET_KEY
    });
  } catch (error) {
    console.error('Get keys error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
