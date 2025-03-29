'use client';

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from './contexts/LanguageContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark"
          forcedTheme="dark"
          enableColorScheme={false}
        >
          {children}
        </ThemeProvider>
      </LanguageProvider>
    </SessionProvider>
  )
} 