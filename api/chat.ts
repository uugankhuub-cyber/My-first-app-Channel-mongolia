
import { GoogleGenAI } from '@google/genai';

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(200).json({ 
      text: "AI Assistant is currently in standby mode (API Key missing). Please configure GEMINI_API_KEY." 
    });
  }

  try {
    const { messages, systemInstruction } = request.body;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const contents = messages.map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction || "You are a helpful assistant for Channel Mongolia. Answer in Mongolian or English based on the user's language.",
      }
    });

    return response.status(200).json({ text: geminiResponse.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return response.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
}
