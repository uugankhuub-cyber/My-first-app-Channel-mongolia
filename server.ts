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

  // Articles (Public)
  app.get('/api/articles', articleHandlers.getArticles);
  app.get('/api/articles/:slug', async (req, res) => {
    const param = req.params.slug;
    const art = await db.getArticleByIdOrSlug(param);
    if (!art) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Increment view count in Firestore
    await db.incrementArticleViews(art.id);

    const categories = await db.getCategories();
    const cat = categories.find(c => c.id === art.categoryId || c.slug === art.categoryId);
    
    res.json({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      content: art.content,
      thumbnail: art.thumbnail,
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
  app.get('/api/admin/articles/:id', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.getAdminArticleById);
  app.post('/api/admin/articles', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.createArticle);
  app.put('/api/admin/articles/:id', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.updateArticle);
  app.delete('/api/admin/articles/:id', authenticate, authorize(['ADMIN']), articleHandlers.deleteArticle);

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

  // 4. Vite / Static
  const distPath = path.join(process.cwd(), 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || isRunningFromDist;

  if (isProduction) {
    console.log('[SERVER] Production mode active: serving pre-built static assets from dist.');
    app.use(express.static(distPath, {
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      }
    }));
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
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
