'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // İsteğe bağlı olarak, ürün ortamında hata günlüğünü tutma
    console.error('Sayfada hata oluştu:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-bold">Bir Şeyler Yanlış Gitti</h1>
        <p className="text-muted-foreground">
          Üzgünüz, bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <Button onClick={reset}>
          Tekrar Dene
        </Button>
      </div>
    </div>
  );
} 