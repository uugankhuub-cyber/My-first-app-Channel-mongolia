import { prisma } from '../lib/prisma.ts';
import { z } from 'zod';

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

export const getArticles = async (req: any, res: any) => {
  const { status, category, search } = req.query;

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
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

export const createArticle = async (req: any, res: any) => {
  try {
    const body = articleSchema.parse(req.body);
    const article = await prisma.article.create({
      data: {
        ...body,
        authorId: req.user.userId,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
      },
    });
    res.json(article);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateArticle = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const body = articleSchema.partial().parse(req.body);
    const article = await prisma.article.update({
      where: { id },
      data: {
        ...body,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : undefined,
      },
    });
    res.json(article);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteArticle = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await prisma.article.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
