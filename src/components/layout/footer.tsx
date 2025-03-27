'use client';

import Link from 'next/link';
import { GradientText } from '@/components/ui/gradient-text';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Ürün',
      links: [
        { label: 'Özellikler', href: '/#features' },
        { label: 'Fiyatlandırma', href: '/#pricing' },
        { label: 'SSS', href: '/#faq' },
        { label: 'Entegrasyonlar', href: '/#integrations' },
      ],
    },
    {
      title: 'Şirket',
      links: [
        { label: 'Hakkımızda', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Kariyer', href: '/careers' },
        { label: 'İletişim', href: '/contact' },
      ],
    },
    {
      title: 'Kaynaklar',
      links: [
        { label: 'Dokümantasyon', href: '/docs' },
        { label: 'Öğretici İçerikler', href: '/tutorials' },
        { label: 'Topluluk', href: '/community' },
        { label: 'API Referansı', href: '/api-reference' },
      ],
    },
    {
      title: 'Yasal',
      links: [
        { label: 'Gizlilik Politikası', href: '/privacy' },
        { label: 'Kullanım Koşulları', href: '/terms' },
        { label: 'Çerez Politikası', href: '/cookies' },
      ],
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-transparent to-black/30 border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="relative size-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <span className="absolute inset-0.5 bg-black rounded-md"></span>
              </span>
              <span className="font-bold text-lg">
                <GradientText from="from-indigo-400" to="to-purple-500">
                  ChatBot
                </GradientText>
                <span className="ml-1">Forge</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 max-w-md">
              ChatBot Forge, web siteniz için özelleştirilmiş AI chatbotları oluşturmanızı 
              sağlayan modern bir platformdur. Sadece birkaç adımda sitenizle entegre edilebilir.
            </p>
            
            <div className="flex gap-4 mt-6">
              <Link href="https://twitter.com" className="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                </svg>
              </Link>
              <Link href="https://github.com" className="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </Link>
              <Link href="https://linkedin.com" className="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Footer Links Columns */}
          {footerLinks.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <h3 className="font-semibold text-sm text-white/80">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            &copy; {currentYear} ChatBot Forge. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white/60">
              Gizlilik
            </Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/60">
              Koşullar
            </Link>
            <Link href="/cookies" className="text-xs text-white/40 hover:text-white/60">
              Çerezler
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 