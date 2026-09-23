import { Request, Response } from 'express';
import { db } from '../lib/firebase.ts';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { NewsItem } from '../types/news.ts';

// Server-side secret key from environment or secure default
const EXPECTED_NEWS_API_KEY = process.env.NEWS_API_KEY || 'ch-mongolia-secret-news-key-2026';

// Helper to remove undefined fields recursively for Firestore compatibility
function removeUndefined<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = removeUndefined(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function handleNewsHealth(req: Request, res: Response) {
  return res.status(200).json({ ok: true });
}

export async function handleCreateNews(req: Request, res: Response) {
  try {
    // 1. Authorization: Bearer <NEWS_API_KEY>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }

    const token = authHeader.substring(7).trim();
    if (!token || token !== EXPECTED_NEWS_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid NEWS_API_KEY' });
    }

    const {
      slug,
      title,
      lead,
      body_markdown,
      sources,
      date,
      category,
      tags,
      image,
      seo,
      short_idea,
      fact_check
    } = req.body;

    // 2. Validate required fields
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return res.status(400).json({ error: 'Validation error: "slug" is required and must be a non-empty string.' });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Validation error: "title" is required and must be a non-empty string.' });
    }

    if (!lead || typeof lead !== 'string' || !lead.trim()) {
      return res.status(400).json({ error: 'Validation error: "lead" is required and must be a non-empty string.' });
    }

    if (!body_markdown || typeof body_markdown !== 'string' || !body_markdown.trim()) {
      return res.status(400).json({ error: 'Validation error: "body_markdown" is required and must be a non-empty string.' });
    }

    if (!sources || !Array.isArray(sources)) {
      return res.status(400).json({ error: 'Validation error: "sources" is required and must be an array of {name, url}.' });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

    // 3. Check if slug already exists
    const slugDocRef = doc(db, 'slugs', cleanSlug);
    const existingSlugSnap = await getDoc(slugDocRef);

    if (existingSlugSnap.exists()) {
      return res.status(409).json({ error: `Conflict: An article with slug "${cleanSlug}" already exists.`, slug: cleanSlug });
    }

    // Also double check news collection
    try {
      const existingNewsSnap = await getDoc(doc(db, 'news', cleanSlug));
      if (existingNewsSnap.exists()) {
        return res.status(409).json({ error: `Conflict: An article with slug "${cleanSlug}" already exists.`, slug: cleanSlug });
      }
    } catch {
      // If permission-denied because it's a draft or not published, slugDoc check already handles it
    }

    // 4. ALWAYS save with status "draft", ignoring any status sent in the request
    const now = new Date().toISOString();
    const articleDate = date && typeof date === 'string' ? date : now.split('T')[0];

    const newArticle: NewsItem = {
      slug: cleanSlug,
      status: 'draft', // Enforce draft status regardless of request
      date: articleDate,
      category: typeof category === 'string' && category.trim() ? category.trim() : 'General',
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
      title: title.trim(),
      lead: lead.trim(),
      body_markdown: body_markdown.trim(),
      sources: sources.map((s: any) => ({
        name: s && s.name ? String(s.name).trim() : 'Source',
        url: s && s.url ? String(s.url).trim() : '#'
      })),
      image: image && typeof image === 'object' ? {
        note: image.note ? String(image.note) : undefined,
        ai_prompt: image.ai_prompt ? String(image.ai_prompt) : undefined,
        url: image.url ? String(image.url) : undefined
      } : undefined,
      seo: seo && typeof seo === 'object' ? {
        meta_description: seo.meta_description ? String(seo.meta_description) : lead.trim().substring(0, 160),
        keywords: seo.keywords || []
      } : {
        meta_description: lead.trim().substring(0, 160),
        keywords: []
      },
      short_idea: short_idea && typeof short_idea === 'object' ? {
        hook: short_idea.hook ? String(short_idea.hook) : undefined,
        outline: short_idea.outline ? String(short_idea.outline) : undefined
      } : undefined,
      fact_check: Array.isArray(fact_check) ? fact_check : [],
      created_at: now,
      published_at: null
    };

    // 5. Save to Firestore
    const sanitizedArticle = removeUndefined(newArticle);
    await setDoc(doc(db, 'news', cleanSlug), sanitizedArticle);
    await setDoc(slugDocRef, { slug: cleanSlug, created_at: now });

    // 6. Return 201 with { id, slug }
    return res.status(201).json({ id: cleanSlug, slug: cleanSlug });
  } catch (error: any) {
    console.error('Error creating news in /api/news:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
