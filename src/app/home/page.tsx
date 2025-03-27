'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { GradientText } from '@/components/ui/gradient-text'
import { AnimatedGradientBorder } from '@/components/ui/animated-gradient-border'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, Code, Cpu, Globe, Layers, LineChart, MessageSquare, Settings, Sparkles } from 'lucide-react'

// Parlayan yıldızlar için özel bileşen
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: string;
    y: string;
    opacity: number;
    scale: number;
    duration: number;
  }>>([]);

  // Client tarafında bir kez çalışacak rastgele parçacık oluşturma
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.3 + 0.1,
      scale: 1,
      duration: Math.random() * 10 + 15
    }));
    
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute size-1 md:size-2 bg-indigo-500/50 rounded-full"
          initial={{ 
            x: particle.x, 
            y: particle.y,
            opacity: particle.opacity, 
          }}
          animate={{ 
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

// Client-only bileşeni
const ClientOnlyFloatingParticles = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; // Sunucu tarafında render edilmez
  }
  
  return <FloatingParticles />;
}

// Animasyonlu Grid arka planı
const CyberGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(8,8,24,0)_1px,transparent_1px),linear-gradient(90deg,rgba(8,8,24,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(59,130,246,0.3),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_300px,rgba(147,51,234,0.3),transparent_70%)]"></div>
      </div>
    </div>
  )
}

