
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Server-side)
// We use SERVICE_ROLE_KEY for writes to bypass RLS policies if needed, 
// or ensure we have admin privileges.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  const { method } = req;

  // --- GET: Public Fetch ---
  if (method === 'GET') {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Return empty list if DB not configured (prevents crash)
      return res.status(200).json({ data: [] });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Fetch published content
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Map DB Snake_case to CamelCase for Frontend
    const mappedData = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      contentBody: item.body_html, // HTML body
      category: item.category,
      thumbnailUrl: item.thumbnail_url,
      readTimeValue: item.read_time_value,
      tags: item.tags,
      status: item.status,
      publishedDate: new Date(item.updated_at).toLocaleDateString()
    }));

    return res.status(200).json({ data: mappedData });
  }

  // --- POST/PUT: Admin Write ---
  if (method === 'POST' || method === 'PUT') {
    const authHeader = req.headers.authorization;
    const secret = process.env.ADMIN_SECRET;

    // 1. Verify Secret
    if (!authHeader || !secret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '');
    // Simple verification: token should contain secret
    // In production, use JWT verification
    try {
       const decoded = Buffer.from(token, 'base64').toString();
       if (!decoded.startsWith(secret)) throw new Error('Invalid token');
    } catch(e) {
       return res.status(401).json({ error: 'Invalid Token' });
    }

    // 2. Initialize Admin Client
    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(503).json({ error: 'Database not configured' });
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = req.body;
    
    // Map CamelCase to DB Snake_case
    const dbPayload = {
      id: body.id,
      title: body.title,
      description: body.description,
      body_html: body.contentBody,
      category: body.category,
      thumbnail_url: body.thumbnailUrl,
      read_time_value: body.readTimeValue || 5,
      tags: body.tags || [],
      status: body.status || 'draft',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
        .from('content')
        .upsert(dbPayload)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
