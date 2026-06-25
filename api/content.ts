import { prisma, getDbStatus } from '../lib/prisma.ts';
import * as mockDb from '../lib/mock-db.ts';

export default async function handle(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      if (getDbStatus()) {
        try {
          const articles = await prisma.article.findMany({
            where: { status: 'PUBLISHED' },
            include: { category: true },
            orderBy: { publishedAt: 'desc' }
          });

          const mappedData = articles.map(item => {
            const ytRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-\s&?=]+)/i;
            const match = item.content.match(ytRegex);
            const isVideoCategory = item.category?.name?.toLowerCase() === 'видео' || item.category?.name?.toLowerCase() === 'video';
            const isVideo = !!match || isVideoCategory;
            const videoUrl = match ? match[1] : (isVideo ? 'https://www.youtube.com/watch?v=uD4izuPDy_A' : '');

            return {
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
              isVideo,
              videoUrl,
              tags: [],
              tags_en: [],
              isTrending: false,
              isEditorPick: false,
              likes: 0,
              status: item.status.toLowerCase()
            };
          });

          return res.status(200).json({ data: mappedData });
        } catch (dbError: any) {
          console.error('Prisma fetch error in content.ts, using mock DB fallback:', dbError.message);
        }
      }

      // FALLBACK TO MOCK DB
      const db = mockDb.getDb();
      const publishedArticles = db.articles.filter(art => art.status === 'PUBLISHED');
      
      const mappedMockData = publishedArticles.map(art => {
        const cat = db.categories.find(c => c.id === art.categoryId);
        const ytRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-\s&?=]+)/i;
        const match = art.content.match(ytRegex);
        const isVideoCategory = cat?.name?.toLowerCase() === 'видео' || cat?.name?.toLowerCase() === 'video';
        const isVideo = !!match || isVideoCategory;
        const videoUrl = match ? match[1] : (isVideo ? 'https://www.youtube.com/watch?v=uD4izuPDy_A' : '');

        return {
          id: art.id,
          title: art.title,
          title_en: art.title_en,
          description: art.excerpt,
          description_en: art.excerpt_en,
          contentBody: art.content,
          contentBody_en: art.content_en,
          category: cat ? cat.name : 'General',
          category_en: cat ? cat.name : 'General',
          thumbnailUrl: art.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
          views: art.views,
          publishedDate: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : new Date().toLocaleDateString(),
          readTime: `${Math.ceil(art.content.length / 500)} мин`,
          readTimeValue: Math.ceil(art.content.length / 500) || 3,
          isVideo,
          videoUrl,
          tags: [],
          tags_en: [],
          isTrending: art.views > 1000,
          isEditorPick: art.id === 'art-1',
          likes: art.likes,
          status: 'published'
        };
      });

      return res.status(200).json({ data: mappedMockData, isMock: true });
    } catch (error: any) {
      console.error('Fetch articles overall error:', error.message);
      return res.status(200).json({ data: [], isMock: true });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
