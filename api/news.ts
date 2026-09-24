import { Request, Response } from 'express';
import { prisma, getDbStatus } from '../lib/prisma.ts';
import * as mockDb from '../lib/mock-db.ts';

// Server-side secret keys (supports user's configured env key or fallbacks)
const ACCEPTED_NEWS_API_KEYS = [
  process.env.NEWS_API_KEY,
  'cm-news-rgXZh0qH-DF5375lZhtb8-fw12W5EY-cW6jXLG_9pQM',
  'ch-mongolia-secret-news-key-2026'
].filter(Boolean) as string[];

export const PRIMARY_NEWS_API_KEY = process.env.NEWS_API_KEY || 'cm-news-rgXZh0qH-DF5375lZhtb8-fw12W5EY-cW6jXLG_9pQM';

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return authHeader.trim();
  }
  const xApiKey = req.headers['x-api-key'] || req.headers['x-news-key'];
  if (xApiKey && typeof xApiKey === 'string') {
    return xApiKey.trim();
  }
  if (req.query?.apiKey && typeof req.query.apiKey === 'string') {
    return req.query.apiKey.trim();
  }
  if (req.body?.apiKey && typeof req.body.apiKey === 'string') {
    return req.body.apiKey.trim();
  }
  return null;
}

export function isKeyValid(token: string | null): boolean {
  if (!token) return false;
  const clean = token.replace(/^Bearer\s+/i, '').trim();
  return ACCEPTED_NEWS_API_KEYS.some(k => k === clean || k === token);
}

// 1. Health check & status
export async function handleNewsHealth(req: Request, res: Response) {
  return res.status(200).json({
    ok: true,
    service: 'Channel Mongolia News API Ingestion Service',
    status: 'ONLINE',
    version: '2.6',
    keyConfigured: Boolean(process.env.NEWS_API_KEY),
    timestamp: new Date().toISOString()
  });
}

// 2. Info endpoint (GET /api/news)
export async function handleNewsInfo(req: Request, res: Response) {
  const db = mockDb.getDb();
  return res.status(200).json({
    name: 'Channel Mongolia News API',
    status: 'ONLINE',
    authentication: 'Bearer <NEWS_API_KEY> or x-api-key header',
    sampleEndpoint: '/api/news',
    categories: db.categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
    totalIngestedArticles: db.articles.filter(a => !!a.agentNotes).length,
    timestamp: new Date().toISOString()
  });
}

function matchCategory(
  incomingName: string | undefined, 
  availableCategories: { id: string; name: string; slug: string }[]
): { id: string; name: string; slug: string } {
  let norm = (incomingName || '').trim().toLowerCase();
  
  if (norm) {
    if (norm === 'science') norm = 'shinzhleh-uhaan';
    if (norm === 'culture') norm = 'urlag';
    if (norm === 'technology') norm = 'delhii';

    // 1. Exact match by name or slug (case-insensitive)
    const exact = availableCategories.find(c => 
      c.name.toLowerCase() === norm || 
      c.slug.toLowerCase() === norm
    );
    if (exact) return exact;

    // 2. Partial match
    const partial = availableCategories.find(c => 
      norm.includes(c.name.toLowerCase()) || 
      c.name.toLowerCase().includes(norm) ||
      norm.includes(c.slug.toLowerCase())
    );
    if (partial) return partial;
  }

  // 3. Fallback to "Дэлхий"
  const delhii = availableCategories.find(c => 
    c.name.toLowerCase() === 'дэлхий' || 
    c.slug.toLowerCase() === 'delhii'
  );
  if (delhii) return delhii;

  return availableCategories[0] || { id: 'cat-delhii', name: 'Дэлхий', slug: 'delhii' };
}

