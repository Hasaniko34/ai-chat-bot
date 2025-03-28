'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/home');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="size-10 border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
    </div>
  );
}
