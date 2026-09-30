import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { appConfig } from './config.ts';

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate Request ID for distributed tracing & logging
  const requestId = (req.headers['x-request-id'] as string) || `req-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  res.setHeader('X-Request-Id', requestId);
  (req as any).requestId = requestId;

  // Remove Express fingerprinting
  res.removeHeader('X-Powered-By');

  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // HSTS (Strict-Transport-Security) for HTTPS in production/staging
  if (appConfig.isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

    // Content-Security-Policy (CSP) tailored for AI Studio, Supabase, Google Fonts, and Google APIs
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.googleapis.com https://*.run.app https://*.ai.studio ws: wss:",
      "frame-ancestors 'self' https://*.google.com https://*.run.app https://*.ai.studio https://ai.studio",
      "base-uri 'self'",
      "form-action 'self'",
    ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // Default caching behavior for API routes
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
}

/**
 * Structured Request Logging with latency and correlation ID
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = (req as any).requestId || req.headers['x-request-id'] || 'unknown';

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Structured JSON log entry
    const logData = {
      level: statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO',
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs,
      clientIp,
      userAgent: userAgent.substring(0, 80),
      env: appConfig.env,
    };

    // Filter out Vite HMR / internal source module loads from noisy access logs
    const isViteSource = req.path.startsWith('/@') || 
      req.path.startsWith('/node_modules') || 
      req.path.startsWith('/src/') ||
      req.path.includes('?v=') ||
      req.path.includes('.tsx') ||
      req.path.includes('.ts');

    if (isViteSource) {
      return;
    }

    if (statusCode >= 500) {
      console.error(`[HTTP] ${logData.method} ${logData.path} ${logData.statusCode} - ${logData.durationMs}ms [${logData.requestId}]`, logData);
    } else if (statusCode >= 400) {
      console.warn(`[HTTP] ${logData.method} ${logData.path} ${logData.statusCode} - ${logData.durationMs}ms [${logData.requestId}]`);
    } else {
      console.log(`[HTTP] ${logData.method} ${logData.path} ${logData.statusCode} - ${logData.durationMs}ms`);
    }
  });

  next();
}

/**
 * Centralized Error Monitoring and sanitized error response
 */
export function errorHandlerMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = (req as any).requestId || 'unknown';
  const statusCode = err.status || err.statusCode || 500;

  // Log full error stack on server
  console.error(`[ErrorMonitoring] [${requestId}] Unhandled Error in ${req.method} ${req.url}:`, {
    message: err.message,
    stack: err.stack,
    name: err.name,
    timestamp: new Date().toISOString(),
    env: appConfig.env,
  });

  // Client response: sanitize in production so internal DB / code paths are not exposed
  const isProd = appConfig.isProduction;
  const clientMessage = isProd && statusCode === 500
    ? 'เกิดข้อผิดพลาดภายในระบบ กรุณาติดต่อผู้ดูแลระบบพร้อมแจ้งรหัสอ้างอิง'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: clientMessage,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    requestId,
    timestamp: new Date().toISOString(),
    ...(isProd ? {} : { stack: err.stack }),
  });
}
