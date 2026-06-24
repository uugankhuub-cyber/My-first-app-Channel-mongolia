import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { prisma } from './lib/prisma.ts';
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

  // 2. Initial Admin Creation
  const initAdmin = async () => {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not set. Skipping admin initialization.');
      return;
    }

    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      try {
        // Test connection
        await prisma.$connect();
        
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
        console.error('Database connection error in initAdmin:', err.message);
        // Do not crash the server, just log the error
      }
    }
  };
  
  await initAdmin();

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
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: { email: true } }, category: true }
    });
    if (!article) return res.status(404).json({ error: 'Not found' });
    res.json(article);
  });

  // Articles (Admin/Editor)
  app.post('/api/admin/articles', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.createArticle);
  app.put('/api/admin/articles/:id', authenticate, authorize(['ADMIN', 'EDITOR']), articleHandlers.updateArticle);
  app.delete('/api/admin/articles/:id', authenticate, authorize(['ADMIN']), articleHandlers.deleteArticle);

  // Dashboard Stats
  app.get('/api/admin/stats', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res) => {
      const articleCount = await prisma.article.count();
      const userCount = await prisma.user.count();
      const draftCount = await prisma.article.count({ where: { status: 'DRAFT' } });
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

