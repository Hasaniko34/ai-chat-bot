'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, Bot, CreditCard, LayoutDashboard, MessageSquare, Plus, Settings, Users, Zap, User, LogOut, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText } from '@/components/ui/gradient-text';
import { AnimatedGradientBorder } from '@/components/ui/animated-gradient-border';
import { useSession, signOut } from 'next-auth/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Animasyonlu Dalga
const WaveBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_50%_300px,rgba(90,60,190,0.1),transparent)] -z-10" />
      <svg
        className="absolute left-0 right-0 top-0 h-20 w-full translate-y-[-40%] transform-gpu blur-3xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
            <stop offset="50%" stopColor="rgba(147,51,234,0.3)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.3)" />
          </linearGradient>
        </defs>
        <path
          fill="url(#gradient)"
          fillOpacity=".6"
          d="M0 60 C 273,93 822,-10 1440,60 V30 H0 V60z"
        ></path>
      </svg>
    </div>
  );
};

// Client-only bileşeni
const ClientOnlyWaveBackground = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return <WaveBackground />;
};

// Sidebar Bileşeni
const Sidebar = () => {
  const pathname = usePathname();
  
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Genel Bakış', href: '/dashboard' },
    { icon: <Bot size={20} />, label: 'Chatbotlarım', href: '/dashboard/bots' },
    { icon: <MessageSquare size={20} />, label: 'Konuşmalar', href: '/dashboard/conversations' },
    { icon: <BarChart3 size={20} />, label: 'Analitikler', href: '/dashboard/analytics' },
    { icon: <Users size={20} />, label: 'Ziyaretçiler', href: '/dashboard/visitors' },
    { icon: <CreditCard size={20} />, label: 'Faturalama', href: '/dashboard/billing' },
    { icon: <Settings size={20} />, label: 'Ayarlar', href: '/dashboard/settings' },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-black/60 backdrop-blur-md border-r border-white/10 z-30 hidden md:block">
      <div className="py-6 px-4">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="relative size-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <div className="absolute inset-1 bg-black rounded-md flex items-center justify-center">
              <Bot className="text-white" size={16} />
            </div>
          </div>
          <span className="font-bold text-xl">
            <GradientText from="from-indigo-400" to="to-purple-500">
              ChatBot
            </GradientText>
            <span className="ml-1">Forge</span>
          </span>
        </Link>
        
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = 
              item.href === '/dashboard' 
                ? pathname === '/dashboard' || pathname === '/dashboard/' 
                : pathname?.startsWith(item.href);
                
            return (
              <Link 
                key={index} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-yellow-400" />
            <p className="text-sm font-medium">Ücretsiz Plan</p>
          </div>
          <p className="text-xs text-white/60 mb-3">
            Daha fazla özelliğe erişmek için planınızı yükseltin.
          </p>
          <Button size="sm" variant="premium" className="w-full text-xs">
            Premium'a Yükselt
          </Button>
        </div>
      </div>
    </div>
  );
};

// Navbar Bileşeni
const Navbar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-md border-b border-white/10 z-20 flex items-center">
      <div className="container px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative size-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <div className="absolute inset-1 bg-black rounded-md flex items-center justify-center">
                <Bot className="text-white" size={16} />
              </div>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 md:pl-64"></div>
        
        <div className="flex items-center gap-4">
          {/* Bildirimler Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                <span className="sr-only md:not-sr-only">Bildirimler</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-black/90 backdrop-blur-md border-white/10">
              <DropdownMenuLabel>Bildirimler</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Örnek bildirimler */}
              <DropdownMenuItem className="py-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                    <span className="font-medium">Yeni bir sohbet başladı</span>
                  </div>
                  <p className="text-white/60 text-xs">Bir ziyaretçi Yardım Asistanı ile konuşmaya başladı.</p>
                  <p className="text-white/50 text-xs mt-1">20 dakika önce</p>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="py-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-green-400" />
                    <span className="font-medium">Bot güncellemesi tamamlandı</span>
                  </div>
                  <p className="text-white/60 text-xs">Yapay Zeka Destek botunuz güncellendi.</p>
                  <p className="text-white/50 text-xs mt-1">1 saat önce</p>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/dashboard/notifications" className="w-full text-center text-indigo-400 text-sm">
                  Tüm bildirimleri görüntüle
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Profil Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="size-9 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-0.5 cursor-pointer">
                <div className="w-full h-full bg-black rounded-full overflow-hidden">
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-xs font-medium">
                    {session?.user?.name ? session.user.name.charAt(0) : "U"}
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-md border-white/10">
              <div className="flex items-center p-3">
                <div className="ml-3 space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name || "Kullanıcı"}</p>
                  <p className="text-xs leading-none text-white/60">{session?.user?.email || "kullanici@ornek.com"}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/bots')}>
                <Bot className="mr-2 h-4 w-4" />
                <span>Botlarım</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Ayarlar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

