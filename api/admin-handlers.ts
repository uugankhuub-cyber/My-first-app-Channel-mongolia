import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

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
  try {
    const { fileName, fileBase64 } = req.body;
    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: 'No file data provided' });
    }
    
    // Create public/uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'dist', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const devUploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(devUploadDir)) {
      fs.mkdirSync(devUploadDir, { recursive: true });
    }
    
    const uniqueName = Date.now() + '-' + fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Save to both public (for dev) and dist (for production)
    fs.writeFileSync(path.join(devUploadDir, uniqueName), Buffer.from(fileBase64, 'base64'));
    fs.writeFileSync(path.join(uploadDir, uniqueName), Buffer.from(fileBase64, 'base64'));
    
    res.json({ url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};
