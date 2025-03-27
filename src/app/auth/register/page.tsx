'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedGradientBorder } from '@/components/ui/animated-gradient-border';
import { GradientText } from '@/components/ui/gradient-text';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Bot, Check, ChevronRight } from 'lucide-react';

// Fütüristik Animasyonlu Arka Plan
const CyberBackground = () => {
  const [glowEffects, setGlowEffects] = useState<Array<{
    id: number;
    width: number;
    height: number;
    left: string;
    top: string;
    duration: number;
  }>>([]);

  // Client tarafında çalışacak arka plan elemanlarını oluşturma
  useEffect(() => {
    // Parıltı efektleri
    const effects = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 5 + 5
    }));
    
    setGlowEffects(effects);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent -z-10" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-purple-500/20 to-transparent blur-2xl -z-10" />
      
      {/* Parıltı efektleri */}
      <div className="absolute inset-0">
        {glowEffects.map((effect) => (
          <motion.div
            key={effect.id}
            className="absolute rounded-full bg-indigo-500/30 blur-3xl"
            style={{
              width: effect.width,
              height: effect.height,
              left: effect.left,
              top: effect.top,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: effect.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"
      />
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

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Kayıt sırasında bir hata oluştu');
      }
      
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      router.push('/auth/login');
    } catch (error) {
      console.error('Kayıt hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Ücretsiz başlangıç planı',
    'Sınırsız sayıda ziyaretçi',
    'Özelleştirilebilir widget',
    'Temel analitikler',
  ];

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <ClientOnlyCyberBackground />
      
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left column - Form */}
        <div className="w-full max-w-md mx-auto">
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
              Hemen Başlayın
            </motion.h1>
            <motion.p 
              className="text-white/60"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Ücretsiz hesap oluşturun ve chatbot yolculuğunuza başlayın.
            </motion.p>
          </motion.div>
          
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatedGradientBorder>
              <div className="bg-black/50 backdrop-blur-sm p-8 rounded-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="name" className="block text-sm font-medium text-white/70">
                      İsim
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                      placeholder="Adınız Soyadınız"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500 transition-all duration-300"
                    />
                  </motion.div>
                  
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
                    <label htmlFor="password" className="block text-sm font-medium text-white/70">
                      Şifre
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500 transition-all duration-300"
                    />
                  </motion.div>
                  
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="passwordConfirm" className="block text-sm font-medium text-white/70">
                      Şifre Tekrar
                    </label>
                    <Input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type="password"
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500 transition-all duration-300"
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white mt-2 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isLoading ? 'İşleniyor...' : 'Kaydol'}
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
                    Zaten bir hesabınız var mı?{' '}
                    <Link href="/auth/login" className="font-medium text-indigo-400 hover:text-indigo-300 relative group">
                      Giriş Yapın
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </p>
                </motion.div>
              </div>
            </AnimatedGradientBorder>
          </motion.div>
        </div>
        
        {/* Right column - Features */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden md:block"
        >
          <div className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center">
              <GradientText from="from-indigo-400" to="to-purple-500">
                Öne Çıkan
              </GradientText>
              <span className="ml-2">Özellikler</span>
            </h2>
            
            <div className="space-y-5">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                >
                  <motion.div 
                    className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-1 mt-0.5"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Check size={16} className="text-white" />
                  </motion.div>
                  <p className="text-white/80">{feature}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12">
              <AnimatedGradientBorder animate={true}>
                <div className="bg-black/50 backdrop-blur-sm p-6 rounded-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      className="size-12 rounded-full bg-white/10 flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, 0, -5, 0] 
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                    >
                      <span className="text-2xl">🚀</span>
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold">Hızlı Kurulum</h3>
                      <p className="text-white/60 text-sm">Dakikalar içinde kullanıma hazır</p>
                    </div>
                  </div>
                  <p className="text-white/70">
                    Chatbotunuzu oluşturun, özelleştirin ve tek satır kodla web sitenize entegre edin.
                    Karmaşık yapılandırmalar veya teknik bilgi gerektirmez.
                  </p>
                </div>
              </AnimatedGradientBorder>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 