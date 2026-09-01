import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { prisma, checkConnection, getDbStatus } from './lib/prisma.ts';
import { hashPassword } from './lib/auth.ts';
import { authenticate, authorize } from './middleware/auth.ts';

// Handlers
import * as authHandlers from './api/auth-handlers.ts';
import * as articleHandlers from './api/article-handlers.ts';
import * as adminHandlers from './api/admin-handlers.ts';
import contentHandler from './api/content.ts';
import chatHandler from './api/chat.ts';
import weatherHandler from './api/weather.ts';
import ratesHandler from './api/rates.ts';
import uploadHandler from './api/upload.ts';
import * as mockDb from './lib/mock-db.ts';

async function startServer() {
  const app = express();
  app.set('trust proxy', 1); // Trust the first proxy (NGINX)
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // 1. Security & Middleware
  app.set('trust proxy', 1); // Required for express-rate-limit behind proxy
  app.use(helmet({
    contentSecurityPolicy: false, // Vite handles CSP in dev
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Limit each IP to 100 requests per window
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later'
      });
    }
  });
  app.use('/api/', limiter);

  // 2. Initial Admin Creation & Database Connection Verification
  await checkConnection();

  const initAdmin = async () => {
    const isDbConnected = getDbStatus();
    console.log(`[STARTUP] Prisma DB connected status: ${isDbConnected}`);

    const fallbackEmail = 'uugankhuub@gmail.com';
    const fallbackPassword = 'Admin123!';

    let adminEmail = process.env.INITIAL_ADMIN_EMAIL || fallbackEmail;
    if (adminEmail.startsWith('INITIAL_ADMIN_EMAIL=')) {
      adminEmail = adminEmail.replace('INITIAL_ADMIN_EMAIL=', '');
    }
    let adminPassword = process.env.INITIAL_ADMIN_PASSWORD || fallbackPassword;
    if (adminPassword.startsWith('INITIAL_ADMIN_PASSWORD=')) {
      adminPassword = adminPassword.replace('INITIAL_ADMIN_PASSWORD=', '');
    }

    console.log(`[STARTUP] Initial Admin Credentials Configured - Email: "${adminEmail}", Password: "${adminPassword}"`);
    console.log(`[STARTUP] Fallback Admin Credentials Configured - Email: "${fallbackEmail}", Password: "${fallbackPassword}"`);

    if (!isDbConnected) {
      console.warn('Database is not healthy/connected. Skipping Prisma admin initialization.');
      return;
    }

    try {
      // Clean any garbage "INITIAL_ADMIN_EMAIL=..." records from Prisma
      try {
        const deleteCount = await prisma.user.deleteMany({
          where: {
            email: {
              startsWith: 'INITIAL_ADMIN_EMAIL='
            }
          }
        });
        if (deleteCount.count > 0) {
          console.log(`[STARTUP-DB] Deleted ${deleteCount.count} garbage admin records from Prisma.`);
        }
      } catch (e: any) {
        console.error('[STARTUP-DB] Error cleaning garbage admin records from Prisma:', e.message);
      }

      // 1. Create or update fallback admin in Prisma
      const fallbackExists = await prisma.user.findUnique({ where: { email: fallbackEmail } });
      const hashedFallbackPassword = await hashPassword(fallbackPassword);
      if (!fallbackExists) {
        console.log(`[STARTUP-DB] Creating fallback admin account in Prisma: ${fallbackEmail}`);
        await prisma.user.create({
          data: {
            email: fallbackEmail,
            password: hashedFallbackPassword,
            role: 'ADMIN',
            emailVerified: true,
            forcePasswordChange: false,
          },
        });
      } else {
        console.log(`[STARTUP-DB] Fallback admin already exists in Prisma: ${fallbackEmail}. Ensuring role is ADMIN and resetting password.`);
        await prisma.user.update({
          where: { email: fallbackEmail },
          data: {
            role: 'ADMIN',
            password: hashedFallbackPassword,
          }
        });
      }

      // 2. Create or update env-configured admin if different
      if (adminEmail !== fallbackEmail) {
        const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
        const hashedPassword = await hashPassword(adminPassword);
        if (!adminExists) {
          console.log(`[STARTUP-DB] Creating configured admin account in Prisma: ${adminEmail}`);
          await prisma.user.create({
            data: {
              email: adminEmail,
              password: hashedPassword,
              role: 'ADMIN',
              emailVerified: true,
              forcePasswordChange: false,
            },
          });
        } else {
          console.log(`[STARTUP-DB] Configured admin already exists in Prisma: ${adminEmail}. Ensuring role is ADMIN.`);
          await prisma.user.update({
            where: { email: adminEmail },
            data: {
              role: 'ADMIN',
            }
          });
        }
      }
    } catch (err: any) {
      console.error('[STARTUP-DB] Database query error in initAdmin:', err.message);
    }
  };
  
  await initAdmin();
  await mockDb.ensureAdmin();

  // 3. API Routes

  // Helper to wrap legacy handlers (Vercel-style) into Express-style
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
  app.post('/api/auth/register', authHandlers.register);
  app.post('/api/auth/logout', authHandlers.logout);
  app.get('/api/auth/me', authHandlers.getMe);
  app.post('/api/admin-ai-content', adminHandlers.askAI);
  app.post('/api/admin-upload', adminHandlers.adminUpload);

  // Articles (Public)
  app.get('/api/articles', articleHandlers.getArticles);
  app.get('/api/articles/:slug', async (req, res) => {
    if (getDbStatus()) {
      try {
        const article = await prisma.article.findUnique({
          where: { slug: req.params.slug },
          include: { author: { select: { email: true } }, category: true }
        });
        if (article) return res.json(article);
      } catch (dbError: any) {
        console.error('Database slug fetch failed, trying mock fallback:', dbError.message);
      }
    }

    // FALLBACK TO MOCK DB
    const db = mockDb.getDb();
    const index = db.articles.findIndex(art => art.slug === req.params.slug);
    if (index === -1) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Persist a view increment in mock mode for dynamic analytics!
    db.articles[index].views += 1;
    mockDb.saveDb(db);

    const art = db.articles[index];
    const cat = db.categories.find(c => c.id === art.categoryId);
    res.json({
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
    });
  });

  // Articles (Admin/Editor)
  app.post('/api/admin/articles', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.createArticle);
  app.put('/api/admin/articles/:id', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.updateArticle);
  app.delete('/api/admin/articles/:id', authenticate, authorize(['ADMIN']), articleHandlers.deleteArticle);

  // Dashboard Stats
  app.get('/api/admin/stats', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res) => {
    if (getDbStatus()) {
      try {
        const articleCount = await prisma.article.count();
        const userCount = await prisma.user.count();
        const draftCount = await prisma.article.count({ where: { status: 'DRAFT' } });
        return res.json({ articleCount, userCount, draftCount });
      } catch (dbError: any) {
        console.error('Database stats query failed, trying mock fallback:', dbError.message);
      }
    }

    // FALLBACK TO MOCK DB
    const db = mockDb.getDb();
    const articleCount = db.articles.length;
    const userCount = db.users.length;
    const draftCount = db.articles.filter(art => art.status === 'DRAFT').length;
    res.json({ articleCount, userCount, draftCount });
  });

  // --- CATEGORIES API ---
  app.get('/api/admin/categories', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    if (getDbStatus()) {
      try {
        const categories = await prisma.category.findMany({
          include: { _count: { select: { articles: true } } }
        });
        return res.json(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, articleCount: c._count.articles })));
      } catch (e) {}
    }
    const db = mockDb.getDb();
    const result = db.categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      articleCount: db.articles.filter(a => a.categoryId === c.id).length
    }));
    res.json(result);
  });

  app.post('/api/admin/categories', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const { name, slug } = req.body;
    if (getDbStatus()) {
      try {
        const category = await prisma.category.create({ data: { name, slug } });
        return res.json(category);
      } catch (e) {}
    }
    const db = mockDb.getDb();
    const newCat = { id: 'cat-' + Math.random().toString(36).substring(2, 9), name, slug };
    db.categories.push(newCat);
    mockDb.saveDb(db);
    res.json(newCat);
  });

  app.put('/api/admin/categories/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const { name, slug } = req.body;
    const { id } = req.params;
    if (getDbStatus()) {
      try {
        const category = await prisma.category.update({ where: { id }, data: { name, slug } });
        return res.json(category);
      } catch (e) {}
    }
    const db = mockDb.getDb();
    const cat = db.categories.find(c => c.id === id);
    if (cat) {
      cat.name = name;
      cat.slug = slug;
      mockDb.saveDb(db);
      return res.json(cat);
    }
    res.status(404).json({ error: 'Not found' });
  });

  app.delete('/api/admin/categories/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { id } = req.params;
    if (getDbStatus()) {
      try {
        await prisma.category.delete({ where: { id } });
        return res.json({ success: true });
      } catch (e) {}
    }
    const db = mockDb.getDb();
    db.categories = db.categories.filter(c => c.id !== id);
    mockDb.saveDb(db);
    res.json({ success: true });
  });

  // --- TAGS API ---
  app.get('/api/admin/tags', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    if (getDbStatus()) {
      try {
        const tags = await prisma.tag.findMany({
          include: { _count: { select: { articles: true } } }
        });
        return res.json(tags.map(t => ({ id: t.id, name: t.name, articleCount: t._count.articles })));
      } catch (e) {}
    }
    const db = mockDb.getDb();
    const result = db.tags.map(t => ({
      id: t.id,
      name: t.name,
      articleCount: db.articles.filter(a => a.tags && Array.isArray(a.tags) && a.tags.includes(t.name)).length
    }));
    res.json(result);
  });

  app.post('/api/admin/tags', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const { name } = req.body;
    if (getDbStatus()) {
      try {
        const tag = await prisma.tag.create({ data: { name } });
        return res.json(tag);
      } catch (e) {}
    }
    const db = mockDb.getDb();
    const newTag = { id: 'tag-' + Math.random().toString(36).substring(2, 9), name };
    db.tags.push(newTag);
    mockDb.saveDb(db);
    res.json(newTag);
  });

  app.put('/api/admin/tags/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const { name } = req.body;
    const { id } = req.params;
    if (getDbStatus()) {
      try {
        const tag = await prisma.tag.update({ where: { id }, data: { name } });
        return res.json(tag);
      } catch (e) {}
    }
    const db = mockDb.getDb();
    const tag = db.tags.find(t => t.id === id);
    if (tag) {
      tag.name = name;
      mockDb.saveDb(db);
      return res.json(tag);
    }
    res.status(404).json({ error: 'Not found' });
  });

  app.delete('/api/admin/tags/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { id } = req.params;
    if (getDbStatus()) {
      try {
        await prisma.tag.delete({ where: { id } });
        return res.json({ success: true });
      } catch (e) {}
    }
    const db = mockDb.getDb();
    db.tags = db.tags.filter(t => t.id !== id);
    mockDb.saveDb(db);
    res.json({ success: true });
  });

  // --- COMMENTS API ---
  app.get('/api/admin/comments', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const db = mockDb.getDb();
    res.json(db.comments);
  });

  app.put('/api/admin/comments/:id/status', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const { status } = req.body; // PENDING, APPROVED, REJECTED, SPAM
    const { id } = req.params;
    const db = mockDb.getDb();
    const comment = db.comments.find(c => c.id === id);
    if (comment) {
      comment.status = status;
      mockDb.saveDb(db);
      return res.json(comment);
    }
    res.status(404).json({ error: 'Comment not found' });
  });

  app.delete('/api/admin/comments/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { id } = req.params;
    const db = mockDb.getDb();
    db.comments = db.comments.filter(c => c.id !== id);
    mockDb.saveDb(db);
    res.json({ success: true });
  });

  // --- USERS API ---
  app.get('/api/admin/users', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    if (getDbStatus()) {
      try {
        const users = await prisma.user.findMany({
          select: { id: true, email: true, role: true, failedLoginAttempts: true, lockedUntil: true, createdAt: true }
        });
        return res.json(users);
      } catch (e) {}
    }
    const db = mockDb.getDb();
    res.json(db.users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: u.createdAt
    })));
  });

  app.post('/api/admin/users', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { email, password, role } = req.body;
    const { hashPassword } = await import('./lib/auth.ts');
    const hashedPassword = await hashPassword(password);
    if (getDbStatus()) {
      try {
        const user = await prisma.user.create({
          data: { email, password: hashedPassword, role }
        });
        return res.json({ id: user.id, email: user.email, role: user.role, createdAt: user.createdAt });
      } catch (e) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }
    const db = mockDb.getDb();
    if (db.users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const newUser = {
      id: 'user-' + Math.random().toString(36).substring(2, 11),
      email,
      passwordHash: hashedPassword,
      role: role || 'USER',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    mockDb.saveDb(db);
    res.json({ id: newUser.id, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt });
  });

  app.put('/api/admin/users/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { role, isLocked } = req.body;
    const { id } = req.params;
    if (getDbStatus()) {
      try {
        const user = await prisma.user.update({
          where: { id },
          data: {
            role,
            lockedUntil: isLocked ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
            failedLoginAttempts: isLocked ? 5 : 0
          }
        });
        return res.json(user);
      } catch (e) {}
    }
    const db = mockDb.getDb();
    const user = db.users.find(u => u.id === id);
    if (user) {
      user.role = role;
      mockDb.saveDb(db);
      return res.json({ id: user.id, email: user.email, role: user.role, isLocked });
    }
    res.status(404).json({ error: 'User not found' });
  });

  app.delete('/api/admin/users/:id', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const { id } = req.params;
    if (getDbStatus()) {
      try {
        await prisma.user.delete({ where: { id } });
        return res.json({ success: true });
      } catch (e) {}
    }
    const db = mockDb.getDb();
    db.users = db.users.filter(u => u.id !== id);
    mockDb.saveDb(db);
    res.json({ success: true });
  });

  // --- SETTINGS API ---
  app.get('/api/admin/settings', authenticate, authorize(['ADMIN', 'EDITOR']), async (req: any, res: any) => {
    const db = mockDb.getDb();
    res.json(db.settings);
  });

  app.put('/api/admin/settings', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const updatedSettings = req.body; // Array of { key, value }
    const db = mockDb.getDb();
    for (const setting of updatedSettings) {
      const match = db.settings.find(s => s.key === setting.key);
      if (match) {
        match.value = setting.value;
      } else {
        db.settings.push({ id: 'set-' + Math.random().toString(36).substring(2, 9), key: setting.key, value: setting.value });
      }
    }
    mockDb.saveDb(db);
    res.json(db.settings);
  });

  // --- SECURITY LOGS ---
  app.get('/api/admin/logs', authenticate, authorize(['ADMIN']), async (req: any, res: any) => {
    const db = mockDb.getDb();
    res.json(db.auditLogs);
  });

  // 4. Vite / Static
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