export default function Home() {
  const [visibleDemo, setVisibleDemo] = useState<'widget' | 'dashboard'>('widget')
  const [scrollY, setScrollY] = useState(0)

  // Kaydırma etkilerini izleme
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 md:pt-44 pb-32 overflow-hidden">
        {/* Background Effects */}
        <div 
          className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent -z-10"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
            opacity: 1 - scrollY * 0.001
          }}
        />
        <div 
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-purple-500/20 to-transparent blur-2xl -z-10"
          style={{
            transform: `translate(-50%, ${scrollY * 0.05}px) scale(${1 - scrollY * 0.0005})`,
          }}
        />
        
        {/* Yeni Fütüristik Bileşenler */}
        <ClientOnlyFloatingParticles />
        <CyberGrid />
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="bg-white/5 backdrop-blur-md border border-white/10 text-white/70 py-2 px-4 rounded-full text-sm font-medium inline-flex items-center">
                <span className="text-neon-purple mr-2">
                  <motion.span
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="inline-block"
                  >
                    ✨
                  </motion.span>
                </span> 
                <span className="mr-2">Sektörün en yenilikçi chatbot platformu</span>
                <motion.span 
                  className="size-1.5 rounded-full bg-green-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
            >
              Web Siteniz İçin <GradientText className="neon-purple">Yapay Zeka</GradientText> Destekli <br />
              Chatbotlar Oluşturun
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-white/70 mb-8 max-w-2xl"
            >
              Her siteye özel, kolay entegre edilebilen ve özelleştirilebilen chatbotlarla 
              kullanıcılarınıza mükemmel bir deneyim sunun.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/auth/register">
                <Button 
                  size="lg" 
                  className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white min-w-44 group"
                >
                  <span className="relative z-10 flex items-center">
                    Ücretsiz Başla
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </span>
                  <span className="absolute inset-0 translate-y-[100%] bg-gradient-to-r from-indigo-700 to-purple-800 transition-transform duration-300 group-hover:translate-y-0"></span>
                </Button>
              </Link>
              <Link href="#features">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/10 text-white hover:bg-white/5 min-w-44 relative overflow-hidden group"
                >
                  <span className="relative z-10">Özellikleri Keşfet</span>
                  <span className="absolute inset-0 opacity-0 bg-white/5 transition-opacity duration-300 group-hover:opacity-100"></span>
                </Button>
              </Link>
            </motion.div>
          </div>
          
          {/* Mockup/Demo section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20"
          >
            <AnimatedGradientBorder containerClassName="w-full max-w-5xl mx-auto">
              <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setVisibleDemo('widget')}
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${visibleDemo === 'widget' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
                    >
                      Widget Görünümü
                    </button>
                    <button 
                      onClick={() => setVisibleDemo('dashboard')}
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${visibleDemo === 'dashboard' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
                    >
                      Panel Görünümü
                    </button>
                  </div>
                </div>
                
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                  {visibleDemo === 'widget' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-dark-900 to-dark-700 p-4">
                      <div className="absolute bottom-4 right-4 w-80 h-[420px] bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center">
                          <span className="text-white font-semibold">Yardım Asistanı</span>
                          <button className="ml-auto bg-white/20 rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                        <div className="p-4 h-[calc(100%-70px)] flex flex-col">
                          <div className="flex-1 overflow-y-auto space-y-4">
                            <div className="flex items-start gap-2">
                              <div className="rounded-full bg-indigo-600 p-1.5 text-white">
                                <Bot size={14} />
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 text-sm text-white/90 max-w-[80%]">
                                Merhaba! Size nasıl yardımcı olabilirim?
                              </div>
                            </div>
                            <div className="flex items-start gap-2 justify-end">
                              <div className="bg-indigo-600/20 rounded-lg p-3 text-sm text-white/90 max-w-[80%]">
                                Ürünleriniz hakkında bilgi almak istiyorum.
                              </div>
                              <div className="rounded-full bg-white/10 p-1.5 text-white">
                                <MessageSquare size={14} />
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="rounded-full bg-indigo-600 p-1.5 text-white">
                                <Bot size={14} />
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 text-sm text-white/90 max-w-[80%]">
                                Elbette! Hangi ürün kategorisi hakkında bilgi almak istersiniz? Premium, Standart ve Başlangıç paketlerimiz mevcut.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <input 
                              type="text" 
                              placeholder="Mesajınız..." 
                              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button className="bg-indigo-600 p-2 rounded-full text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-400 text-center">
                        <div className="max-w-lg">
                          <p className="text-lg font-medium mb-4">Web sitenizin önizlemesi</p>
                          <p className="text-sm">Chatbot widget'ı sağ alt köşede görünür</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-dark-900 to-dark-800 p-8">
                      <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-white">Chatbot Yönetim Paneli</h2>
                        <div className="flex items-center gap-4">
                          <span className="text-white/60 text-sm">Hoş geldin, Kullanıcı</span>
                          <div className="w-8 h-8 bg-indigo-600 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mb-8">
                        {['Toplam Botlar', 'Toplam Görüşmeler', 'Aktif Kullanıcılar', 'Başarı Oranı'].map((title, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <p className="text-white/60 text-sm mb-1">{title}</p>
                            <p className="text-2xl font-bold text-white">
                              {i === 0 ? '12' : i === 1 ? '1,204' : i === 2 ? '345' : '%92'}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Botlarım</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {['Destek Asistanı', 'Satış Temsilcisi', 'Ürün Rehberi'].map((bot, i) => (
                            <div key={i} className="bg-black/30 border border-white/10 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-purple-600' : 'bg-pink-600'}`}>
                                  <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-white">{bot}</h4>
                                  <p className="text-xs text-white/60">Aktif • 1.2 dk yanıt süresi</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <button className="flex-1 text-xs bg-white/5 hover:bg-white/10 text-white/80 py-1.5 rounded-md transition-colors">Düzenle</button>
                                <button className="flex-1 text-xs bg-white/5 hover:bg-white/10 text-white/80 py-1.5 rounded-md transition-colors">İstatistikler</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedGradientBorder>
          </motion.div>
          
          {/* Clients/Trust Logos */}
          <div className="mt-20 text-center">
            <p className="text-white/40 text-sm mb-6">SÜREKLİ ARTAN MÜŞTERİ PORTFÖYÜ</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-32 bg-white/5 rounded-md filter grayscale opacity-50 hover:opacity-100 hover:filter-none transition-all"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-black/0 to-black/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Chatbot Platformumuzun <GradientText from="from-indigo-400" to="to-purple-500">Özellikleri</GradientText></h2>
            <p className="text-white/70">Web siteniz için mükemmel bir chatbot deneyimi sunmak için gerekli tüm araçlar.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Cpu className="h-5 w-5" />, title: 'Yapay Zeka Entegrasyonu', description: 'Gelişmiş Gemini yapay zeka modeli ile kullanıcı sorularına doğal ve akıllı yanıtlar.' },
              { icon: <Settings className="h-5 w-5" />, title: 'Tam Özelleştirme', description: 'Renk, yazı tipi, şekil ve davranış ayarları ile markanıza uygun chatbotlar.' },
              { icon: <Code className="h-5 w-5" />, title: 'Kolay Entegrasyon', description: 'Tek satır kodla web sitenize entegre edilebilen chatbot çözümü.' },
              { icon: <LineChart className="h-5 w-5" />, title: 'Detaylı Analitikler', description: 'Sohbet istatistikleri ile kullanıcı davranışlarını ve performansı ölçün.' },
              { icon: <Globe className="h-5 w-5" />, title: 'Çoklu Dil Desteği', description: 'Farklı dillerde hizmet vererek global kullanıcılara erişim sağlayın.' },
              { icon: <Layers className="h-5 w-5" />, title: 'Bilgi Tabanı Entegrasyonu', description: 'Mevcut dökümantasyonunuzu chatbota entegre ederek doğru bilgi sunun.' },
            ].map((feature, index) => (
              <AnimatedGradientBorder key={index} animate={false} containerClassName="h-full">
                <div className="bg-black/50 backdrop-blur-sm p-6 rounded-xl h-full">
                  <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-3 w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              </AnimatedGradientBorder>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Nasıl <GradientText from="from-indigo-400" to="to-purple-500">Çalışır</GradientText></h2>
            <p className="text-white/70">Sadece birkaç adımda web sitenize özel chatbot oluşturun ve entegre edin.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: '01', title: 'Hesap Oluşturun', description: 'Hızlıca ücretsiz hesap oluşturarak platformumuza erişin.' },
              { number: '02', title: 'Botunuzu Özelleştirin', description: 'İhtiyaçlarınıza göre botunuzu tasarlayın ve davranışını belirleyin.' },
              { number: '03', title: 'Web Sitenize Ekleyin', description: 'Oluşturulan kodu web sitenize ekleyerek chatbotunuzu kullanıma alın.' },
            ].map((step, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="absolute top-10 right-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-transparent hidden md:block"></div>
                )}
                <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 relative z-10">
                  <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 flex items-center justify-center mb-4 text-white font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 blur-3xl -z-10 rounded-3xl"></div>
            <AnimatedGradientBorder containerClassName="w-full">
              <div className="bg-black/50 backdrop-blur-sm p-10 md:p-16 rounded-xl text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Geleceğin Chatbot Deneyimini <br />
                  <GradientText from="from-indigo-400" to="to-purple-500" className="neon-purple">
                    Hemen Keşfedin
                  </GradientText>
                </h2>
                <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
                  Web siteniz için üstün yapay zeka teknolojisiyle çalışan, özelleştirilebilir 
                  chatbotlar oluşturun. Ücretsiz planımızla hemen başlayın.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white min-w-44">
                      Ücretsiz Başla
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 min-w-44">
                      Bize Ulaşın
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedGradientBorder>
          </div>
    </div>
      </section>
    </>
  )
} 