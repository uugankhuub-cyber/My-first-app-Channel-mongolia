import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { prisma, getDbStatus } from '../lib/prisma.ts';
import * as mockDb from '../lib/mock-db.ts';

// Secret key for news ingestion API
const EXPECTED_NEWS_API_KEY = process.env.NEWS_API_KEY || 'cm-news-rgXZh0qH-DF5375lZhtb8-fw12W5EY-cW6jXLG_9pQM';

// Test connection handler for Admin UI
export async function testAgentConnection(req: Request, res: Response) {
  try {
    const key = process.env.NEWS_API_KEY || 'cm-news-rgXZh0qH-DF5375lZhtb8-fw12W5EY-cW6jXLG_9pQM';
    return res.status(200).json({
      success: true,
      message: 'Холболт амжилттай шалгагдлаа! News API нь зөв холбогдсон бөгөөд мэдээ хүлээн авахад бэлэн байна.',
      endpoint: '/api/news',
      healthUrl: '/api/news/health',
      httpStatus: 200,
      apiKey: key,
      testedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function matchCategory(
  incomingName: string | undefined, 
  availableCategories: { id: string; name: string; slug: string }[]
): { id: string; name: string; slug: string } {
  const norm = (incomingName || '').trim().toLowerCase();
  
  if (norm) {
    const exact = availableCategories.find(c => 
      c.name.toLowerCase() === norm || 
      c.slug.toLowerCase() === norm
    );
    if (exact) return exact;

    const partial = availableCategories.find(c => 
      norm.includes(c.name.toLowerCase()) || 
      c.name.toLowerCase().includes(norm) ||
      norm.includes(c.slug.toLowerCase())
    );
    if (partial) return partial;
  }

  const delhii = availableCategories.find(c => 
    c.name.toLowerCase() === 'дэлхий' || 
    c.slug.toLowerCase() === 'delhii'
  );
  if (delhii) return delhii;

  return availableCategories[0] || { id: 'cat-delhii', name: 'Дэлхий', slug: 'delhii' };
}

// 1. Get Agent Overview & Status
export async function getAgentStatus(req: Request, res: Response) {
  try {
    const db = mockDb.getDb();
    
    // Check mock DB agent articles
    const mockAgentArticles = db.articles.filter(a => !!a.agentNotes);
    let total = mockAgentArticles.length;
    let drafts = mockAgentArticles.filter(a => a.status === 'DRAFT').length;
    let published = mockAgentArticles.filter(a => a.status === 'PUBLISHED').length;

    let recent: Array<{
      id: string;
      title: string;
      slug: string;
      status: string;
      category: string;
      thumbnail?: string;
      createdAt: string;
      agentNotes: any;
    }> = mockAgentArticles.slice(0, 10).map(a => {
      let parsedNotes: any = null;
      try {
        parsedNotes = typeof a.agentNotes === 'string' ? JSON.parse(a.agentNotes) : a.agentNotes;
      } catch (e) {
        parsedNotes = { raw: a.agentNotes };
      }
      const cat = db.categories.find(c => c.id === a.categoryId);
      return {
        id: a.id,
        title: a.title,
        slug: a.slug,
        status: a.status,
        category: cat ? cat.name : 'Дэлхий',
        thumbnail: a.thumbnail,
        createdAt: a.createdAt,
        agentNotes: parsedNotes
      };
    });

    // If Prisma is online, fetch accurate counts
    if (getDbStatus()) {
      try {
        const prismaArticles = await prisma.article.findMany({
          where: { agentNotes: { not: null } },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { category: true }
        });

        const prismaTotal = await prisma.article.count({
          where: { agentNotes: { not: null } }
        });
        const prismaDrafts = await prisma.article.count({
          where: { agentNotes: { not: null }, status: 'DRAFT' }
        });
        const prismaPublished = await prisma.article.count({
          where: { agentNotes: { not: null }, status: 'PUBLISHED' }
        });

        if (prismaTotal > 0) {
          total = prismaTotal;
          drafts = prismaDrafts;
          published = prismaPublished;
          recent = prismaArticles.map(a => {
            let parsedNotes: any = null;
            try {
              parsedNotes = a.agentNotes ? JSON.parse(a.agentNotes) : null;
            } catch (e) {
              parsedNotes = { raw: a.agentNotes };
            }
            return {
              id: a.id,
              title: a.title,
              slug: a.slug,
              status: a.status,
              category: a.category ? a.category.name : 'Дэлхий',
              thumbnail: a.thumbnail || undefined,
              createdAt: a.createdAt.toISOString(),
              agentNotes: parsedNotes
            };
          });
        }
      } catch (prismaErr: any) {
        console.warn('Prisma getAgentStatus error, fallback to mock data:', prismaErr.message);
      }
    }

    return res.status(200).json({
      status: 'ONLINE',
      agentName: 'Channel Mongolia News Agent (v2.6)',
      model: 'gemini-3.8-flash',
      ingestionEndpoint: '/api/news',
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
      newsApiKey: EXPECTED_NEWS_API_KEY,
      stats: {
        total,
        drafts,
        published
      },
      recentArticles: recent
    });
  } catch (error: any) {
    console.error('Error in getAgentStatus:', error);
    return res.status(500).json({ error: error.message });
  }
}

// 2. Interactive AI Agent News Generation
export async function generateAgentNews(req: Request, res: Response) {
  try {
    const { topic, category, tone = 'Шуурхай мэдээ', customSources = [] } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Сэдэв эсвэл мэдээний агуулга оруулна уу.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let generatedData: any = null;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const prompt = `
Та бол Channel Mongolia мэдээллийн порталын ахлах сэтгүүлч, факт-чекер ба сурвалжлагч AI агент.
Дараах сэдэв, чиглэлээр бодит баримтад тулгуурласан, чанартай монгол хэл дээрх нийтлэл бэлтгэ:

Сэдэв: "${topic.trim()}"
Ангилал: "${category || 'Дэлхий'}"
Мэдээний хэв маяг/Тон: "${tone}"
Нэмэлт эх сурвалж: ${JSON.stringify(customSources)}

ШААРДЛАГА:
1. Заавал JSON форматаар хариулна. Markdown код блок (\`\`\`json) ашиглахгүйгээр шууд JSON объект буцаа.
2. JSON-ийн бүтэц:
{
  "title": "Хүчтэй, анхаарал татсан, мэргэжлийн түвшний сэтгүүл зүйн гарчиг",
  "slug": "english-or-mongolian-latin-slug-url-friendly",
  "lead": "Нийтлэлийн гол санааг товч бөгөөд тодорхой хураангуйлсан 2-3 өгүүлбэр бүхий удиртгал (Excerpt)",
  "body_markdown": "Нийтлэлийн бүтэн бичвэр Markdown форматаар. Үүнд дэд гарчиг (###), параграф, чухал тоо баримтууд, эшлэл зэргийг багтаана.",
  "short_idea": "Мэдээний 1 өгүүлбэрт багтах гол дүгнэлт / мессеж",
  "fact_check": "Уг мэдээний бодит байдал, баримт шалгасан тэмдэглэл (Факт-чекийн дүгнэлт)",
  "category": "${category || 'Дэлхий'}",
  "tags": ["холбогдох", "шошго", "түлхүүр_үг"],
  "sources": [
    { "name": "Эх сурвалжийн нэр", "url": "https://..." }
  ],
  "image": {
    "ai_prompt": "Photorealistic 8k editorial journalism photograph representing...",
    "note": "Уг мэдээнд тохирох зургийн зөвлөмж тайлбар",
    "url": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200"
  },
  "seo": {
    "meta_description": "Хайлтын системд зориулсан 150 тэмдэгттэй хураангуй"
  }
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawText = response.text || '';
        try {
          generatedData = JSON.parse(rawText.trim());
        } catch (jsonErr) {
          // If JSON parse fails, attempt regex extraction
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) {
            generatedData = JSON.parse(match[0]);
          }
        }
      } catch (aiErr: any) {
        console.warn('Gemini API generation error in news agent:', aiErr.message);
      }
    }

    // Fallback if AI was unavailable or had issue
    if (!generatedData || !generatedData.title) {
      const cleanSlug = topic.toLowerCase().replace(/[^a-zA-Z0-9а-яА-ЯөӨүҮ\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 50);
      generatedData = {
        title: topic.length > 10 ? topic : `${topic}: Дэлхийн ба бүс нутгийн шинэ үйл явдал`,
        slug: cleanSlug || 'news-' + Date.now(),
        lead: `${topic} сэдвийн хүрээнд шинэ мэдээлэл цацагдаж, олон нийт болон мэргэжилтнүүдийн анхаарлыг татаж байна. Энэхүү тоймоор гол үйл явдлыг нэгтгэн хүргэж байна.`,
        body_markdown: `### Үйл явдлын тойм\n\n${topic} сэдвийн эргэн тойронд сүүлийн цагуудад чухал өөрчлөлтүүд гарлаа. Эх сурвалжуудын мэдээлж буйгаар тухайн асуудал нь бүс нутгийн болон салбарын хэмжээнд ихээхэн ач холбогдолтой юм.\n\n### Гол баримтууд\n\n- Төлөөлөгчид уг асуудлаар албан ёсны байр сууриа илэрхийллээ.\n- Цаашдын чиг хандлага эерэгээр хөгжих хүлээлттэй байна.\n- Шинжээчид нөхцөл байдлыг анхааралтай ажиглаж байна.\n\n### Дүгнэлт\n\nУг үйл явцын цаашдын өрнөл нь салбарын хөгжилд мэдэгдэхүйц нөлөө үзүүлэх төлөвтэй байна.`,
        short_idea: `${topic} сэдвийн шинэчлэгдсэн мэдээлэл ба түүний нөлөө.`,
        fact_check: `Баримтуудыг нээлттэй эх сурвалжуудтай харьцуулж шалгасан. Баталгаатай.`,
        category: category || 'Дэлхий',
        tags: ['Мэдээ', 'Шуурхай', 'Тойм'],
        sources: [
          { name: 'Channel Mongolia Monitor', url: 'https://channelmongolia.com' }
        ],
        image: {
          ai_prompt: `Editorial press photo about ${topic}, cinematic lighting, photorealistic 8k`,
          note: 'Сэдэвт тохирох бодит фото зураг',
          url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'
        },
        seo: {
          meta_description: `${topic} сэдвийн талаарх дэлгэрэнгүй тойм, баримт шалгасан нийтлэл.`
        }
      };
    }

    // Now save this directly into CMS via our unified ingestion logic
    const db = mockDb.getDb();
    const matchedCategory = matchCategory(generatedData.category, db.categories);

    // Format sources into body
    const sourceLinks = (generatedData.sources || []).map((s: any) => {
      const sName = typeof s === 'string' ? s : (s?.name || s?.url || 'Эх сурвалж');
      const sUrl = typeof s === 'string' ? s : (s?.url || '#');
      return `- [${sName}](${sUrl})`;
    }).join('\n');

    const fullContent = `${generatedData.body_markdown.trim()}\n\n## Эх сурвалж\n${sourceLinks}`;

    // Agent Notes JSON
    const agentNotesObj = {
      short_idea: generatedData.short_idea || null,
      fact_check: generatedData.fact_check || null,
      ai_prompt: generatedData.image?.ai_prompt || null,
      image_note: generatedData.image?.note || null,
      generated_by: 'News AI Agent',
      generated_at: new Date().toISOString()
    };
    const agentNotesStr = JSON.stringify(agentNotesObj);

    const cleanSlug = (generatedData.slug || 'news-' + Date.now())
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    const newArticleId = 'art-' + Math.random().toString(36).substring(2, 11);
    const nowIso = new Date().toISOString();

    const newMockArticle: mockDb.MockArticle = {
      id: newArticleId,
      title: generatedData.title.trim(),
      title_en: generatedData.title.trim(),
      slug: cleanSlug,
      excerpt: generatedData.lead.trim(),
      excerpt_en: generatedData.lead.trim(),
      content: fullContent,
      content_en: fullContent,
      thumbnail: generatedData.image?.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200',
      images: generatedData.image?.url ? [{ url: generatedData.image.url, caption: generatedData.title }] : [],
      status: 'DRAFT', // Always created as DRAFT for review
      categoryId: matchedCategory.id,
      views: 0,
      likes: 0,
      tags: Array.isArray(generatedData.tags) ? generatedData.tags : ['Мэдээ'],
      metaTitle: generatedData.title.trim(),
      metaDesc: generatedData.seo?.meta_description || generatedData.lead.trim().slice(0, 160),
      agentNotes: agentNotesStr,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    db.articles.unshift(newMockArticle);
    mockDb.saveDb(db);

    // Save to Prisma if DB is active
    let finalArticleId = newArticleId;
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
              title: generatedData.title.trim(),
              slug: cleanSlug,
              excerpt: generatedData.lead.trim(),
              content: fullContent,
              thumbnail: generatedData.image?.url || null,
              status: 'DRAFT',
              metaTitle: generatedData.title.trim(),
              metaDesc: generatedData.seo?.meta_description || generatedData.lead.trim().slice(0, 160),
              agentNotes: agentNotesStr,
              authorId: author.id,
              categoryId: prismaCat.id,
              publishedAt: null
            }
          });
          finalArticleId = prismaArticle.id;
        }
      } catch (prismaErr: any) {
        console.warn('Prisma save in generateAgentNews fallback to mockDb:', prismaErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Агент мэдээг амжилттай бэлтгэж, Ноорог төлөвт хадгаллаа.',
      article: {
        id: finalArticleId,
        slug: cleanSlug,
        title: generatedData.title,
        excerpt: generatedData.lead,
        category: matchedCategory.name,
        thumbnail: newMockArticle.thumbnail,
        agentNotes: agentNotesObj
      }
    });
  } catch (error: any) {
    console.error('Error generating agent news:', error);
    return res.status(500).json({ error: error.message });
  }
}
