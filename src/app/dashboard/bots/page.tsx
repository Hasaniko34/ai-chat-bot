'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Plus, Search, MoreHorizontal, MessageCircle, Users, BarChart3,
  Bot, Settings2, Trash2, ArrowUpDown, Power, Edit, Loader2, ArrowLeft,
  MoreVertical, Eye, Play, Trash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

// Bot listesi için tip tanımı
type BotStatus = 'online' | 'offline' | 'maintenance';

type Bot = {
  id: string;
  _id?: string; // MongoDB'den gelen _id alanı
  name: string;
  description: string;
  status: BotStatus;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  conversations: number;
  users: number;
  successRate: number;
  isPinned?: boolean;
};

// Botları getiren fonksiyon
const fetchBots = async (userId?: string) => {
  try {
    const url = new URL(`${window.location.origin}/api/bots`);
    
    // Kullanıcı ID'si belirtildiyse, URL'ye ekle
    if (userId) {
      url.searchParams.append('userId', userId);
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout ve yeniden deneme olmadan basit fetch
      cache: 'no-store',
    });

    // Yanıtı JSON olarak almaya çalış
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('JSON parse hatası:', e);
      throw new Error('API yanıtı geçersiz JSON formatında');
    }

    if (!response.ok) {
      console.error('API Hatası:', {
        status: response.status,
        url: url.toString(),
        data
      });
      throw new Error(`API hatası: ${response.status} ${response.statusText}`);
    }

    // API sunucu yanıtı başarılı ama veri yok veya geçersiz format
    if (!data.bots || !Array.isArray(data.bots)) {
      console.error('API geçersiz veri döndürdü:', data);
      return []; // Boş dizi döndür
    }

    // MongoDB'den gelen _id alanını id olarak eşleştir
    const normalizedBots = data.bots.map(bot => {
      // Eğer bot'un _id alanı varsa ve id alanı yoksa, _id'yi id olarak kullan
      if (bot._id && !bot.id) {
        return { ...bot, id: bot._id };
      }
      return bot;
    });

    return normalizedBots;
  } catch (error) {
    console.error('Botlar yüklenirken hata:', error);
    // API bağlantısı başarısız olduğunda boş dizi dön
    toast.error('Veritabanı bağlantısı sağlanamadı. Botlar yüklenemiyor.');
    return [];
  }
};

