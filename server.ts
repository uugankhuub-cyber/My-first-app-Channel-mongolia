import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Import API handlers
  // @ts-ignore
  const contentHandler = (await import('./api/content.js')).default;
  // @ts-ignore
  const ratesHandler = (await import('./api/rates.js')).default;
  // @ts-ignore
  const weatherHandler = (await import('./api/weather.js')).default;
  // @ts-ignore
  const chatHandler = (await import('./api/chat.js')).default;
  // @ts-ignore
  const adminLoginHandler = (await import('./api/admin-login.js')).default;
  // @ts-ignore
  const adminRegisterHandler = (await import('./api/admin-register.js')).default;
  // @ts-ignore
  const adminStatusHandler = (await import('./api/admin-status.js')).default;
  // @ts-ignore
  const adminAiContentHandler = (await import('./api/admin-ai-content.js')).default;
  // @ts-ignore
  const adminUploadHandler = (await import('./api/admin-upload.js')).default;
  // @ts-ignore
  const uploadHandler = (await import('./api/upload.js')).default;

  // Mount API routes
  app.all('/api/content', contentHandler);
  app.all('/api/rates', ratesHandler);
  app.all('/api/weather', weatherHandler);
  app.all('/api/chat', chatHandler);
  app.all('/api/admin-login', adminLoginHandler);
  app.all('/api/admin-register', adminRegisterHandler);
  app.all('/api/admin-status', adminStatusHandler);
  app.all('/api/admin-ai-content', adminAiContentHandler);
  app.all('/api/admin-upload', adminUploadHandler);
  app.all('/api/upload', uploadHandler);

  // Vite middleware for development
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
