'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Yükleniyor durumu
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="size-10 border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Oturum açılmamışsa boş sayfa göster (nasılsa useEffect ile yönlendirecek)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      {children}
    </>
  );
} 