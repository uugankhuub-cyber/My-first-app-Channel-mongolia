import * as db from '../lib/firestore-db.ts';

export default async function handle(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const articles = await db.getArticles({ status: 'PUBLISHED' });
      const categories = await db.getCategories();

      const mappedData = articles.map(item => {
        const cat = categories.find(c => c.id === item.categoryId || c.slug === item.categoryId);
        const ytRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-\s&?=]+)/i;
        const match = item.content ? item.content.match(ytRegex) : null;
        const isVideoCategory = cat?.name?.toLowerCase() === 'видео' || cat?.slug === 'video';
        const isVideo = !!match || isVideoCategory;
        const videoUrl = match ? match[1] : (isVideo ? 'https://www.youtube.com/watch?v=uD4izuPDy_A' : '');

        return {
          id: item.id,
          slug: item.slug,
          title: item.title,
          title_en: item.title_en || item.title,
          description: item.excerpt || item.content.substring(0, 150),
          description_en: item.excerpt_en || item.excerpt || item.content.substring(0, 150),
          contentBody: item.content,
          contentBody_en: item.content_en || item.content,
          category: cat ? cat.name : 'Дэлхий',
          category_en: cat ? cat.name : 'World',
          thumbnailUrl: item.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
          views: item.views || 0,
          publishedDate: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : new Date(item.updatedAt || item.createdAt).toLocaleDateString(),
          readTime: `${Math.ceil((item.content?.length || 500) / 500)} мин`,
          readTimeValue: Math.ceil((item.content?.length || 500) / 500) || 5,
          isVideo,
          videoUrl,
          tags: item.tags || [],
          tags_en: item.tags || [],
          images: item.images || [],
          isTrending: (item.views || 0) > 1000,
          isEditorPick: item.id === 'art-1',
          likes: item.likes || 0,
          status: 'published'
        };
      });

      return res.status(200).json({ data: mappedData });
    } catch (error: any) {
      console.error('[API/CONTENT] Fetch articles error:', error.message);
      return res.status(200).json({ data: [] });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