export default function BotsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'offline'>('all');
  
  // Örnek bot verileri
  const [bots, setBots] = useState<Bot[]>([]);

  const filteredBots = bots.filter(bot => {
    // Arama filtresi
    const matchesSearch = 
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Durum filtresi
    const matchesStatus = 
      activeFilter === 'all' || 
      (activeFilter === 'online' && bot.status === 'online') ||
      (activeFilter === 'offline' && (bot.status === 'offline' || bot.status === 'maintenance'));
    
    return matchesSearch && matchesStatus;
  });

  // Botları sırala: Önce sabitlenmiş, sonra online, sonra offline ve bakımda olanlar
  const sortedBots = [...filteredBots].sort((a, b) => {
    // Önce sabitlenmiş botlar
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Sonra durum sıralaması
    const statusOrder = { online: 0, maintenance: 1, offline: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  const toggleBotStatus = async (botId: string) => {
    try {
      const bot = bots.find(b => b.id === botId);
      if (!bot) {
        toast.error("Bot bulunamadı");
        return;
      }
      
      const newStatus = bot?.status === 'online' ? 'offline' : 'online';
      
      // API'ye durumu güncelleme isteği gönder
      // MongoDB _id veya id kullanımını kontrol et
      const id = bot._id || bot.id;
      const response = await fetch(`/api/bots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // UI'ı güncelle
      setBots(prevBots => 
        prevBots.map(bot => 
          bot.id === botId 
            ? { 
                ...bot, 
                status: newStatus
              } 
            : bot
        )
      );
      
      toast.success(`${bot?.name} şimdi ${newStatus === 'online' ? 'aktif' : 'devre dışı'}`);
    } catch (error) {
      console.error('Bot durumu güncellenirken hata:', error);
      toast.error('Bot durumu güncellenirken bir hata oluştu');
    }
  };
  
  const togglePinBot = async (botId: string) => {
    try {
      const bot = bots.find(b => b.id === botId);
      if (!bot) {
        toast.error("Bot bulunamadı");
        return;
      }
      
      const isPinned = !bot?.isPinned;
      
      // API'ye sabitleme durumunu güncelleme isteği gönder
      // MongoDB _id veya id kullanımını kontrol et
      const id = bot._id || bot.id;
      const response = await fetch(`/api/bots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPinned }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // UI'ı güncelle
      setBots(prevBots => 
        prevBots.map(bot => 
          bot.id === botId 
            ? { ...bot, isPinned } 
            : bot
        )
      );
      
      toast.success(`${bot?.name} ${isPinned ? 'sabitlendi' : 'sabitlemesi kaldırıldı'}`);
    } catch (error) {
      console.error('Bot sabitleme durumu güncellenirken hata:', error);
      toast.error('Bot sabitleme durumu güncellenirken bir hata oluştu');
    }
  };
  
  const deleteBot = async (botId: string) => {
    try {
      const bot = bots.find(b => b.id === botId);
      if (!bot) {
        toast.error("Bot bulunamadı");
        return;
      }
      
      // MongoDB _id veya id kullanımını kontrol et
      const id = bot._id || bot.id;
      
      // API'den botu sil
      const response = await fetch(`/api/bots/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Yanıtı JSON olarak almaya çalış
      let result;
      try {
        result = await response.json();
      } catch (e) {
        // JSON parse hatası olabilir, ama bu kritik değil
        console.warn('JSON parse hatası:', e);
      }

      if (!response.ok) {
        // API hata detaylarını logla
        console.error('API Hatası:', {
          status: response.status,
          statusText: response.statusText,
          result
        });
        throw new Error(`API hatası: ${response.status} ${response.statusText}`);
      }

      // UI'ı güncelle
      setBots(prevBots => prevBots.filter(bot => bot.id !== botId));
      
      // Başarı mesajı göster
      toast.success('Bot başarıyla silindi');
    } catch (error) {
      console.error('Bot silinirken hata:', error);
      toast.error('Bot silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: BotStatus) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'maintenance': return 'bg-amber-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: BotStatus) => {
    switch (status) {
      case 'online': return 'Aktif';
      case 'offline': return 'Devre Dışı';
      case 'maintenance': return 'Bakımda';
      default: return 'Bilinmiyor';
    }
  };

  const getBotColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'indigo': 'from-indigo-500 to-indigo-600',
      'emerald': 'from-emerald-500 to-emerald-600',
      'amber': 'from-amber-500 to-amber-600',
      'purple': 'from-purple-500 to-purple-600',
      'blue': 'from-blue-500 to-blue-600',
    };
    
    return colorMap[color] || 'from-indigo-500 to-indigo-600';
  };

  const getGradientClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'indigo': 'from-indigo-500 to-indigo-600',
      'emerald': 'from-emerald-500 to-emerald-600',
      'amber': 'from-amber-500 to-amber-600',
      'purple': 'from-purple-500 to-purple-600',
      'blue': 'from-blue-500 to-blue-600',
    };
    
    return colorMap[color] || 'from-indigo-500 to-indigo-600';
  };

  const formatNumber = (number: number | undefined) => {
    // Eğer sayı undefined ise 0 döndür
    if (number === undefined || number === null) {
      return '0';
    }
    return number.toLocaleString();
  };

  const ActionMenu = ({ bot }: { bot: Bot }) => {
    const router = useRouter();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-black/80 backdrop-blur-sm border-white/10">
          <DropdownMenuItem 
            key="menu-view"
            className="flex items-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              // MongoDB _id veya normal id kullan
              const botId = bot._id || bot.id;
              router.push(`/dashboard/bots/${botId}`);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Görüntüle
          </DropdownMenuItem>
          <DropdownMenuItem 
            key="menu-test"
            className="flex items-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              // MongoDB _id veya normal id kullan
              const botId = bot._id || bot.id;
              console.log("Test için kullanılan bot ID:", botId);
              router.push(`/dashboard/widgets/preview/${botId}`);
            }}
          >
            <Play className="h-4 w-4 mr-2" />
            Test Et
          </DropdownMenuItem>
          <DropdownMenuItem 
            key="menu-delete"
            className="flex items-center text-red-400 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`"${bot.name}" botunu silmek istediğinizden emin misiniz?`)) {
                deleteBot(bot.id);
              }
            }}
          >
            <Trash className="h-4 w-4 mr-2" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // motion.div sorununu çözmek için farklı bir render yaklaşımı
  const renderBotCards = () => {
    if (sortedBots.length === 0) {
      return (
        <div className="col-span-full">
          <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm text-center p-8">
            <div className="flex flex-col items-center justify-center">
              <Bot key="empty-icon" className="h-16 w-16 text-white/40 mb-4" />
              <h3 key="empty-title" className="text-xl font-medium mb-2">Chatbot Bulunamadı</h3>
              <p key="empty-description" className="text-white/60 max-w-md mb-6">
                Aramanıza uygun chatbot bulunamadı. Farklı arama kriterleri deneyebilir veya yeni bir chatbot oluşturabilirsiniz.
              </p>
              <Link key="empty-link" href="/dashboard/bots/new">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Plus className="mr-2 h-4 w-4" /> Yeni Bot Oluştur
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      );
    }
    
    return sortedBots.map((bot, index) => {
      // Bot id'sinin undefined olduğu durumlar için index kullan
      const botKey = bot.id ? `bot-${bot.id}` : `bot-index-${index}`;
      return <BotCard key={botKey} bot={bot} />;
    });
  };

  const BotCard = ({ bot }: { bot: Bot }) => {
    const gradientClass = getGradientClass(bot.color);
    
    return (
      <div
        className="group flex flex-col h-full rounded-xl border overflow-hidden bg-black/40 hover:bg-black/50 border-white/10 transition-all duration-300 shadow-xl transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${gradientClass}`}></div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{bot.icon}</div>
              <div>
                <h3 className="text-lg font-semibold group-hover:text-white/90 transition-colors">
                  {bot.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span 
                    className={`h-2 w-2 rounded-full ${bot.status === 'online' ? 'bg-green-500' : bot.status === 'maintenance' ? 'bg-amber-500' : 'bg-gray-400'}`}
                  ></span>
                  <p className="text-sm text-white/60">
                    {bot.status === 'online' ? 'Aktif' : bot.status === 'maintenance' ? 'Bakımda' : 'Devre Dışı'}
                  </p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="px-1 h-5 hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBotStatus(bot.id);
                    }}
                  >
                    <Power className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <ActionMenu bot={bot} />
          </div>
          
          <p className="text-white/70 text-sm mb-4 flex-1">
            {bot.description}
          </p>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex flex-col items-center justify-center p-2 border border-white/10 rounded-md bg-white/5">
              <div className="text-lg font-semibold">{formatNumber(bot.conversations)}</div>
              <div className="text-xs text-white/50">Konuşma</div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 border border-white/10 rounded-md bg-white/5">
              <div className="text-lg font-semibold">{formatNumber(bot.users)}</div>
              <div className="text-xs text-white/50">Kullanıcı</div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 border border-white/10 rounded-md bg-white/5">
              <div className="text-lg font-semibold">%{bot.successRate}</div>
              <div className="text-xs text-white/50">Başarı</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // useEffect içinde
  useEffect(() => {
    const loadBots = async () => {
      setIsLoading(true);
      
      try {
        // API'den botları getir (kullanıcı ID'si belirtmeden - sunucu tarafında oturum kullanılacak)
        const botData = await fetchBots();
        
        // Veri geldi mi kontrol et
        if (Array.isArray(botData)) {
          console.log("Yüklenen tüm botlar:", JSON.stringify(botData, null, 2));
          
          // ID kontrolü yap - MongoDB'den gelen _id'yi id'ye dönüştür ve id'si olmayanları filtrele
          const validBots = botData
            .map(bot => {
              // Eksik alanlar için varsayılan değerler
              const normalizedBot = {
                conversations: 0,
                users: 0, 
                successRate: 0,
                ...bot
              };
            
              // _id varsa ve id yoksa, _id'yi id olarak kullan
              if (normalizedBot._id && !normalizedBot.id) {
                console.log(`Bot ${normalizedBot.name} için _id -> id dönüşümü yapıldı: ${normalizedBot._id}`);
                normalizedBot.id = normalizedBot._id;
              }
              
              if (normalizedBot.id) {
                console.log(`Bot ${normalizedBot.name} için id mevcut: ${normalizedBot.id}`);
              } else {
                console.warn(`Bot ${normalizedBot.name} için id bulunamadı!`);
              }
              
              return normalizedBot;
            })
            .filter(bot => !!bot.id); // id'si olan botları filtrele
          
          console.log("Filtrelenmiş geçerli botlar:", validBots.length);
          setBots(validBots);
        } else {
          console.error('Beklenmeyen veri formatı:', botData);
          toast.error('Bot verileri alınamadı - beklenmeyen format');
        }
      } catch (error) {
        console.error('Botlar yüklenirken hata:', error);
        toast.error('Botlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBots();
  }, []);

  return (
    <div
      className="container mx-auto py-8 px-4 md:px-6 animate-fadeIn"
    >
      <div key="header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="mr-4 border-white/10 bg-white/5">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chatbotlarım</h1>
            <p className="text-white/70 mt-1">
              Tüm chatbotlarınızı yönetin ve performanslarını izleyin
            </p>
          </div>
        </div>
        <div>
          <Link href="/dashboard/bots/new">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" /> Yeni Bot Oluştur
            </Button>
          </Link>
        </div>
      </div>

      <div key="filters" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input 
            placeholder="Bot ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border-white/10 pl-10 w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs defaultValue={activeFilter} onValueChange={(value) => setActiveFilter(value as 'all' | 'online' | 'offline')}>
            <TabsList className="bg-black/50 border border-white/10 p-1 rounded-lg">
              <TabsTrigger 
                key="tab-all"
                value="all" 
                className={cn(
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600",
                  activeFilter === 'all' ? "bg-gradient-to-r from-indigo-600 to-purple-600" : ""
                )}
              >
                Tümü
              </TabsTrigger>
              <TabsTrigger 
                key="tab-online"
                value="online" 
                className={cn(
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700",
                  activeFilter === 'online' ? "bg-gradient-to-r from-green-600 to-green-700" : ""
                )}
              >
                <div key="tab-online-content" className="flex items-center">
                  <div key="tab-online-dot" className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Aktif
                </div>
              </TabsTrigger>
              <TabsTrigger 
                key="tab-offline"
                value="offline" 
                className={cn(
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-gray-700",
                  activeFilter === 'offline' ? "bg-gradient-to-r from-gray-600 to-gray-700" : ""
                )}
              >
                <div key="tab-offline-content" className="flex items-center">
                  <div key="tab-offline-dot" className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
                  Devre Dışı
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div
        key="bot-grid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp"
      >
        {renderBotCards()}
      </div>
    </div>
  );
} 