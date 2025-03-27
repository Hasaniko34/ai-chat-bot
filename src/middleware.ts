import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Eğer kök dizin (/) isteniyorsa, ana sayfanın yeni konumuna yönlendir
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  return NextResponse.next();
}

// Hangi yolların middleware tarafından ele alınacağını belirtiyoruz
export const config = {
  matcher: ['/'],
}; 