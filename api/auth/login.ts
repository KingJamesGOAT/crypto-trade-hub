import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'blackswan';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Bl@ckSw4n_St3vE!92#Xq';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Verify credentials (case-insensitive username)
    if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase() && password === ADMIN_PASSWORD) {
      // Generate JWT token (expires in 30 days)
      const token = jwt.sign(
        { username: ADMIN_USERNAME, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        success: true,
        token,
        username: ADMIN_USERNAME
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
