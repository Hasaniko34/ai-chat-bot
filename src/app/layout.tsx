'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [language, setLanguage] = useState<string>('tr')

  // Sayfa yüklendiğinde localStorage'dan dil tercihini al
  useEffect(() => {
    const savedLanguage = localStorage.getItem('appLanguage')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    } else {
      // Varsayılan dil Türkçe
      document.documentElement.lang = 'tr'
    }

    // Dil değişikliklerini dinle
    const handleStorageChange = () => {
      const currentLanguage = localStorage.getItem('appLanguage')
      if (currentLanguage && currentLanguage !== language) {
        setLanguage(currentLanguage)
        document.documentElement.lang = currentLanguage
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [language])

  return (
    <html lang={language} className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ChatBot Forge</title>
        <meta name="description" content="Yapay zeka destekli chat bot oluşturma platformu" />
        <link rel="icon" href="/favicon.ico" />
        {/* Ek meta etiketleri */}
        <meta name="keywords" content="chatbot, AI, yapay zeka, sohbet botu, Gemini AI" />
        <meta name="author" content="ChatBot Forge" />
        <meta property="og:title" content="ChatBot Forge" />
        <meta property="og:description" content="Yapay zeka destekli chat bot oluşturma platformu" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatbotforge.com" />
        <meta property="og:image" content="https://chatbotforge.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-black bg-[url('/bg.svg')] bg-cover font-sans antialiased",
          inter.className
        )}
      >
        <Providers>
          {/* Dashboard için gerekli olmayanlar */}
          {children}
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  )
}

// CSP header'lar
export const headers = () => {
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://* http://*;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.googleapis.com https://www.google-analytics.com;
    frame-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      key: 'Content-Security-Policy',
      value: cspHeader,
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
  ];
};
