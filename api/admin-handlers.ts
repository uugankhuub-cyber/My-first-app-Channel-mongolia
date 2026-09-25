import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json' assert { type: 'json' };

// Initialize Firebase App for Cloud Storage
const fbApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const fbStorage = getStorage(fbApp);

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
    const mimeType = fileType || 'image/jpeg';

    // 1. Primary Target: Upload to Firebase Storage (same Firebase project)
    try {
      const fileRef = storageRef(fbStorage, `articles/${uniqueName}`);
      const snapshot = await uploadBytes(fileRef, buffer, {
        contentType: mimeType,
        customMetadata: { originalName: fileName }
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log('[FIREBASE STORAGE] Image successfully uploaded to Firebase Storage:', downloadUrl);
      return res.json({ url: downloadUrl });
    } catch (fbErr: any) {
      console.warn('[FIREBASE STORAGE] Cloud Storage upload error:', fbErr.message);
    }

    // 2. Persistent fallback: If Firebase Storage bucket is not yet active on GCP,
    // save locally but ALSO support persistent Data URI so image is NEVER lost on Railway deploys.
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
    
    // If buffer is under 1.5MB, return persistent data URI so it survives deploys even without cloud bucket
    if (buffer.length < 1500000) {
      return res.json({ url: `data:${mimeType};base64,${fileBase64}` });
    }

    return res.json({ url: `/uploads/${uniqueName}` });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
};

