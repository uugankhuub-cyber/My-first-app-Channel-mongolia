
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Security Check
  const authHeader = req.headers.authorization;
  const secret = process.env.ADMIN_SECRET;
  if (!authHeader || !secret) return res.status(401).json({ error: 'Unauthorized' });

  try {
     const decoded = Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString();
     if (!decoded.startsWith(secret)) throw new Error('Invalid token');
  } catch(e) {
     return res.status(401).json({ error: 'Invalid Token' });
  }

  // 2. Setup Supabase Admin
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
     // Fallback for demo without DB
     return res.status(200).json({ 
        url: 'https://picsum.photos/800/600?random=' + Date.now(),
        mock: true 
     });
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Note: Vercel Serverless handles body parsing automatically for JSON.
  // For binary file uploads in this simple setup, we expect a base64 string or
  // we use a client-side direct upload if we wanted to avoid server limits.
  // BUT the prompt asks for "/api/admin-upload".
  // We will assume the client sends JSON { fileName, fileType, fileBase64 } for simplicity 
  // to avoid multipart parsing complexity in a single file without middleware.

  const { fileName, fileBase64, fileType } = req.body;

  if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'Missing file data' });
  }

  const buffer = Buffer.from(fileBase64, 'base64');
  const path = `${Date.now()}_${fileName}`;

  const { data, error } = await supabase
    .storage
    .from('images')
    .upload(path, buffer, {
        contentType: fileType || 'image/jpeg',
        upsert: true
    });

  if (error) {
      return res.status(500).json({ error: error.message });
  }

  const { data: publicData } = supabase
    .storage
    .from('images')
    .getPublicUrl(path);

  return res.status(200).json({ url: publicData.publicUrl });
}
