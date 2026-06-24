import { prisma, getDbStatus } from '../lib/prisma.ts';
import { z } from 'zod';
import * as mockDb from '../lib/mock-db.ts';

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
});

const isDbAvailable = () => {
  return getDbStatus();
};

export const getArticles = async (req: any, res: any) => {
  const { status, category, search } = req.query;

  try {
    if (isDbAvailable()) {
      try {
        const articles = await prisma.article.findMany({
          where: {
            ...(status && { status: status as any }),
            ...(category && { category: { name: category as string } }),
            ...(search && {
              OR: [
                { title: { contains: search as string, mode: 'insensitive' } },
                { content: { contains: search as string, mode: 'insensitive' } },
              ],
            }),
          },
          include: {
            author: { select: { email: true } },
            category: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        return res.json(articles);
      } catch (dbError: any) {
        console.error('Database findMany failed in getArticles, using mock fallback:', dbError.message);
      }
    }

    // FALLBACK TO MOCK DB
    const db = mockDb.getDb();
    let filtered = [...db.articles];

    if (status) {
      filtered = filtered.filter(art => art.status === status);
    }
    if (category) {
      const cat = db.categories.find(c => c.name.toLowerCase() === (category as string).toLowerCase());
      if (cat) {
        filtered = filtered.filter(art => art.categoryId === cat.id);
      } else {
        filtered = [];
      }
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(art => 
        art.title.toLowerCase().includes(q) || 
        art.content.toLowerCase().includes(q)
      );
    }

    // Map to expected frontend structure
    const mapped = filtered.map(art => {
      const cat = db.categories.find(c => c.id === art.categoryId);
      return {
        id: art.id,
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: art.content,
        thumbnail: art.thumbnail,
        status: art.status,
        authorId: 'admin-1',
        author: { email: 'admin@channelmongolia.com' },
        categoryId: art.categoryId,
        category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
        publishedAt: art.publishedAt,
        createdAt: art.createdAt,
        updatedAt: art.updatedAt
      };
    });

    res.json(mapped);
  } catch (error: any) {
    console.error('getArticles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

export const createArticle = async (req: any, res: any) => {
  try {
    const body = articleSchema.parse(req.body);

    if (isDbAvailable()) {
      try {
        const article = await prisma.article.create({
          data: {
            ...body,
            authorId: req.user?.userId || 'admin-1',
            publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
          },
        });
        return res.json(article);
      } catch (dbError: any) {
        console.error('Database create failed in createArticle, using mock fallback:', dbError.message);
      }
    }

    // FALLBACK TO MOCK DB
    const db = mockDb.getDb();
    
    // Auto-create category if categoryId is passed as a name
    let finalCategoryId = body.categoryId;
    if (body.categoryId && !db.categories.some(c => c.id === body.categoryId)) {
      const existingCat = db.categories.find(c => c.name.toLowerCase() === body.categoryId!.toLowerCase());
      if (existingCat) {
        finalCategoryId = existingCat.id;
      } else {
        const newCatId = 'cat-' + Math.random().toString(36).substring(2, 15);
        db.categories.push({
          id: newCatId,
          name: body.categoryId,
          slug: body.categoryId.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        });
        finalCategoryId = newCatId;
      }
    }

    const newArt: mockDb.MockArticle = {
      id: 'art-' + Math.random().toString(36).substring(2, 15),
      title: body.title,
      title_en: body.title,
      slug: body.slug,
      excerpt: body.excerpt || body.content.substring(0, 150),
      excerpt_en: body.excerpt || body.content.substring(0, 150),
      content: body.content,
      content_en: body.content,
      thumbnail: body.thumbnail,
      status: body.status,
      categoryId: finalCategoryId,
      views: 0,
      likes: 0,
      publishedAt: body.status === 'PUBLISHED' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.articles.push(newArt);
    mockDb.saveDb(db);

    res.json(newArt);
  } catch (error: any) {
    console.error('createArticle error:', error);
    res.status(400).json({ error: error.message || 'Create article failed' });
  }
};

export const updateArticle = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const body = articleSchema.partial().parse(req.body);

    if (isDbAvailable()) {
      try {
        const article = await prisma.article.update({
          where: { id },
          data: {
            ...body,
            publishedAt: body.status === 'PUBLISHED' ? new Date() : undefined,
          },
        });
        return res.json(article);
      } catch (dbError: any) {
        console.error('Database update failed in updateArticle, using mock fallback:', dbError.message);
      }
    }

    // FALLBACK TO MOCK DB
    const db = mockDb.getDb();
    const index = db.articles.findIndex(art => art.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const existing = db.articles[index];
    const updated: mockDb.MockArticle = {
      ...existing,
      ...body,
      title_en: body.title !== undefined ? body.title : existing.title_en,
      excerpt_en: body.excerpt !== undefined ? body.excerpt : existing.excerpt_en,
      content_en: body.content !== undefined ? body.content : existing.content_en,
      publishedAt: body.status === 'PUBLISHED' ? new Date().toISOString() : (body.status === 'DRAFT' ? undefined : existing.publishedAt),
      updatedAt: new Date().toISOString()
    };

    db.articles[index] = updated;
    mockDb.saveDb(db);

    res.json(updated);
  } catch (error: any) {
    console.error('updateArticle error:', error);
    res.status(400).json({ error: error.message || 'Update article failed' });
  }
};

export const deleteArticle = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    if (isDbAvailable()) {
      try {
        await prisma.article.delete({ where: { id } });
        return res.json({ message: 'Deleted' });
      } catch (dbError: any) {
        console.error('Database delete failed in deleteArticle, using mock fallback:', dbError.message);
      }
    }

    // FALLBACK TO MOCK DB
    const db = mockDb.getDb();
    const index = db.articles.findIndex(art => art.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    db.articles.splice(index, 1);
    mockDb.saveDb(db);

    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('deleteArticle error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
};
