'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-bold">404 - Sayfa Bulunamadı</h1>
        <p className="text-muted-foreground">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Button asChild>
          <Link href="/">
            Ana Sayfaya Dön
          </Link>
        </Button>
      </div>
    </div>
  );
} 