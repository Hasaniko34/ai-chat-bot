import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatBot Forge | Özelleştirilebilir AI Chatbot Platformu',
  description: 'Web siteniz için özelleştirilebilir AI destekli chatbotlar oluşturun. Kolay entegrasyon, özelleştirilebilir arayüz ve güçlü analitik özellikleriyle.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className="dark">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-black bg-dots text-white antialiased"
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
