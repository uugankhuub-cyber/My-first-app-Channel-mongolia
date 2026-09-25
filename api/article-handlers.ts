import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import * as db from '../lib/firestore-db.ts';
import { postArticleToFacebook } from '../lib/facebook-service.ts';

export function getOrigin(req?: any): string {
  const siteUrl = process.env.SITE_URL || 'https://my-first-app-channel-mongolia-production.up.railway.app';
  return siteUrl.replace(/\/+$/, '');
}

export function sanitizeThumbnail(thumb?: string | null): string {
  if (!thumb || typeof thumb !== 'string' || !thumb.trim()) {
    return '/placeholder-article.svg';
  }
  const clean = thumb.trim();
  if (clean.startsWith('/uploads/')) {
    const rel = clean.replace(/^\//, '');
    const pubFile = path.join(process.cwd(), 'public', rel);
    const distFile = path.join(process.cwd(), 'dist', rel);
    if (!fs.existsSync(pubFile) && !fs.existsSync(distFile)) {
      return '/placeholder-article.svg';
    }
  }
  return clean;
}

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
  const { category, search } = req.query;

  try {
    // SECURITY: Public endpoint MUST return ONLY PUBLISHED articles, never DRAFT or ARCHIVED.
    const articles = await db.getArticles({
      status: 'PUBLISHED',
      category: category as string | undefined,
      search: search as string | undefined
    });

    const categories = await db.getCategories();

    // Map to public frontend structure (strictly NO agentNotes)
    const mapped = articles
      .filter(art => art.status === 'PUBLISHED')
      .map(art => {
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
          thumbnail: sanitizeThumbnail(art.thumbnail),
          images: art.images || [],
          status: 'PUBLISHED',
          views: art.views || 0,
          likes: art.likes || 0,
          thumbnailUrl: sanitizeThumbnail(art.thumbnail),
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

export const getAdminArticles = async (req: any, res: any) => {
  const { status, category, search } = req.query;

  try {
    const filterStatus = (status && status !== 'ALL') ? (status as string) : undefined;
    const articles = await db.getArticles({
      status: filterStatus,
      category: category as string | undefined,
      search: search as string | undefined
    });

    const categories = await db.getCategories();

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
        updatedAt: art.updatedAt,
        agentNotes: art.agentNotes,
        fbPostId: art.fbPostId || null,
        fbShareStatus: art.fbShareStatus || null,
        fbPostedAt: art.fbPostedAt || null
      };
    });

    res.json(mapped);
  } catch (error: any) {
    console.error('[ARTICLES] getAdminArticles error:', error);
    res.status(500).json({ error: 'Failed to fetch admin articles' });
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

    let finalArt = newArt;

    // Trigger Facebook auto-post if published and not opted out
    if (isPublished && req.body?.postToFacebook !== false) {
      try {
        const origin = getOrigin(req);
        const fbResult = await postArticleToFacebook(newArt, origin);
        if (fbResult.attempted) {
          const refreshed = await db.getArticleByIdOrSlug(newArt.id);
          if (refreshed) finalArt = refreshed;
        }
      } catch (fbErr: any) {
        console.error('[ARTICLES] Facebook auto-post error in createArticle:', fbErr.message);
      }
    }

    res.json(finalArt);
  } catch (error: any) {
    console.error('[ARTICLES] createArticle error:', error);
    res.status(400).json({ error: error.message || 'Create article failed' });
  }
};

export const updateArticle = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const existing = await db.getArticleByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ error: 'Article not found' });
    }

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

    const prevStatus = existing.status;
    const targetStatus = body.status || prevStatus;
    const isPublishing = targetStatus === 'PUBLISHED';
    const becamePublished = prevStatus !== 'PUBLISHED' && isPublishing;
    const isDraft = targetStatus === 'DRAFT';
    const now = new Date().toISOString();

    const updates: Partial<db.Article> = {
      ...body,
      ...(finalCategoryId !== undefined && { categoryId: finalCategoryId || null }),
      ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail || null }),
      ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle || null }),
      ...(body.metaDesc !== undefined && { metaDesc: body.metaDesc || null }),
      ...(body.agentNotes !== undefined && { agentNotes: body.agentNotes || null }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt || '' }),
      ...(becamePublished && { publishedAt: now }),
      ...(isDraft && { publishedAt: null }),
    };

    const updated = await db.updateArticle(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }

    let finalArt = updated;

    // Facebook Auto-post:
    // 1. When status changes to PUBLISHED (admin "Publish" button)
    // 2. Or if explicitly requested for an already PUBLISHED article that hasn't succeeded yet
    const postToFacebookRequested = req.body?.postToFacebook !== false;
    const notYetSuccessfullyShared = !existing.fbPostId && existing.fbShareStatus !== 'ok';
    const shouldPostToFb = isPublishing && postToFacebookRequested && (becamePublished || (notYetSuccessfullyShared && req.body?.postToFacebook === true));

    if (shouldPostToFb) {
      try {
        const origin = getOrigin(req);
        const fbResult = await postArticleToFacebook(updated, origin);
        if (fbResult.attempted) {
          const refreshed = await db.getArticleByIdOrSlug(id);
          if (refreshed) finalArt = refreshed;
        }
      } catch (fbErr: any) {
        console.error('[ARTICLES] Facebook auto-post error in updateArticle:', fbErr.message);
      }
    }

    res.json(finalArt);
  } catch (error: any) {
    console.error('[ARTICLES] updateArticle error:', error);
    res.status(400).json({ error: error.message || 'Update article failed' });
  }
};

export const retryFacebookPost = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const art = await db.getArticleByIdOrSlug(id);
    if (!art) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Guard: Drafts are NEVER posted
    if (art.status !== 'PUBLISHED') {
      return res.status(400).json({
        error: 'Зөвхөн нийтлэгдсэн (PUBLISHED) нийтлэлийг Facebook-т нийтэлнэ. Ноорог нийтлэлийг нийтлэх боломжгүй.'
      });
    }

    const origin = getOrigin(req);
    const result = await postArticleToFacebook(art, origin, { forceRetry: true });

    return res.json({
      success: result.success,
      fbPostId: result.fbPostId || null,
      fbShareStatus: result.fbShareStatus || (result.success ? 'ok' : 'Failed'),
      error: result.error || null
    });
  } catch (error: any) {
    console.error('[ARTICLES] retryFacebookPost error:', error);
    res.status(500).json({ error: error.message || 'Facebook retry failed' });
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
