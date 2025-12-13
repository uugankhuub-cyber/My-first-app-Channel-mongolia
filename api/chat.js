
import { GoogleGenAI } from '@google/genai';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  try {
    const { messages } = request.body;
    const lastMessage = messages[messages.length - 1].text;

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Or gemini-1.5-flash

    // Construct a simple prompt history or just send the last message for simplicity in this context
    // For full history context, you would format `messages` into the structure Gemini expects
    const result = await model.generateContent(lastMessage);
    const text = result.response.text();

    return response.status(200).json({ text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return response.status(500).json({ error: 'Failed to generate response' });
  }
}
