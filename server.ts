import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase, db } from './src/server/db.ts';
import { apiRouter } from './src/server/api.ts';
import { appConfig } from './src/server/config.ts';
import { securityHeadersMiddleware, requestLoggerMiddleware, errorHandlerMiddleware } from './src/server/security.ts';

async function startServer() {
  const app = express();
  const PORT = appConfig.port;

  // Trust proxy for reverse proxies / Cloud Run (enables correct client IP, proto, and HTTPS detection)
  app.set('trust proxy', 1);

  // Initialize SQLite persistent tables, indexes, and versioned migrations
  initializeDatabase();

  // Security Headers and Distributed Request Tracing
  app.use(securityHeadersMiddleware);

  // Structured Access Logger
  app.use(requestLoggerMiddleware);

  // Body parsers with limits
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Mount API routes
  app.use('/api/v1', apiRouter);

  // Vite middleware for development vs static in production
  if (appConfig.env !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Immutable caching for hashed static assets
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );

    // Static files with standard caching
    app.use(
      express.static(distPath, {
        setHeaders: (res, filepath) => {
          if (filepath.endsWith('index.html')) {
            // HTML must not be cached aggressively so clients get latest releases immediately
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        },
      })
    );

    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Centralized Error Monitoring Middleware
  app.use(errorHandlerMiddleware);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`[Production Readiness] MCU Academic Affairs Platform`);
    console.log(`[Environment] ${appConfig.env.toUpperCase()}`);
    console.log(`[Database Path] ${appConfig.databasePath}`);
    console.log(`[Port & Address] http://0.0.0.0:${PORT}`);
    console.log(`[Version] ${appConfig.version}`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      try {
        db.close();
        console.log('[Database] SQLite database connection closed cleanly.');
      } catch (err) {
        console.error('[Database] Error closing SQLite database:', err);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
  process.exit(1);
});

