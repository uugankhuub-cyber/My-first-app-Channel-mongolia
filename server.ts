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
  const PORT = 3000;

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
    message: 'Too many requests, please try again later.'
  });
  app.use('/api/', limiter);

  // 2. Initial Admin Creation & Database Connection Verification
  await checkConnection();

  const initAdmin = async () => {
    if (!getDbStatus()) {
      console.warn('Database is not healthy/connected. Skipping database admin initialization.');
      return;
    }

    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      try {
        const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (!adminExists) {
          console.log('Creating initial admin account...');
          const hashedPassword = await hashPassword(adminPassword);
          await prisma.user.create({
            data: {
              email: adminEmail,
              password: hashedPassword,
              role: 'ADMIN',
              emailVerified: true,
              forcePasswordChange: true,
            },
          });
        }
      } catch (err: any) {
        console.error('Database query error in initAdmin:', err.message);
      }
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

  // Auth
  app.post('/api/auth/login', authHandlers.login);
  app.post('/api/auth/register', authHandlers.register);
  app.post('/api/auth/logout', authHandlers.logout);
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

