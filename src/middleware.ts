import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // OPTIONS isteği için preflight yanıtı
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*', // Üretimde kısıtlanmalı: https://yourdomain.com
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400', // 24 saat
      },
    });
  }

  // Normal istekler için
  const response = NextResponse.next();
  
  // CORS başlıkları ekle
  response.headers.set('Access-Control-Allow-Origin', '*'); // Üretimde kısıtlanmalı
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  // Güvenlik başlıkları ekle
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

// Hangi yolların middleware tarafından ele alınacağını belirtiyoruz
export const config = {
  matcher: '/api/:path*',
}; 