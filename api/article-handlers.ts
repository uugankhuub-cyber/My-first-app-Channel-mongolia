import { z } from 'zod';
import * as db from '../lib/firestore-db.ts';

const articleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  thumbnail: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  categoryId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  agentNotes: z.string().optional(),
  images: z.array(z.union([z.string(), z.object({ url: z.string(), caption: z.string().optional() })])).optional(),
  tags: z.array(z.string()).optional(),
});

export const getAdminArticleById = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const art = await db.getArticleByIdOrSlug(id);
    if (!art) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const categories = await db.getCategories();
    const cat = categories.find(c => c.id === art.categoryId || c.slug === art.categoryId);

    return res.json({
      ...art,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
      author: { email: 'uugankhuub@gmail.com' }
    });
  } catch (error: any) {
    console.error('[ARTICLES] getAdminArticleById error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

export const getArticles = async (req: any, res: any) => {
  const { status, category, search } = req.query;

  try {
    const articles = await db.getArticles({
      status: status as string | undefined,
      category: category as string | undefined,
      search: search as string | undefined
    });

    const categories = await db.getCategories();

    // Map to expected frontend structure (omits private agentNotes for public)
    const mapped = articles.map(art => {
      const cat = categories.find(c => c.id === art.categoryId || c.slug === art.categoryId);
      return {
        id: art.id,
        title: art.title,
        title_en: art.title_en || art.title,
        slug: art.slug,
        excerpt: art.excerpt || '',
        excerpt_en: art.excerpt_en || art.excerpt || '',
        content: art.content,
        content_en: art.content_en || art.content,
        thumbnail: art.thumbnail,
        images: art.images || [],
        status: art.status,
        views: art.views || 0,
        likes: art.likes || 0,
        thumbnailUrl: art.thumbnail,
        authorId: 'admin-1',
        author: { email: 'uugankhuub@gmail.com' },
        categoryId: art.categoryId,
        category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
        tags: art.tags || [],
        metaTitle: art.metaTitle,
        metaDesc: art.metaDesc,
        publishedAt: art.publishedAt,
        createdAt: art.createdAt,
        updatedAt: art.updatedAt
      };
    });

    res.json(mapped);
  } catch (error: any) {
    console.error('[ARTICLES] getArticles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

export const createArticle = async (req: any, res: any) => {
  try {
    const body = articleSchema.parse(req.body);
    const categories = await db.getCategories();

    // Resolve categoryId
    let finalCategoryId = body.categoryId;
    if (body.categoryId) {
      const match = categories.find(
        c => c.id === body.categoryId || 
             c.slug.toLowerCase() === body.categoryId!.toLowerCase() ||
             c.name.toLowerCase() === body.categoryId!.toLowerCase()
      );
      if (match) {
        finalCategoryId = match.id;
      } else {
        const newCat = await db.createCategory({
          name: body.categoryId,
          slug: body.categoryId.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
        });
        finalCategoryId = newCat.id;
      }
    }

    const now = new Date().toISOString();
    const isPublished = body.status === 'PUBLISHED';
    const newArt = await db.createArticle({
      title: body.title,
      title_en: body.title,
      slug: body.slug,
      excerpt: body.excerpt || body.content.substring(0, 150),
      excerpt_en: body.excerpt || body.content.substring(0, 150),
      content: body.content,
      content_en: body.content,
      thumbnail: body.thumbnail || null,
      images: body.images || [],
      status: body.status || 'DRAFT',
      categoryId: finalCategoryId || null,
      tags: body.tags || [],
      metaTitle: body.metaTitle || null,
      metaDesc: body.metaDesc || null,
      agentNotes: body.agentNotes || null,
      views: 0,
      likes: 0,
      publishedAt: isPublished ? now : null,
      createdAt: now,
      updatedAt: now
    });

    res.json(newArt);
  } catch (error: any) {
    console.error('[ARTICLES] createArticle error:', error);
    res.status(400).json({ error: error.message || 'Create article failed' });
  }
};

export const updateArticle = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const body = articleSchema.partial().parse(req.body);
    const categories = await db.getCategories();

    let finalCategoryId = body.categoryId;
    if (body.categoryId) {
      const match = categories.find(
        c => c.id === body.categoryId || 
             c.slug.toLowerCase() === body.categoryId!.toLowerCase() ||
             c.name.toLowerCase() === body.categoryId!.toLowerCase()
      );
      if (match) {
        finalCategoryId = match.id;
      }
    }

    const isPublishing = body.status === 'PUBLISHED';
    const isDraft = body.status === 'DRAFT';
    const now = new Date().toISOString();

    const updates: Partial<db.Article> = {
      ...body,
      ...(finalCategoryId !== undefined && { categoryId: finalCategoryId || null }),
      ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail || null }),
      ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle || null }),
      ...(body.metaDesc !== undefined && { metaDesc: body.metaDesc || null }),
      ...(body.agentNotes !== undefined && { agentNotes: body.agentNotes || null }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt || '' }),
      ...(isPublishing && { publishedAt: now }),
      ...(isDraft && { publishedAt: null }),
    };

    const updated = await db.updateArticle(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('[ARTICLES] updateArticle error:', error);
    res.status(400).json({ error: error.message || 'Update article failed' });
  }
};

export const deleteArticle = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await db.deleteArticle(id);
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('[ARTICLES] deleteArticle error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
};
