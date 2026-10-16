import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';

function assertSecretsConfigured() {
  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((key) => !process.env[key] || process.env[key].length < 32);
  if (missing.length) {
    throw new Error(
      `Refusing to start: ${missing.join(', ')} must be set in the environment to a random string of at least 32 characters. See backend/.env.example.`,
    );
  }
}

async function bootstrap() {
  assertSecretsConfigured();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Uploaded product images are served statically and loaded cross-origin by
  // the frontend's <img> tags — relax CORP so helmet doesn't block that load.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // Cookies carry the session, so CORS must reflect a known, explicit origin —
  // never a wildcard — with credentials enabled. FRONTEND_URL is always
  // allowed when set. Outside production, any localhost/127.0.0.1 origin is
  // also accepted, since the frontend's own port can shift when its default
  // is busy (see the fallback script in frontend/scripts) — still
  // credentials-gated and still enforced by the browser's same-origin rules,
  // just not locked to one specific dev port. That extra allowance never
  // applies in production, where only the exact configured FRONTEND_URL works.
  const frontendUrl = process.env.FRONTEND_URL;
  const allowAnyLocalOrigin = process.env.NODE_ENV !== 'production';
  const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;
  
  // Build list of allowed origins
  const allowedOrigins: string[] = [];
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
    
    // Extract domain without protocol
    const urlWithoutProtocol = frontendUrl.replace(/^https?:\/\//, '');
    
    // Add both http and https versions
    allowedOrigins.push(`https://${urlWithoutProtocol}`);
    allowedOrigins.push(`http://${urlWithoutProtocol}`);
    
    // Also allow both www and non-www versions
    if (urlWithoutProtocol.startsWith('www.')) {
      // If URL has www, also allow without www
      const withoutWww = urlWithoutProtocol.replace('www.', '');
      allowedOrigins.push(`https://${withoutWww}`);
      allowedOrigins.push(`http://${withoutWww}`);
    } else {
      // If URL doesn't have www, also allow with www
      allowedOrigins.push(`https://www.${urlWithoutProtocol}`);
      allowedOrigins.push(`http://www.${urlWithoutProtocol}`);
    }
  }
  
  // Remove duplicates
  const uniqueAllowedOrigins = Array.from(new Set(allowedOrigins));
  
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (uniqueAllowedOrigins.includes(origin)) return callback(null, true);
      if (allowAnyLocalOrigin && localOriginPattern.test(origin)) return callback(null, true);
      
      // Log rejected origins to help diagnose CORS issues
      Logger.warn(`CORS: Rejected origin "${origin}". Allowed origins: ${uniqueAllowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const desiredPort = Number(process.env.PORT) || 3001;
  const port = await listenWithPortFallback(app, desiredPort);

  Logger.log(`Backend server is running on: http://localhost:${port}`);
  Logger.log(`API base: http://localhost:${port}/api`);
}

/**
 * Tries `desiredPort`, then increments on EADDRINUSE until something binds
 * (e.g. a stale process still holding the usual port). Returns the port that
 * actually ended up listening.
 */
async function listenWithPortFallback(
  app: NestExpressApplication,
  desiredPort: number,
  maxAttempts = 20,
): Promise<number> {
  let port = desiredPort;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await app.listen(port);
      return port;
    } catch (err: any) {
      if (err?.code === 'EADDRINUSE') {
        Logger.warn(`Port ${port} is already in use — trying ${port + 1} instead.`);
        port += 1;
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Could not find a free port after trying ${desiredPort}-${port - 1}.`);
}

bootstrap();
