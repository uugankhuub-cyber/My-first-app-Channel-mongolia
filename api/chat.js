
import { GoogleGenAI } from '@google/genai';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Graceful fallback for demo/dev environments without keys
    return response.status(200).json({ 
      text: "I can't connect to my brain right now (API Key missing), but I'm listening! Please configure GEMINI_API_KEY in Vercel." 
    });
  }

  try {
    const { messages, systemInstruction } = request.body;

    // Convert frontend message format to Gemini format
    // Frontend: { role: 'user' | 'model', text: '...' }
    // Gemini:   { role: 'user' | 'model', parts: [{ text: '...' }] }
    const contents = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const ai = new GoogleGenAI({ apiKey });
    
    // Correct usage of generateContent with systemInstruction in config
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction || "You are a helpful assistant for Channel Mongolia. Answer in Mongolian or English based on the user's language.",
      }
    });

    const text = geminiResponse.text;

    return response.status(200).json({ text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return response.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
}