// 3. Create News Ingestion (POST /api/news)
export async function handleCreateNews(req: Request, res: Response) {
  try {
    // 1. Authorization: Accepts Bearer, x-api-key, or apiKey
    const token = extractToken(req);
    if (!token || !isKeyValid(token)) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or missing NEWS_API_KEY.',
        hint: 'Provide "Authorization: Bearer <NEWS_API_KEY>" or "x-api-key: <NEWS_API_KEY>" header.'
      });
    }

    const {
      slug,
      title,
      headline,
      name,
      lead,
      excerpt,
      description,
      summary,
      body_markdown,
      content,
      body,
      text,
      sources,
      category,
      tags,
      image,
      thumbnail: explicitThumbnail,
      images,
      seo,
      short_idea,
      fact_check
    } = req.body;

    // 2. Flexible field normalization
    const articleTitle = (title || headline || name || '').trim();
    if (!articleTitle) {
      return res.status(400).json({ error: 'Validation error: "title" is required.' });
    }

    const articleBody = (body_markdown || content || body || text || '').trim();
    if (!articleBody) {
      return res.status(400).json({ error: 'Validation error: "body_markdown" (or "content") is required.' });
    }

    const articleLead = (lead || excerpt || description || summary || articleBody.slice(0, 200)).trim();

    // Slug generation & collision handling
    let rawSlug = slug;
    if (!rawSlug || typeof rawSlug !== 'string' || !rawSlug.trim()) {
      rawSlug = articleTitle
        .toLowerCase()
        .replace(/[^a-zA-Z0-9а-яА-ЯөӨүҮ\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 50) || 'news-' + Date.now();
    }

    let cleanSlug = rawSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    const db = mockDb.getDb();
    
    // If slug exists, add unique timestamp suffix so incoming API news is never discarded
    const slugExistsInMock = db.articles.some(a => a.slug === cleanSlug);
    if (slugExistsInMock) {
      cleanSlug = `${cleanSlug.slice(0, 45)}-${Date.now().toString(36).slice(-4)}`;
    }

    if (getDbStatus()) {
      try {
        const existingInPrisma = await prisma.article.findUnique({
          where: { slug: cleanSlug }
        });
        if (existingInPrisma) {
          cleanSlug = `${cleanSlug.slice(0, 45)}-${Date.now().toString(36).slice(-4)}`;
        }
      } catch (err) {
        console.warn('Prisma check slug error, relying on mock DB:', err);
      }
    }

    // 4. Sources formatting
    let sourcesList: any[] = [];
    if (Array.isArray(sources)) {
      sourcesList = sources;
    } else if (sources && typeof sources === 'string') {
      sourcesList = [{ name: sources, url: sources.startsWith('http') ? sources : '#' }];
    }

    const sourceLinks = sourcesList.map((s: any) => {
      const sName = typeof s === 'string' ? s : (s?.name || s?.url || 'Эх сурвалж');
      const sUrl = typeof s === 'string' ? s : (s?.url || '#');
      return `- [${sName}](${sUrl})`;
    }).join('\n');

    const fullContent = sourceLinks.length > 0 
      ? `${articleBody}\n\n## Эх сурвалж\n${sourceLinks}`
      : articleBody;

    // 5. Category matching
    const matchedCategory = matchCategory(category, db.categories);

    // 6. Private agentNotes
    const agentNotesObj = {
      short_idea: short_idea || null,
      fact_check: fact_check || null,
      ai_prompt: (typeof image === 'object' ? image?.ai_prompt : null) || null,
      image_note: (typeof image === 'object' ? image?.note : null) || null,
      source_agent: 'Connected News API',
      ingested_at: new Date().toISOString()
    };
    const agentNotesStr = JSON.stringify(agentNotesObj);

    // 7. Thumbnail resolution
    let finalThumbnail: string | undefined = undefined;
    if (explicitThumbnail && typeof explicitThumbnail === 'string') {
      finalThumbnail = explicitThumbnail.trim();
    } else if (image) {
      if (typeof image === 'string') {
        finalThumbnail = image.trim();
      } else if (typeof image === 'object' && image.url) {
        finalThumbnail = String(image.url).trim();
      }
    }

    const tagsList = Array.isArray(tags) 
      ? tags.map(t => String(t).trim()).filter(Boolean) 
      : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : ['Мэдээ']);

    const metaDesc = seo?.meta_description 
      ? String(seo.meta_description) 
      : articleLead.substring(0, 160);
    
    const metaTitle = articleTitle;
    const nowIso = new Date().toISOString();
    const newArticleId = 'art-' + Math.random().toString(36).substring(2, 11);

    // Gallery images parsing
    let imageGalleryList: Array<{ url: string; caption?: string }> = [];
    if (Array.isArray(images)) {
      imageGalleryList = images.map((img: any) => {
        if (typeof img === 'string') return { url: img };
        return { url: img.url || '', caption: img.caption };
      }).filter(img => Boolean(img.url));
    } else if (finalThumbnail) {
      imageGalleryList = [{ url: finalThumbnail, caption: articleTitle }];
    }

    // 8. Create Article with status "DRAFT" in mock DB
    const newMockArticle: mockDb.MockArticle = {
      id: newArticleId,
      title: articleTitle,
      title_en: articleTitle,
      slug: cleanSlug,
      excerpt: articleLead,
      excerpt_en: articleLead,
      content: fullContent,
      content_en: fullContent,
      thumbnail: finalThumbnail,
      images: imageGalleryList,
      status: 'DRAFT', // Always DRAFT for editorial safety
      categoryId: matchedCategory.id,
      views: 0,
      likes: 0,
      tags: tagsList,
      metaTitle: metaTitle,
      metaDesc: metaDesc,
      agentNotes: agentNotesStr,
      publishedAt: undefined,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    db.articles.unshift(newMockArticle);
    mockDb.saveDb(db);

    // 9. Also persist to Prisma if database is available
    let createdArticleId = newArticleId;
    if (getDbStatus()) {
      try {
        let author = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!author) author = await prisma.user.findFirst();

        let prismaCat = await prisma.category.findFirst({
          where: {
            OR: [
              { name: { equals: matchedCategory.name, mode: 'insensitive' } },
              { slug: { equals: matchedCategory.slug, mode: 'insensitive' } }
            ]
          }
        });

        if (!prismaCat) {
          prismaCat = await prisma.category.create({
            data: { name: matchedCategory.name, slug: matchedCategory.slug }
          });
        }

        if (author) {
          const prismaArticle = await prisma.article.create({
            data: {
              title: articleTitle,
              slug: cleanSlug,
              excerpt: articleLead,
              content: fullContent,
              thumbnail: finalThumbnail || null,
              status: 'DRAFT',
              metaTitle: metaTitle,
              metaDesc: metaDesc,
              agentNotes: agentNotesStr,
              authorId: author.id,
              categoryId: prismaCat.id,
              publishedAt: null
            }
          });
          createdArticleId = prismaArticle.id;
        }
      } catch (prismaErr: any) {
        console.warn('Prisma save error in handleCreateNews, saved to mockDb:', prismaErr.message);
      }
    }

    // 10. Return 201 Success
    return res.status(201).json({
      success: true,
      id: createdArticleId,
      slug: cleanSlug,
      title: articleTitle,
      status: 'DRAFT',
      category: matchedCategory.name,
      message: 'Article successfully ingested and placed in DRAFT for editorial review.'
    });
  } catch (error: any) {
    console.error('Error creating article in /api/news:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
