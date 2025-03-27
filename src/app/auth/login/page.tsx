'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedGradientBorder } from '@/components/ui/animated-gradient-border';
import { GradientText } from '@/components/ui/gradient-text';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Bot, ChevronRight } from 'lucide-react';

// Fütüristik Animasyonlu Arka Plan
const CyberBackground = () => {
  const [dataLines, setDataLines] = useState<Array<{
    id: number,
    top: string,
    duration: number,
    delay: number
  }>>([]);
  
  const [stars, setStars] = useState<Array<{
    id: number,
    top: string,
    left: string,
    delay: number,
    duration: number
  }>>([]);
  
  // Client tarafında çalışacak arka plan elemanlarını oluşturma
  useEffect(() => {
    // Animasyonlu data lines
    const lines = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 2
    }));
    
    // Animasyonlu yıldızlar
    const dots = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5
    }));
    
    setDataLines(lines);
    setStars(dots);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Parıltı Efektleri */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/20 to-transparent backdrop-blur-[200px] -z-10" />
      <div className="absolute -top-40 -bottom-40 left-0 right-0 bg-[radial-gradient(circle_500px_at_50%_300px,rgba(90,60,190,0.15),transparent)]" />
      
      {/* Animasyonlu noktalar */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute size-1 md:size-1.5 bg-white rounded-full"
            style={{
              top: star.top,
              left: star.left,
            }}
            animate={{
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_70%)]" />
      
      {/* Animasyonlu data lines */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {dataLines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
            style={{
              top: line.top,
              left: 0,
              right: 0,
            }}
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: line.duration,
              repeat: Infinity,
              delay: line.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Client-only bileşeni
const ClientOnlyCyberBackground = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return <CyberBackground />;
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      toast.success('Giriş başarılı!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Giriş hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Form alanı için animasyon varyantları
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <ClientOnlyCyberBackground />
      
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="relative size-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <motion.div 
                  className="absolute inset-1 bg-black rounded-md flex items-center justify-center"
                  animate={{ 
                    boxShadow: ["0 0 0px rgba(122, 122, 255, 0)", "0 0 10px rgba(122, 122, 255, 0.5)", "0 0 0px rgba(122, 122, 255, 0)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bot className="text-white" size={20} />
                </motion.div>
              </div>
              <span className="font-bold text-2xl">
                <GradientText from="from-indigo-400" to="to-purple-500">
                  ChatBot
                </GradientText>
                <span className="ml-1">Forge</span>
              </span>
            </div>
          </Link>
          <motion.h1 
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Hoş Geldiniz
          </motion.h1>
          <motion.p 
            className="text-white/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Hesabınıza giriş yapın ve chatbotlarınızı yönetin.
          </motion.p>
        </motion.div>
        
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatedGradientBorder>
            <div className="bg-black/50 backdrop-blur-sm p-8 rounded-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70">
                    E-posta
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    placeholder="ornek@email.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500 transition-all duration-300"
                  />
                </motion.div>
                
                <motion.div className="space-y-2" variants={itemVariants}>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-white/70">
                      Şifre
                    </label>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 relative group"
                    >
                      Şifremi Unuttum
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500 transition-all duration-300"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                      {!isLoading && (
                        <motion.span
                          className="ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ChevronRight size={18} />
                        </motion.span>
                      )}
                    </span>
                    <span className="absolute inset-0 translate-y-[100%] bg-gradient-to-r from-indigo-700 to-purple-800 transition-transform duration-300 group-hover:translate-y-0"></span>
                  </Button>
                </motion.div>
              </form>
              
              <motion.div 
                className="mt-6 text-center" 
                variants={itemVariants}
              >
                <p className="text-sm text-white/60">
                  Hesabınız yok mu?{' '}
                  <Link href="/auth/register" className="font-medium text-indigo-400 hover:text-indigo-300 relative group">
                    Ücretsiz Kayıt Olun
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </p>
              </motion.div>
            </div>
          </AnimatedGradientBorder>
          
          {/* Güvenlik İpucu */}
          <motion.div 
            className="mt-8 bg-black/30 backdrop-blur-sm border border-white/5 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="text-xs text-white/50 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                Güvenlik ipucu: Şifrenizin güçlü olduğundan emin olun ve farklı siteler için aynı şifreyi kullanmaktan kaçının. 
                Tüm bağlantılarımız SSL ile korunmaktadır.
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 