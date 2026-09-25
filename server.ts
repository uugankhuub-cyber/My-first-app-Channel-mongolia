import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { authenticate, authorize } from './middleware/auth.ts';
import * as db from './lib/firestore-db.ts';

// Handlers
import * as authHandlers from './api/auth-handlers.ts';
import * as articleHandlers from './api/article-handlers.ts';
import * as adminHandlers from './api/admin-handlers.ts';
import contentHandler from './api/content.ts';
import chatHandler from './api/chat.ts';
import weatherHandler from './api/weather.ts';
import ratesHandler from './api/rates.ts';
import uploadHandler from './api/upload.ts';
import { handleCreateNews, handleNewsHealth, handleNewsInfo } from './api/news.ts';
import * as agentHandlers from './api/agent-handlers.ts';
import { handleGetVideos, handleUpdateVideoSettings } from './api/video-handlers.ts';

async function startServer() {
  const isRunningFromDist = Boolean(
    process.argv[1] && (
      process.argv[1].endsWith('.cjs') || 
      process.argv[1].endsWith('.js') || 
      process.argv[1].includes('dist')
    )
  );
  if (isRunningFromDist && !process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  const app = express();
  app.set('trust proxy', 1); // Trust the first proxy (NGINX)
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // 1. Security & Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Vite handles CSP in dev
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginEmbedderPolicy: false,
  }));
  app.use((_req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
  });
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));

  // Rate Limiting
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Хэт олон удаа нэвтрэх оролдлого хийсэн байна',
        message: '15 минутын дараа дахин оролдоно уу'
      });
    }
  });

  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'AI хүсэлтийн хязгаар хэтэрлээ',
        message: 'Түр хүлээгээд дахин оролдоно уу'
      });
    }
  });

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Хүсэлтийн хязгаар хэтэрлээ',
        message: 'Түр хүлээгээд дахин оролдоно уу (Too many requests)'
      });
    }
  });

  app.use('/api/', generalLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  app.use('/api/chat', aiLimiter);
  app.use('/api/admin-ai-content', aiLimiter);

  // 2. Firestore Startup Initialization
  // Seeding ONLY creates categories if they do not exist; it NEVER deletes or replaces articles.
  console.log('[STARTUP] Initializing Firestore data layer...');
  try {
    await db.ensureDefaultCategories();
    await db.ensureAdminUser();
    console.log('[STARTUP] Firestore initialized: default categories and admin user verified.');
  } catch (initErr: any) {
    console.error('[STARTUP] Firestore initialization error:', initErr.message);
  }

  // 3. API Routes

  // Helper to wrap legacy handlers
  const wrapHandler = (handler: any) => async (req: any, res: any, next: any) => {
    if (typeof handler !== 'function') {
      return res.status(500).json({ error: 'Handler not found' });
    }
    try {
      await handler(req, res);
    } catch (err: any) {
      console.error('API Error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
      }
    }
  };

  app.all('/api/content', wrapHandler(contentHandler));
  app.all('/api/rates', wrapHandler(ratesHandler));
  app.all('/api/weather', wrapHandler(weatherHandler));
  app.all('/api/chat', wrapHandler(chatHandler));
  app.all('/api/upload', wrapHandler(uploadHandler));

  app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
    console.log('New contact message:', { name, email, message });
    res.json({ success: true });
  });

  // Auth
  app.post('/api/auth/login', authHandlers.login);
  app.post('/api/auth/google-admin', authHandlers.googleAdminLogin);
  app.post('/api/auth/register', authHandlers.register);
  app.post('/api/auth/logout', authHandlers.logout);
  app.get('/api/auth/me', authHandlers.getMe);
  app.post('/api/admin-ai-content', adminHandlers.askAI);
  app.post('/api/admin-upload', adminHandlers.adminUpload);

  // Serve static uploads
  const devUploads = path.join(process.cwd(), 'public', 'uploads');
  const distUploads = path.join(process.cwd(), 'dist', 'uploads');
  if (!fs.existsSync(devUploads)) fs.mkdirSync(devUploads, { recursive: true });
  if (!fs.existsSync(distUploads)) fs.mkdirSync(distUploads, { recursive: true });
  app.use('/uploads', express.static(devUploads));
  app.use('/uploads', express.static(distUploads));

  // Requirement 3: Missing static files in /uploads must return 404, not index.html
  app.all('/uploads/{*path}', (_req, res) => {
    res.status(404).type('text/plain').send('File not found');
  });

  // Articles (Public)
  app.get('/api/articles', articleHandlers.getArticles);
  app.get('/api/articles/:slug', async (req, res) => {
    const param = req.params.slug;
    const art = await db.getArticleByIdOrSlug(param);
    // SECURITY: Public endpoint only serves PUBLISHED articles
    if (!art || art.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Not found' });
    }

    // Increment view count in Firestore
    await db.incrementArticleViews(art.id);

    const categories = await db.getCategories();
    const cat = categories.find(c => c.id === art.categoryId || c.slug === art.categoryId);
    
    // Resolve thumbnail with fallback for missing /uploads/... images
    const resolveThumb = (thumb?: string | null): string => {
      if (!thumb || typeof thumb !== 'string' || !thumb.trim()) {
        return '/placeholder-article.svg';
      }
      const clean = thumb.trim();
      if (clean.startsWith('/uploads/')) {
        const rel = clean.replace(/^\//, '');
        const pubFile = path.join(devUploads, rel.replace(/^uploads\//, ''));
        const distFile = path.join(distUploads, rel.replace(/^uploads\//, ''));
        if (!fs.existsSync(pubFile) && !fs.existsSync(distFile)) {
          return '/placeholder-article.svg';
        }
      }
      return clean;
    };

    // Strictly no agentNotes in public responses
    res.json({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      content: art.content,
      thumbnail: resolveThumb(art.thumbnail),
      images: art.images || [],
      status: art.status,
      authorId: 'admin-1',
      author: { email: 'uugankhuub@gmail.com' },
      categoryId: art.categoryId,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
      publishedAt: art.publishedAt,
      createdAt: art.createdAt,
      updatedAt: art.updatedAt
    });
  });

  // Articles (Admin/Editor)
  app.get('/api/admin/articles', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.getAdminArticles);
  app.get('/api/admin/articles/:id', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.getAdminArticleById);
  app.post('/api/admin/articles', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.createArticle);
  app.put('/api/admin/articles/:id', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.updateArticle);
  app.delete('/api/admin/articles/:id', authenticate, authorize(['ADMIN']), articleHandlers.deleteArticle);
  app.post('/api/admin/articles/:id/facebook-retry', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.retryFacebookPost);

  // Dashboard Stats
  app.get('/api/admin/stats', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res) => {
    try {
      const articles = await db.getArticles();
      const users = await db.getUsers();
      const articleCount = articles.length;
      const userCount = users.length;
      const draftCount = articles.filter(art => art.status === 'DRAFT').length;
      res.json({ articleCount, userCount, draftCount });
    } catch (err: any) {
      console.error('[ADMIN/STATS] Error:', err.message);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // --- CATEGORIES API ---
  app.get('/api/admin/categories', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    try {
      const categories = await db.getCategories();
      const articles = await db.getArticles();
      const result = categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        articleCount: articles.filter(a => a.categoryId === c.id || a.categoryId === c.slug).length
      }));
      res.json(result);
    } catch (err: any) {
      console.error('[ADMIN/CATEGORIES] Error:', err.message);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.post('/api/admin/categories', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const { name, slug } = req.body;
    try {
      const newCat = await db.createCategory({ name, slug });
      res.json(newCat);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/categories/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const { name, slug } = req.body;
    const { id } = req.params;
    try {
      const updated = await db.updateCategory(id, { name, slug });
      if (updated) return res.json(updated);
      res.status(404).json({ error: 'Category not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/categories/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { id } = req.params;
    try {
      await db.deleteCategory(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- TAGS API ---
  app.get('/api/admin/tags', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    try {
      const tags = await db.getTags();
      const articles = await db.getArticles();
      const result = tags.map(t => ({
        id: t.id,
        name: t.name,
        articleCount: articles.filter(a => a.tags && Array.isArray(a.tags) && a.tags.includes(t.name)).length
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/tags', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const { name } = req.body;
    try {
      const newTag = await db.createTag(name);
      res.json(newTag);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/tags/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const { name } = req.body;
    const { id } = req.params;
    try {
      const updated = await db.updateTag(id, name);
      if (updated) return res.json(updated);
      res.status(404).json({ error: 'Tag not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/tags/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { id } = req.params;
    try {
      await db.deleteTag(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- COMMENTS API ---
  app.get('/api/admin/comments', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    try {
      const comments = await db.getComments();
      res.json(comments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/comments/:id/status', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const { status } = req.body;
    const { id } = req.params;
    try {
      const updated = await db.updateCommentStatus(id, status);
      if (updated) return res.json(updated);
      res.status(404).json({ error: 'Comment not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/comments/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { id } = req.params;
    try {
      await db.deleteComment(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- USERS API ---
  app.get('/api/admin/users', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    try {
      const users = await db.getUsers();
      res.json(users.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        failedLoginAttempts: u.failedLoginAttempts || 0,
        lockedUntil: u.lockedUntil || null,
        createdAt: u.createdAt
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/users', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { email, password, role } = req.body;
    try {
      const existing = await db.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'User already exists' });
      }
      const { hashPassword } = await import('./lib/auth.ts');
      const hashedPassword = await hashPassword(password);
      const newUser = await db.createUser({
        email,
        passwordHash: hashedPassword,
        role: role || 'USER',
        emailVerified: true
      });
      res.json({ id: newUser.id, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/users/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { role, isLocked } = req.body;
    const { id } = req.params;
    try {
      const updated = await db.updateUser(id, {
        role,
        lockedUntil: isLocked ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
        failedLoginAttempts: isLocked ? 5 : 0
      });
      if (updated) {
        return res.json({ id: updated.id, email: updated.email, role: updated.role, isLocked });
      }
      res.status(404).json({ error: 'User not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/users/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { id } = req.params;
    try {
      await db.deleteUser(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- SETTINGS API ---
  app.get('/api/admin/settings', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    try {
      const settings = await db.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/settings', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const updatedSettings = req.body;
    try {
      const result = await db.updateSettings(updatedSettings);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- SECURITY LOGS ---
  app.get('/api/admin/logs', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    try {
      const logs = await db.getAuditLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- NEWS API (Server endpoints for ingestion and health check) ---
  app.get('/api/news', handleNewsInfo);
  app.get('/api/news/health', handleNewsHealth);
  app.post('/api/news', handleCreateNews);

  // --- NEWS AI AGENT (Admin Control Panel Endpoints) ---
  app.get('/api/admin/agent/status', authenticate, authorize(['ADMIN', 'EDITOR']), agentHandlers.getAgentStatus);
  app.post('/api/admin/agent/generate', authenticate, authorize(['ADMIN', 'EDITOR']), agentHandlers.generateAgentNews);
  app.post('/api/admin/agent/test-connection', authenticate, authorize(['ADMIN', 'EDITOR']), agentHandlers.testAgentConnection);

  // --- VIDEOS API (Channel YouTube RSS Feed + Firestore Settings) ---
  app.get('/api/videos', handleGetVideos);
  app.post('/api/videos/settings', authenticate, authorize(['ADMIN', 'EDITOR']), handleUpdateVideoSettings);
  app.post('/api/admin/videos/settings', authenticate, authorize(['ADMIN', 'EDITOR']), handleUpdateVideoSettings);

  // Requirement 3: Unknown /api/* routes must return JSON 404, not the SPA HTML
  app.all('/api/{*path}', (_req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'Unknown API endpoint'
    });
  });

  // Dynamic Sitemap, Robots.txt & RSS using process.env.SITE_URL with required fallback
  const SITE_URL = (process.env.SITE_URL || 'https://my-first-app-channel-mongolia-production.up.railway.app').replace(/\/+$/, '');

  // 1. GET /robots.txt - Allow all, disallow /admin and /api, include Sitemap
  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`);
  });

  // 2. GET /sitemap.xml - Real XML (home, each category page, every PUBLISHED article with <lastmod>)
  app.get('/sitemap.xml', async (_req, res) => {
    try {
      const allArticles = await db.getArticles();
      const publishedArticles = allArticles.filter(a => a.status === 'PUBLISHED');
      const categories = await db.getCategories();
      const now = new Date().toISOString().split('T')[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Home
      xml += `  <url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
      
      // Category pages
      xml += `  <url><loc>${SITE_URL}/categories</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
      for (const cat of categories) {
        if (cat.slug) {
          xml += `  <url><loc>${SITE_URL}/${encodeURIComponent(cat.slug)}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
          xml += `  <url><loc>${SITE_URL}/category/${encodeURIComponent(cat.slug)}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
        }
      }

      // Other public pages
      xml += `  <url><loc>${SITE_URL}/video</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
      xml += `  <url><loc>${SITE_URL}/privacy</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;

      // Every PUBLISHED article (never drafts)
      for (const art of publishedArticles) {
        const slug = art.slug || art.id;
        const artUrl = `${SITE_URL}/article/${encodeURIComponent(slug)}`;
        const lastMod = (art.updatedAt || art.publishedAt || art.createdAt || now).split('T')[0];
        xml += `  <url><loc>${artUrl}</loc><lastmod>${lastMod}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
      }

      xml += `</urlset>`;
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.send(xml);
    } catch (err: any) {
      console.error('[SEO] Error generating sitemap.xml:', err);
      res.status(500).type('text/plain').send('Error generating sitemap');
    }
  });

  // 3. GET /rss.xml - RSS 2.0 of the latest 30 PUBLISHED articles with image enclosures
  app.get(['/rss.xml', '/feed.xml'], async (_req, res) => {
    try {
      const allArticles = await db.getArticles();
      const published = allArticles.filter(a => a.status === 'PUBLISHED');

      // Sort latest 30 published articles
      published.sort((a, b) => {
        const timeA = new Date(a.publishedAt || a.createdAt).getTime();
        const timeB = new Date(b.publishedAt || b.createdAt).getTime();
        return timeB - timeA;
      });

      const latest30 = published.slice(0, 30);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
      xml += `  <channel>\n`;
      xml += `    <title>Channel Mongolia</title>\n`;
      xml += `    <link>${SITE_URL}</link>\n`;
      xml += `    <description>Channel Mongolia – шинжлэх ухаан, түүх, байгаль, спорт, урлагийн сонирхолтой мэдээ, мэдлэгийг монгол хэлээр.</description>\n`;
      xml += `    <language>mn</language>\n`;
      xml += `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n`;

      for (const art of latest30) {
        const slug = art.slug || art.id;
        const artUrl = `${SITE_URL}/article/${encodeURIComponent(slug)}`;
        const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : (art.createdAt ? new Date(art.createdAt).toUTCString() : new Date().toUTCString());
        const lead = art.excerpt || (art.content ? art.content.substring(0, 200).replace(/\s+/g, ' ').trim() : art.title);

        let imgUrl = `${SITE_URL}/placeholder-article.svg`;
        let imgType = 'image/svg+xml';
        if (art.thumbnail && typeof art.thumbnail === 'string' && art.thumbnail.trim()) {
          const thumb = art.thumbnail.trim();
          if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
            imgUrl = thumb;
          } else if (thumb.startsWith('/')) {
            imgUrl = `${SITE_URL}${thumb}`;
          } else {
            imgUrl = `${SITE_URL}/${thumb}`;
          }

          if (thumb.includes('.png')) imgType = 'image/png';
          else if (thumb.includes('.webp')) imgType = 'image/webp';
          else if (thumb.includes('.gif')) imgType = 'image/gif';
          else if (thumb.includes('.svg')) imgType = 'image/svg+xml';
          else imgType = 'image/jpeg';
        }

        xml += `    <item>\n`;
        xml += `      <title><![CDATA[${art.title}]]></title>\n`;
        xml += `      <link>${artUrl}</link>\n`;
        xml += `      <guid isPermaLink="true">${artUrl}</guid>\n`;
        xml += `      <pubDate>${pubDate}</pubDate>\n`;
        xml += `      <description><![CDATA[${lead}]]></description>\n`;
        xml += `      <enclosure url="${imgUrl.replace(/&/g, '&amp;')}" type="${imgType}" length="0" />\n`;
        xml += `    </item>\n`;
      }

      xml += `  </channel>\n`;
      xml += `</rss>`;
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.send(xml);
    } catch (err: any) {
      console.error('[SEO] Error generating rss.xml:', err);
      res.status(500).type('text/plain').send('Error generating RSS');
    }
  });

  // 4. Vite / Static & OpenGraph Server-side Meta Rendering
  const distPath = path.join(process.cwd(), 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || isRunningFromDist;

  const escapeHtml = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  // Requirement 3: Mongolian "Нийтлэл олдсонгүй" 404 HTML Page with link to home
  const renderNotFoundHtml = (_slug?: string): string => `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Нийтлэл олдсонгүй - Channel Mongolia</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #0b0e18;
      color: #e8ecf4;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: #12162a;
      border: 1px solid #1e2440;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      width: 80px;
      height: 80px;
      line-height: 80px;
      background: rgba(37, 99, 235, 0.12);
      color: #3b82f6;
      border: 1px solid rgba(37, 99, 235, 0.25);
      border-radius: 24px;
      font-size: 28px;
      font-weight: 900;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    p {
      color: #8892a4;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 12px;
      transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #1a1f36;
      border: 1px solid #1e2440;
      color: #e8ecf4;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 20px;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">404</div>
    <h1>Нийтлэл олдсонгүй</h1>
    <p>Уучлаарай, таны хайсан нийтлэл олдсонгүй эсвэл хаяг нь буруу байна.</p>
    <div class="actions">
      <a href="/" class="btn-primary">Нүүр хуудас руу буцах</a>
      <a href="/categories" class="btn-secondary">Бүх ангилал</a>
    </div>
  </div>
</body>
</html>`;

  // Server-side HTML renderer injecting real og:title, og:description, og:image
  const renderArticleWithMeta = async (req: express.Request, res: express.Response, next: express.NextFunction, viteInstance?: any) => {
    try {
      const rawSlug = req.params.slug;
      const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
      if (!slug) {
        return next();
      }
      const article = await db.getArticleByIdOrSlug(slug);

      // Requirement 3: /article/<slug> for a non-existent slug must return HTTP 404 with Mongolian "Нийтлэл олдсонгүй" page and a link to home
      if (!article || article.status !== 'PUBLISHED') {
        res.status(404);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
        return res.send(renderNotFoundHtml(slug));
      }

      const templatePath = isProduction 
        ? path.join(distPath, 'index.html') 
        : path.join(process.cwd(), 'index.html');

      if (!fs.existsSync(templatePath)) {
        return next();
      }

      let html = fs.readFileSync(templatePath, 'utf-8');

      if (!isProduction && viteInstance) {
        try {
          html = await viteInstance.transformIndexHtml(req.originalUrl || req.url, html);
        } catch (viteErr: any) {
          console.warn('[VITE] transformIndexHtml error:', viteErr.message);
        }
      }

      const defaultDesc = 'Channel Mongolia – шинжлэх ухаан, түүх, байгаль, спорт, урлагийн сонирхолтой мэдээ, мэдлэгийг монгол хэлээр.';
      let title = article.title || 'Channel Mongolia';
      let description = article.excerpt || (article.content ? article.content.substring(0, 180).replace(/\s+/g, ' ').trim() : defaultDesc);
      let pageUrl = `${SITE_URL}/article/${encodeURIComponent(article.slug || article.id)}`;
      let imageUrl = `${SITE_URL}/placeholder-article.svg`;

      if (article.thumbnail && typeof article.thumbnail === 'string' && article.thumbnail.trim()) {
        const thumb = article.thumbnail.trim();
        if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
          imageUrl = thumb;
        } else if (thumb.startsWith('/uploads/')) {
          const rel = thumb.replace(/^\//, '');
          const pubExists = fs.existsSync(path.join(devUploads, rel.replace(/^uploads\//, '')));
          const distExists = fs.existsSync(path.join(distUploads, rel.replace(/^uploads\//, '')));
          if (pubExists || distExists) {
            imageUrl = `${SITE_URL}${thumb}`;
          } else {
            imageUrl = `${SITE_URL}/placeholder-article.svg`;
          }
        } else {
          imageUrl = `${SITE_URL}${thumb.startsWith('/') ? '' : '/'}${thumb}`;
        }
      }

      const safeTitle = escapeHtml(title);
      const safeDesc = escapeHtml(description);
      const safeImage = escapeHtml(imageUrl);
      const safeUrl = escapeHtml(pageUrl);

      // Update <title>
      if (html.includes('<title>')) {
        html = html.replace(/<title>.*?<\/title>/i, `<title>${safeTitle} - Channel Mongolia</title>`);
      }

      // Remove static description meta if present
      html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, '');

      const metaTags = `
    <!-- Dynamic OpenGraph & Twitter Meta Tags (Server-Rendered for Social Crawlers) -->
    <link rel="canonical" href="${safeUrl}" />
    <meta name="description" content="${safeDesc}" />
    <meta property="og:site_name" content="Channel Mongolia" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />`;

      html = html.replace('</head>', `${metaTags}\n  </head>`);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      return res.send(html);
    } catch (err: any) {
      console.error('[OG] Error serving article with OpenGraph tags:', err);
      next();
    }
  };

  if (isProduction) {
    console.log('[SERVER] Production mode active: serving pre-built static assets from dist.');
    // Serve real article paths with OpenGraph tags
    app.get(['/article/:slug', '/niitlel/:slug'], (req, res, next) => {
      renderArticleWithMeta(req, res, next);
    });

    app.use(express.static(distPath, {
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      }
    }));

    // Requirement 3: Missing static files must return 404, not index.html
    app.all(/\.(jpg|jpeg|png|gif|webp|svg|ico|css|js|map|woff|woff2|ttf|json|xml|txt)$/i, (_req, res) => {
      res.status(404).type('text/plain').send('Static Asset Not Found');
    });

    app.get('*all', (_req, res) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('[SERVER] Development mode active: mounting Vite dev middleware.');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Serve real article paths with OpenGraph tags even in dev
    app.get(['/article/:slug', '/niitlel/:slug'], (req, res, next) => {
      renderArticleWithMeta(req, res, next, vite);
    });

    // Requirement 3: Missing static image/asset files must return 404, not index.html
    app.all(/\.(jpg|jpeg|png|gif|webp|ico|woff|woff2|ttf)$/i, (_req, res) => {
      res.status(404).type('text/plain').send('Static Asset Not Found');
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
