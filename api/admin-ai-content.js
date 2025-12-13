
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Security Check
  const authHeader = req.headers.authorization;
  const secret = process.env.ADMIN_SECRET;
  
  if (!authHeader || !secret) {
      return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
      const decoded = Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString();
      if (!decoded.startsWith(secret)) {
          throw new Error('Invalid token');
      }
  } catch (e) {
      return res.status(401).json({ error: 'Invalid Token' });
  }

  // 2. Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API Key missing' });
  }

  const { action, text } = req.body;
  const ai = new GoogleGenAI({ apiKey });

  // 3. Construct Prompt
  let prompt = "";
  
  switch (action) {
    case 'improve':
      prompt = `Rewrite the following text to be more engaging, professional, and clear. Keep the same meaning. \n\nText: "${text}"`;
      break;
    case 'summarize':
      prompt = `Summarize the following text into a concise paragraph. \n\nText: "${text}"`;
      break;
    case 'expand':
      prompt = `Expand the following text with more details, examples, and depth suitable for a blog post. \n\nText: "${text}"`;
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return res.status(200).json({ result: response.text });
  } catch (error) {
    console.error('AI Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
