
import { kv } from '@vercel/kv';

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 32; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid text' });
    }

    const id = generateId();
    
    // Stocker dans Vercel KV
    await kv.set(`script:${id}`, text);
    
    const baseUrl = `https://${req.headers.host}`;
    const rawUrl = `${baseUrl}/raw/${id}`;
    
    return res.status(200).json({ raw: rawUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
