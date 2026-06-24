
import { GoogleGenAI } from '@google/genai';

export const askAI = async (req: any, res: any) => {
  const { action, text } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ result: "AI is in standby mode. Configure API key." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `Action: ${action}. Text: ${text}. 
    Please process this text based on the action for a content management system. 
    If action is 'summarize', provide a summary. If 'generate', generate content. 
    Answer in Mongolian or English as appropriate.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Admin AI Error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
};

export const adminUpload = async (req: any, res: any) => {
  // Mock upload for now
  res.json({ url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800' });
};
