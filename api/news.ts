import { Request, Response } from 'express';
import { prisma, getDbStatus } from '../lib/prisma.ts';
import * as mockDb from '../lib/mock-db.ts';

// Server-side secret key from environment or secure default
const EXPECTED_NEWS_API_KEY = process.env.NEWS_API_KEY || 'ch-mongolia-secret-news-key-2026';

export async function handleNewsHealth(req: Request, res: Response) {
  return res.status(200).json({ ok: true });
}

function matchCategory(
  incomingName: string | undefined, 
  availableCategories: { id: string; name: string; slug: string }[]
): { id: string; name: string; slug: string } {
  const norm = (incomingName || '').trim().toLowerCase();
  
  if (norm) {
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
      return res.status(400).json({ error: 'Validation error: "sources" is required and must be an array.' });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

    // 3. Uniqueness Check: Return 409 if slug exists
    const db = mockDb.getDb();
    const existingInMock = db.articles.some(a => a.slug === cleanSlug);

    if (existingInMock) {
      return res.status(409).json({
        error: `Conflict: An article with slug "${cleanSlug}" already exists.`,
        slug: cleanSlug
      });
    }

    if (getDbStatus()) {
      try {
        const existingInPrisma = await prisma.article.findUnique({
          where: { slug: cleanSlug }
        });
        if (existingInPrisma) {
          return res.status(409).json({
            error: `Conflict: An article with slug "${cleanSlug}" already exists.`,
            slug: cleanSlug
          });
        }
      } catch (err) {
        console.warn('Prisma check slug error, relying on mock DB:', err);
      }
    }

    // 4. Content formatting: body_markdown + "\n\n## Эх сурвалж\n" + sources as markdown links
    const sourceLinks = sources.map((s: any) => {
      const sName = typeof s === 'string' ? s : (s?.name || s?.url || 'Эх сурвалж');
      const sUrl = typeof s === 'string' ? s : (s?.url || '#');
      return `- [${sName}](${sUrl})`;
    }).join('\n');

    const fullContent = `${body_markdown.trim()}\n\n## Эх сурвалж\n${sourceLinks}`;

    // 5. Category matching: match case-insensitive by name or slug. If no match, use "Дэлхий"
    const matchedCategory = matchCategory(category, db.categories);

    // 6. Private agentNotes: store short_idea, fact_check and image.ai_prompt (visible ONLY in admin editor)
    const agentNotesObj = {
      short_idea: short_idea || null,
      fact_check: fact_check || null,
      ai_prompt: image?.ai_prompt || null,
      image_note: image?.note || null
    };
    const agentNotesStr = JSON.stringify(agentNotesObj);

    // 7. Map fields
    const newArticleId = 'art-' + Math.random().toString(36).substring(2, 11);
    const tagsList = Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [];
    const metaDesc = seo?.meta_description ? String(seo.meta_description) : lead.trim().substring(0, 160);
    const metaTitle = title.trim();
    const thumbnail = image && typeof image === 'object' && image.url ? String(image.url).trim() : undefined;
    const nowIso = new Date().toISOString();

    // 8. Always create with status "DRAFT" in the articles table
    const newMockArticle: mockDb.MockArticle = {
      id: newArticleId,
      title: title.trim(),
      title_en: title.trim(),
      slug: cleanSlug,
      excerpt: lead.trim(),
      excerpt_en: lead.trim(),
      content: fullContent,
      content_en: fullContent,
      thumbnail: thumbnail,
      status: 'DRAFT', // Always DRAFT
      categoryId: matchedCategory.id,
      views: 0,
      likes: 0,
      tags: tagsList,
      metaTitle: metaTitle,
      metaDesc: metaDesc,
      agentNotes: agentNotesStr,
      publishedAt: undefined, // Draft has no publishedAt
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
              title: title.trim(),
              slug: cleanSlug,
              excerpt: lead.trim(),
              content: fullContent,
              thumbnail: thumbnail || null,
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

    // 10. Return 201 with { id, slug } on success
    return res.status(201).json({ id: createdArticleId, slug: cleanSlug });
  } catch (error: any) {
    console.error('Error creating article in /api/news:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
