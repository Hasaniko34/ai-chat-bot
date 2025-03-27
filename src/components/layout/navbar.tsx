'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Sayfa aşağı kaydırıldığında navbar stilini değiştir
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { title: 'Ana Sayfa', href: '/' },
    { title: 'Özellikler', href: '/#features' },
    { title: 'Fiyatlandırma', href: '/#pricing' },
    { title: 'SSS', href: '/#faq' },
  ];

  return (
    <header 
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-black/70 backdrop-blur-md border-b border-white/10 py-2' 
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="relative size-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <span className="absolute inset-0.5 bg-black rounded-md"></span>
          </span>
          <span className="font-bold text-xl">
            <GradientText from="from-indigo-400" to="to-purple-500">
              ChatBot
            </GradientText>
            <span className="ml-1">Forge</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <ul className="flex gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-white/70',
                    pathname === item.href ? 'text-white' : 'text-white/60'
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              Giriş Yap
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
              Ücretsiz Başla
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-md border-t border-white/10">
          <div className="container mx-auto py-4">
            <ul className="flex flex-col gap-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={cn(
                      'block py-2 text-base font-medium transition-colors hover:text-white/70',
                      pathname === item.href ? 'text-white' : 'text-white/60'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full border-white/20 text-white/70 hover:text-white">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/register" className="w-full">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  Ücretsiz Başla
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 