type DashboardStats = {
  totalBots: number;
  totalConversations: number;
  totalMessages: number;
  activeVisitors: number;
};

type BotCardProps = {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'maintenance';
  lastActivity: string;
  stats: {
    conversations: number;
    conversionRate: number;
  };
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalBots: 0,
    totalConversations: 0,
    totalMessages: 0,
    activeVisitors: 0
  });
  
  const [bots, setBots] = useState<BotCardProps[]>([]);

  // İstatistikleri ve botları yükle
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // API'den istatistikleri ve botları al
        const [statsResponse, botsResponse] = await Promise.all([
          fetch('/api/dashboard/statistics'),
          fetch('/api/bots')
        ]);
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalBots: statsData.totalBots || 0,
            totalConversations: statsData.totalConversations || 0,
            totalMessages: statsData.totalMessages || 0,
            activeVisitors: statsData.activeVisitors || 0
          });
        }
        
        if (botsResponse.ok) {
          const botsData = await botsResponse.json();
          const formattedBots = botsData.bots.map((bot: any) => ({
            id: bot._id || bot.id,
            name: bot.name,
            description: bot.description,
            status: bot.status,
            lastActivity: bot.updatedAt,
            stats: {
              conversations: bot.conversations || 0,
              conversionRate: bot.successRate || 0
            }
          }));
          setBots(formattedBots);
        }
      } catch (error) {
        console.error("Dashboard verileri yüklenirken hata:", error);
        toast.error("Veriler yüklenirken bir hata oluştu");
        
        // Yedek olarak localStorage verilerini al
        try {
          const savedBots = JSON.parse(localStorage.getItem('chatbots') || '[]');
          if (savedBots.length > 0) {
            const formattedBots = savedBots.map((bot: any) => ({
              id: bot.id,
              name: bot.name,
              description: bot.description,
              status: bot.status || 'offline',
              lastActivity: bot.updatedAt,
              stats: {
                conversations: bot.conversations || 0,
                conversionRate: bot.successRate || 0
              }
            }));
            setBots(formattedBots);
            
            // İstatistikler için basit toplamlar
            setStats({
              totalBots: savedBots.length,
              totalConversations: savedBots.reduce((acc: number, bot: any) => acc + (bot.conversations || 0), 0),
              totalMessages: 0, // localStorage'da mesaj sayısı yok
              activeVisitors: 0 // localStorage'da aktif ziyaretçi sayısı yok
            });
          }
        } catch (localError) {
          console.error("localStorage verisi alınırken hata:", localError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Her 1 dakikada bir verileri güncelle
    const interval = setInterval(loadDashboardData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // En son konuşmaları yükle
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  
  useEffect(() => {
    const loadRecentConversations = async () => {
      try {
        const response = await fetch('/api/conversations/recent');
        if (response.ok) {
          const data = await response.json();
          setRecentConversations(data.conversations || []);
        }
      } catch (error) {
        console.error("Son konuşmalar yüklenirken hata:", error);
      }
    };
    
    loadRecentConversations();
    // Her 2 dakikada bir son konuşmaları güncelle
    const interval = setInterval(loadRecentConversations, 120000);
    
    return () => clearInterval(interval);
  }, []);

  // Tarih formatı
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Bilinmiyor';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (60 * 1000));
    
    if (diffMinutes < 1) return 'Şimdi';
    if (diffMinutes < 60) return `${diffMinutes} dakika önce`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  // Sayfa yüklenme animasyon varyantları
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 md:pl-72 px-4 flex justify-center items-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-t-indigo-500 border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-medium">Dashboard Yükleniyor</h3>
          <p className="text-white/60">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ClientOnlyWaveBackground />
      <Sidebar />
      <Navbar />
      
      <main className="pt-24 pb-16 md:pl-72 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold">
              Merhaba, <GradientText>test</GradientText>
            </h1>
            <p className="text-white/60">
              Panel istatistiklerinize ve chatbotlarınıza genel bakış.
            </p>
          </motion.div>
          
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-white/60 mb-1">Toplam Botlar</h3>
                    <div className="text-2xl font-bold">{stats.totalBots}</div>
                  </div>
                  <div className="rounded-full bg-indigo-900/20 p-3">
                    <Bot className="h-6 w-6 text-indigo-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-white/60 mb-1">Toplam Konuşmalar</h3>
                    <div className="text-2xl font-bold">{stats.totalConversations}</div>
                  </div>
                  <div className="rounded-full bg-purple-900/20 p-3">
                    <MessageSquare className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-white/60 mb-1">Toplam Mesajlar</h3>
                    <div className="text-2xl font-bold">{stats.totalMessages}</div>
                  </div>
                  <div className="rounded-full bg-blue-900/20 p-3">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-white/60 mb-1">Aktif Ziyaretçiler</h3>
                    <div className="text-2xl font-bold">{stats.activeVisitors}</div>
                  </div>
                  <div className="rounded-full bg-green-900/20 p-3">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Botlar Başlık */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Botlarım</h2>
            <Link href="/dashboard/bots/new">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Bot Oluştur
              </Button>
            </Link>
          </div>
          
          {/* Bot Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {bots.map((bot) => (
              <Card key={bot.id} className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{bot.name}</CardTitle>
                      <CardDescription className="line-clamp-1 mt-1">
                        {bot.description}
                      </CardDescription>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${
                      bot.status === 'online' ? 'bg-green-500' :
                      bot.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 p-2 rounded-md text-center">
                      <p className="text-sm text-white/60">Konuşmalar</p>
                      <p className="text-lg font-medium">{bot.stats.conversations}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-md text-center">
                      <p className="text-sm text-white/60">Başarı Oranı</p>
                      <p className="text-lg font-medium">%{bot.stats.conversionRate}</p>
                    </div>
                  </div>
                  
                  <div className="flex text-xs text-white/60 mb-4">
                    <p>Son aktivite: {formatDate(bot.lastActivity)}</p>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <Link href={`/dashboard/bots/${bot.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-white/5 border-white/10">
                        Düzenle
                      </Button>
                    </Link>
                    <Link href={`/dashboard/widgets/preview/${bot.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        Görüntüle
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Yeni Bot Oluştur Kartı */}
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-60">
                <div className="rounded-full bg-indigo-900/20 p-5 mb-4">
                  <Plus className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Yeni Bot Oluştur</h3>
                <p className="text-white/60 text-center text-sm mb-4">
                  Özel bir chatbot tasarlayın
                </p>
                <Link href="/dashboard/bots/new">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Yeni Bot Oluştur
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Son Konuşmalar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Son Konuşmalar</h2>
            <Link href="/dashboard/conversations">
              <Button variant="outline" className="text-indigo-400 border-indigo-400/30 bg-indigo-900/10 hover:bg-indigo-900/20">
                Tümünü Görüntüle
              </Button>
            </Link>
          </div>
          
          <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm mb-10">
            <CardContent className="p-0">
              <div className="divide-y divide-white/10">
                {recentConversations.length > 0 ? (
                  recentConversations.map((conversation, index) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-900/20 flex items-center justify-center text-xs font-medium">
                          {conversation.user?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{conversation.user || 'Anonim Kullanıcı'}</p>
                          <p className="text-sm text-white/60 line-clamp-1">{conversation.lastMessage || 'Mesaj yok'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-white/60">{formatDate(conversation.timestamp)}</div>
                        <div className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-900/20 text-indigo-400">
                          {conversation.botName || 'Bot'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Henüz Konuşma Yok</h3>
                    <p className="text-white/60 max-w-md mx-auto">
                      Botlarınızla konuşmalar başladığında burada görünecekler.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 