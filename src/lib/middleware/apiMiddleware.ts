import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../utils/logger';
import { rateLimitMiddleware, checkRateLimit } from './rateLimit';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth/options';
import { ApiError } from '../utils/apiError';
import { cache } from '../utils/cache';

interface ApiMiddlewareOptions {
  requireAuth?: boolean;
  rateLimit?: number;
  cacheSeconds?: number; // Önbellek süresi (saniye)
  version?: 'v1' | 'v2'; // API versiyonu
}

interface ApiHandlerOptions {
  rateLimit?: number;
  version?: string;
  cacheSeconds?: number;
}

/**
 * API isteklerini işlemek için genel middleware
 * Rate limiting, loglama, önbellekleme ve hata yönetimi sağlar
 * 
 * @param handler API işleyici fonksiyonu
 * @param options Middleware options
 * @returns API yanıtı
 */
export function withApiMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: ApiMiddlewareOptions = {}
) {
  return async function(req: NextRequest) {
    const startTime = Date.now();
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    
    // API versiyonu ekle
    const version = options.version || 'v1';
    const versionHeader = req.headers.get('api-version') || version;
    
    try {
      // Rate limiting kontrolü
      if (options.rateLimit) {
        const rateLimitResult = await rateLimitMiddleware(req, options.rateLimit);
        if (rateLimitResult) {
          return rateLimitResult;
        }
      }
      
      // Kimlik doğrulama kontrolü
      if (options.requireAuth) {
        const session = await getServerSession(authOptions);
        
        if (!session) {
          logger.warn(`Yetkisiz erişim girişimi: ${method} ${path}`);
          throw ApiError.unauthorized();
        }
      }
      
      // Önbellek kontrolü (sadece GET istekleri için)
      if (method === 'GET' && options.cacheSeconds) {
        const cacheKey = `api:${path}:${url.search}`;
        const cachedResponse = cache.get<NextResponse>(cacheKey);
        
        if (cachedResponse) {
          logger.debug(`Cache hit: ${cacheKey}`, { context: 'CACHE' });
          
          // API çağrısını logla (önbellekten)
          const duration = Date.now() - startTime;
          logger.api(method, path, 200, duration, undefined, { cached: true });
          
          // Önbellekten yanıt dön
          return cachedResponse;
        }
      }
      
      // API işleyiciyi çağır
      const response = await handler(req);
      
      // Başarılı GET yanıtını önbelleğe al
      if (method === 'GET' && options.cacheSeconds && response.status >= 200 && response.status < 300) {
        const cacheKey = `api:${path}:${url.search}`;
        cache.set(cacheKey, response.clone(), options.cacheSeconds);
        logger.debug(`Cache set: ${cacheKey}`, { context: 'CACHE' });
      }
      
      // API çağrısını logla
      const statusCode = response.status;
      const duration = Date.now() - startTime;
      
      // Versiyon başlığını ekle
      const newResponse = NextResponse.json(
        await response.json(),
        { 
          status: response.status, 
          statusText: response.statusText,
          headers: { ...Object.fromEntries(response.headers), 'x-api-version': versionHeader }
        }
      );
      
      logger.api(method, path, statusCode, duration);
      
      return newResponse;
      
    } catch (error: any) {
      // Hatayı logla
      const duration = Date.now() - startTime;
      
      // ApiError nesnesine dönüştür
      const apiError = error instanceof ApiError 
        ? error 
        : ApiError.internal(
            process.env.NODE_ENV === 'development' 
              ? error.message 
              : 'İşlem sırasında bir hata oluştu'
          );
      
      logger.api(method, path, apiError.statusCode, duration, undefined, error);
      console.error(`API Hatası (${method} ${path}):`, error);
      
      // Versiyon başlığını ekle
      return NextResponse.json(
        apiError.toResponse(),
        { 
          status: apiError.statusCode,
          headers: { 'x-api-version': versionHeader }
        }
      );
    }
  };
}

// Kimlik doğrulama gerektiren API'ler için kısayol
export function withAuthApi(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return async (request: NextRequest) => {
    try {
      // Rate limit kontrolü
      if (options.rateLimit) {
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const identifier = `${ip}:${request.nextUrl.pathname}`;
        
        const isRateLimited = await checkRateLimit(identifier, options.rateLimit);
        if (isRateLimited) {
          throw ApiError.tooManyRequests();
        }
      }

      // API versiyonu kontrolü
      if (options.version) {
        const path = request.nextUrl.pathname;
        if (!path.startsWith(`/api/${options.version}/`)) {
          throw ApiError.badRequest('Geçersiz API versiyonu');
        }
      }

      // Cache-Control header'ı
      if (options.cacheSeconds !== undefined) {
        const response = await handler(request);
        response.headers.set(
          'Cache-Control',
          `public, max-age=${options.cacheSeconds}, s-maxage=${options.cacheSeconds}`
        );
        return response;
      }

      return await handler(request);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: error.details
          },
          { status: error.statusCode }
        );
      }

      logger.error('API hatası', {
        context: 'API_MIDDLEWARE',
        data: { error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
      });

      return NextResponse.json(
        {
          error: 'Sunucu hatası',
          code: 'INTERNAL_SERVER_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

// Önbellekli API'ler için kısayol
export function withCachedApi(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: Omit<ApiMiddlewareOptions, 'cacheSeconds'> & { cacheSeconds: number } = { cacheSeconds: 60 }
) {
  return withApiMiddleware(handler, options);
} 