cat << 'INNER_EOF' > api/admin-handlers.ts
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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
    const { fileName, fileType, fileBase64 } = req.body;
    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: 'No file data provided' });
    }
    
    const uniqueName = Date.now() + '-' + fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const buffer = Buffer.from(fileBase64, 'base64');

    // Attempt Supabase Upload if configured
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Ensure bucket exists or just try uploading
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(uniqueName, buffer, {
            contentType: fileType || 'image/jpeg',
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error:', error);
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(uniqueName);

        return res.json({ url: publicUrl });
      } catch (err: any) {
        console.warn('Supabase upload failed, falling back to local storage', err.message);
      }
    }
    
    // Fallback: Local Upload
    const uploadDir = path.join(process.cwd(), 'dist', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const devUploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(devUploadDir)) {
      fs.mkdirSync(devUploadDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(devUploadDir, uniqueName), buffer);
    fs.writeFileSync(path.join(uploadDir, uniqueName), buffer);
    
    res.json({ url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};
INNER_EOF
