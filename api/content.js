
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Server-side)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export default async function handler(req, res) {
  const { method } = req;

  // --- GET: Fetch Content (Public) ---
  if (method === 'GET') {
    if (!supabase) {
      // Fallback to empty if no DB (Client will use Mock)
      return res.status(200).json({ data: [] });
    }
    
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    
    // Map snake_case DB to camelCase frontend
    const mappedData = data.map(item => ({
      id: item.id,
      title: item.title,
      title_en: item.title_en,
      description: item.description,
      description_en: item.description_en,
      contentBody: item.content_body,
      contentBody_en: item.content_body_en,
      category: item.category,
      category_en: item.category_en,
      thumbnailUrl: item.thumbnail_url,
      views: item.views,
      publishedDate: item.published_date,
      readTime: item.read_time,
      readTimeValue: item.read_time_value,
      isVideo: item.is_video,
      tags: item.tags,
      tags_en: item.tags_en,
      status: item.status
    }));

    return res.status(200).json({ data: mappedData });
  }

  // --- POST/PUT: Write Content (Admin Only) ---
  if (method === 'POST' || method === 'PUT') {
    // Security Check
    const authHeader = req.headers.authorization;
    const secret = process.env.ADMIN_SECRET;
    
    if (!authHeader || !secret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify rudimentary token
    try {
        const decoded = Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString();
        if (!decoded.startsWith(secret)) {
            throw new Error('Invalid token');
        }
    } catch (e) {
        return res.status(401).json({ error: 'Invalid Token' });
    }

    if (!supabase) {
        return res.status(503).json({ error: 'Database not configured' });
    }

    const body = req.body;
    
    // Map camelCase frontend to snake_case DB
    const dbPayload = {
      id: body.id,
      title: body.title,
      title_en: body.title_en,
      description: body.description,
      description_en: body.description_en,
      content_body: body.contentBody,
      content_body_en: body.contentBody_en,
      category: body.category,
      category_en: body.category_en,
      thumbnail_url: body.thumbnailUrl,
      views: body.views,
      published_date: body.publishedDate,
      read_time: body.readTime,
      read_time_value: body.readTimeValue,
      is_video: body.isVideo,
      tags: body.tags,
      tags_en: body.tags_en,
      status: body.status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('content')
        .upsert(dbPayload)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
