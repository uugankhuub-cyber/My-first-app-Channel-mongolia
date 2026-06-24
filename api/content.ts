
import { prisma } from '../lib/prisma.ts';

export default async function handler(req: any, res: any) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const articles = await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { updatedAt: 'desc' },
        include: { category: true }
      });

      // Map to frontend format
      const mappedData = articles.map(item => ({
        id: item.id,
        title: item.title,
        title_en: item.title,
        description: item.excerpt || item.content.substring(0, 150),
        description_en: item.excerpt || item.content.substring(0, 150),
        contentBody: item.content,
        contentBody_en: item.content,
        category: item.category?.name || 'General',
        category_en: item.category?.name || 'General',
        thumbnailUrl: item.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        views: 0,
        publishedDate: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : new Date(item.updatedAt).toLocaleDateString(),
        readTime: '5 мин',
        readTimeValue: 5,
        isVideo: false,
        tags: [],
        tags_en: [],
        isTrending: false,
        isEditorPick: false,
        likes: 0,
        status: item.status.toLowerCase()
      }));

      return res.status(200).json({ data: mappedData });
    } catch (error: any) {
      console.error('Fetch articles error:', error.message);
      
      // FALLBACK MOCK DATA
      const mockArticles = [
        {
          id: 'mock-1',
          title: 'Welcome to Channel Mongolia',
          title_en: 'Welcome to Channel Mongolia',
          description: 'A modern digital knowledge & media platform sharing interesting knowledge, science, and facts.',
          description_en: 'A modern digital knowledge & media platform sharing interesting knowledge, science, and facts.',
          contentBody: 'Welcome to our platform. We are dedicated to bringing you the latest in science, technology, and culture.',
          contentBody_en: 'Welcome to our platform. We are dedicated to bringing you the latest in science, technology, and culture.',
          category: 'Science',
          category_en: 'Science',
          thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
          views: 1250,
          publishedDate: new Date().toLocaleDateString(),
          readTime: '3 мин',
          readTimeValue: 3,
          isVideo: false,
          tags: [],
          tags_en: [],
          isTrending: true,
          isEditorPick: true,
          likes: 45,
          status: 'published'
        },
        {
          id: 'mock-2',
          title: 'The Future of AI in Mongolia',
          title_en: 'The Future of AI in Mongolia',
          description: 'Exploring how artificial intelligence is shaping the technological landscape of the region.',
          description_en: 'Exploring how artificial intelligence is shaping the technological landscape of the region.',
          contentBody: 'Artificial intelligence is making significant strides globally, and Mongolia is no exception.',
          contentBody_en: 'Artificial intelligence is making significant strides globally, and Mongolia is no exception.',
          category: 'Technology',
          category_en: 'Technology',
          thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
          views: 890,
          publishedDate: new Date().toLocaleDateString(),
          readTime: '5 мин',
          readTimeValue: 5,
          isVideo: false,
          tags: [],
          tags_en: [],
          isTrending: false,
          isEditorPick: false,
          likes: 24,
          status: 'published'
        }
      ];

      return res.status(200).json({ data: mockArticles, isMock: true });
    }
  }

  // Admin writes should use the newer article-handlers.ts via /api/admin/articles
  // But we can keep a fallback here if needed.
  return res.status(405).json({ error: 'Method not allowed' });
}
