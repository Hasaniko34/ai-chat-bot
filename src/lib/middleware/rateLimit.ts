import { NextRequest, NextResponse } from 'next/server';
import { cache } from '../utils/cache';
import { logger } from '../utils/logger';

/**
 * Rate limit kontrolü yapan fonksiyon
 */
export async function checkRateLimit(identifier: string, limit: number, windowSeconds: number = 60): Promise<boolean> {
  const key = `rate_limit:${identifier}`;
  const current = cache.get<number>(key) || 0;

  if (current >= limit) {
    logger.warn('Rate limit aşıldı', {
      context: 'RATE_LIMIT',
      data: { identifier, current, limit }
    });
    return true; // Rate limit aşıldı
  }

  cache.set(key, current + 1, windowSeconds);
  return false; // Rate limit aşılmadı
}

/**
 * API isteklerini hız sınırlaması uygulayan middleware
 * @param request NextRequest nesnesi
 * @param limit Dakika başı maksimum istek sayısı
 * @returns NextResponse veya null (devam etmesi için)
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  limit: number = 60
) {
  // IP adresini al (headers veya forwarded headers'dan)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? 
    forwardedFor.split(',')[0].trim() : 
    (request.headers.get('x-real-ip') || 'anonymous');
  
  const identifier = `${ip}:${request.nextUrl.pathname}`;
  
  try {
    const isLimited = await checkRateLimit(identifier, limit);
    if (isLimited) {
      return NextResponse.json(
        { 
          error: 'Çok fazla istek gönderdiniz. Lütfen bir süre bekleyin.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }
    return null; // İşleme devam et
  } catch (error) {
    logger.error('Rate limit kontrolü sırasında hata', {
      context: 'RATE_LIMIT',
      data: { error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
    });
    return null; // Hata durumunda işleme devam et
  }
} 