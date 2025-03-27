'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Bot, ArrowLeft, Edit, Trash2, Play, MessageSquare, Users,
  BarChart3, Settings, Loader2, Save, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText } from '@/components/ui/gradient-text';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

type Bot = {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'maintenance';
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  conversations: number;
  users: number;
  successRate: number;
  isPinned?: boolean;
  websiteUrl?: string;
  knowledge?: string;
  primaryColor?: string;
  secondaryColor?: string;
  greeting?: string;
  avatar?: string;
};

export default function BotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params.id as string;
  
  const [bot, setBot] = useState<Bot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBot, setEditedBot] = useState<Bot | null>(null);
  
  // Bot verilerini getir
  const fetchBot = async (botId: string) => {
    try {
      // API'den bot verilerini çek
      const response = await fetch(`/api/bots/${botId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const bot = await response.json();
      return bot;
    } catch (error) {
      console.error('Bot verileri alınırken hata:', error);
      // Hata durumunda localStorage'dan al (geri dönüş stratejisi)
      const savedBots = JSON.parse(localStorage.getItem('chatbots') || '[]');
      const botFromStorage = savedBots.find((b: any) => b.id === botId);
      return botFromStorage;
    }
  };

  // Bot verilerini güncelle
  const updateBot = async (botId: string, botData: any) => {
    try {
      // API'ye bot verilerini gönder
      const response = await fetch(`/api/bots/${botId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(botData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedBot = await response.json();
      return updatedBot;
    } catch (error) {
      console.error('Bot güncellenirken hata:', error);
      // Hata durumunda localStorage'da güncelle (geri dönüş stratejisi)
      const savedBots = JSON.parse(localStorage.getItem('chatbots') || '[]');
      const updatedBots = savedBots.map((b: any) => {
        if (b.id === botId) {
          return { ...b, ...botData, updatedAt: new Date().toISOString() };
        }
        return b;
      });
      localStorage.setItem('chatbots', JSON.stringify(updatedBots));
      
      // Güncellenen botun bir kopyasını döndür
      const updatedBot = updatedBots.find((b: any) => b.id === botId);
      return updatedBot;
    }
  };

  // Bot verilerini sil
  const deleteBot = async (botId: string) => {
    try {
      // API'den botu sil
      const response = await fetch(`/api/bots/${botId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Bot silinirken hata:', error);
      // Hata durumunda localStorage'dan sil (geri dönüş stratejisi)
      const savedBots = JSON.parse(localStorage.getItem('chatbots') || '[]');
      const updatedBots = savedBots.filter((b: any) => b.id !== botId);
      localStorage.setItem('chatbots', JSON.stringify(updatedBots));
      return true;
    }
  };

  // Komponent içinde kullanımı
  useEffect(() => {
    const loadBot = async () => {
      if (!botId) return;
      
      setIsLoading(true);
      
      try {
        const botData = await fetchBot(botId);
        
        if (!botData) {
          toast.error('Bot bulunamadı');
          router.push('/dashboard/bots');
          return;
        }
        
        setBot(botData);
        
        // Form verilerini ayarla
        setEditedBot(JSON.parse(JSON.stringify(botData)));
        
        // İstatistikleri yükle
        loadBotStatistics(botId);
        
      } catch (error) {
        console.error('Bot yüklenirken hata:', error);
        toast.error('Bot yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    // İstatistikleri yüklemek için yardımcı fonksiyon
    const loadBotStatistics = async (id: string) => {
      try {
        const statsResponse = await fetch(`/api/bots/${id}/statistics`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          
          // Bot verisini istatistik verileriyle güncelle
          setBot(prev => {
            if (!prev) return null;
            return {
              ...prev,
              conversations: statsData.totalConversations || prev.conversations || 0,
              users: statsData.uniqueUsers || prev.users || 0,
              successRate: statsData.successRate || prev.successRate || 0
            };
          });
        }
      } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
      }
    };
    
    loadBot();
    
    // Periyodik istatistik güncelleme intervali
    const statsInterval = setInterval(() => {
      if (botId) {
        loadBotStatistics(botId);
      }
    }, 30000); // Her 30 saniyede bir güncelle
    
    // Bileşen temizlendiğinde interval'i temizle
    return () => {
      clearInterval(statsInterval);
    };
    
  }, [botId, router]);
  
  // Botu sil
  const handleDeleteBot = async () => {
    if (confirm(`"${bot?.name}" botunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      try {
        setIsDeleting(true);
        const success = await deleteBot(botId);
        
        if (success) {
          toast.success('Bot başarıyla silindi');
          router.push('/dashboard/bots');
        } else {
          toast.error('Bot silinirken bir hata oluştu');
          setIsDeleting(false);
        }
      } catch (error) {
        console.error('Bot silme hatası:', error);
        toast.error('Bot silinirken bir hata oluştu');
        setIsDeleting(false);
      }
    }
  };
  
  // Botu güncelle
  const handleUpdateBot = async () => {
    if (!editedBot) return;
    
    try {
      const updatedBot = await updateBot(botId, editedBot);
      setBot(updatedBot);
      setIsEditing(false);
      toast.success('Bot başarıyla güncellendi');
    } catch (error) {
      console.error('Bot güncellenirken hata:', error);
      toast.error('Bot güncellenirken bir hata oluştu');
    }
  };
  
  // Düzenlenmiş bot verilerini güncelle
  const updateEditedBot = (key: string, value: any) => {
    if (!editedBot) return;
    setEditedBot({ ...editedBot, [key]: value });
  };
  
  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  // Test sohbeti başlat
  const startTestChat = () => {
    toast.info('Test sohbeti hazırlanıyor...');
    setTimeout(() => {
      // Gerçek uygulamada botun sohbet sayfasına yönlendirilir
      toast.success('Test sohbeti başlatıldı');
      router.push(`/dashboard/widgets/preview/${botId}`);
    }, 1000);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 md:pl-72 px-4 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium">Bot Yükleniyor</h3>
          <p className="text-white/60">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }
  
  if (!bot) {
    return (
      <div className="min-h-screen pt-24 pb-16 md:pl-72 px-4 flex justify-center items-center">
        <div className="text-center">
          <Bot className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium">Bot Bulunamadı</h3>
          <p className="text-white/60 mb-6">Aradığınız bot mevcut değil veya silinmiş olabilir.</p>
          <Link href="/dashboard/bots">
            <Button>Botlarıma Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 md:pl-72 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <Link href="/dashboard/bots">
            <Button variant="outline" size="icon" className="mr-4 border-white/10 bg-white/5">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold mr-3">
                {bot.icon} {bot.name}
              </h1>
              <Badge className={`bg-green-500/10 text-green-400 border-green-400/20`}>
                {bot.status === 'online' ? 'Aktif' : bot.status === 'maintenance' ? 'Bakımda' : 'Devre Dışı'}
              </Badge>
            </div>
            <p className="text-white/60">
              {bot.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white/5 border-white/10" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/5 border-white/10 text-green-400 hover:text-green-300"
              onClick={startTestChat}
            >
              <Play className="h-4 w-4 mr-2" />
              Test Et
            </Button>
          </div>
        </motion.div>
        
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="bg-black/50 border border-white/10">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="content">İçerik</TabsTrigger>
            <TabsTrigger value="settings">Ayarlar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Bot Bilgileri</CardTitle>
                    <CardDescription>Temel bilgiler ve istatistikler</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-white/60">Bot ID</div>
                      <div className="font-mono text-xs bg-black/40 p-2 rounded mt-1 overflow-x-auto">
                        {bot.id}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-white/60">Oluşturulma</div>
                        <div className="text-sm">{formatDate(bot.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Son Güncelleme</div>
                        <div className="text-sm">{formatDate(bot.updatedAt)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-white/60">Website URL</div>
                      <div className="text-sm mt-1 break-all">
                        {bot.websiteUrl ? (
                          <a 
                            href={bot.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline"
                          >
                            {bot.websiteUrl}
                          </a>
                        ) : (
                          <span className="text-white/40">Belirtilmemiş</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-2 bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Performans</CardTitle>
                    <CardDescription>Bot kullanım istatistikleri</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="flex justify-center mb-2">
                          <MessageSquare className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div className="text-2xl font-bold">
                          {(bot.conversations !== undefined ? bot.conversations : 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-white/60">Toplam Konuşma</div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="flex justify-center mb-2">
                          <Users className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold">
                          {(bot.users !== undefined ? bot.users : 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-white/60">Kullanıcılar</div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="flex justify-center mb-2">
                          <BarChart3 className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold">
                          %{bot.successRate !== undefined ? bot.successRate : 0}
                        </div>
                        <div className="text-sm text-white/60">Başarı Oranı</div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm font-medium mb-2">Son Aktivite</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                            <span>Bot güncellendiğinde burada görünür</span>
                          </div>
                          <div className="text-white/60">
                            {bot.updatedAt ? formatDate(bot.updatedAt) : 'Tarih yok'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                            <span>Son aktivite MongoDB'den alınıyor</span>
                          </div>
                          <div className="text-white/60">Gerçek zamanlı</div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                            <span>Bot oluşturuldu</span>
                          </div>
                          <div className="text-white/60">
                            {bot.createdAt ? formatDate(bot.createdAt) : 'Tarih yok'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Bot Bilgilerini Düzenle</CardTitle>
                    <CardDescription>Temel bot bilgilerini güncelleyin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-white/70">
                        Bot Adı
                      </label>
                      <Input
                        id="name"
                        value={editedBot?.name || ''}
                        onChange={(e) => updateEditedBot('name', e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium text-white/70">
                        Açıklama
                      </label>
                      <Textarea
                        id="description"
                        value={editedBot?.description || ''}
                        onChange={(e) => updateEditedBot('description', e.target.value)}
                        className="bg-white/5 border-white/10 text-white min-h-24"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="websiteUrl" className="text-sm font-medium text-white/70">
                        Website URL
                      </label>
                      <Input
                        id="websiteUrl"
                        value={editedBot?.websiteUrl || ''}
                        onChange={(e) => updateEditedBot('websiteUrl', e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-white/10 pt-4">
                    <Button 
                      variant="outline" 
                      className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border-0"
                      onClick={handleDeleteBot}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Siliniyor...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Botu Sil
                        </>
                      )}
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="bg-white/5 border-white/10"
                        onClick={() => setIsEditing(false)}
                      >
                        İptal
                      </Button>
                      <Button 
                        onClick={handleUpdateBot}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
                
                <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Gemini Entegrasyonu</CardTitle>
                    <CardDescription>Yapay zeka modeli ayarları</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-full bg-indigo-500/20 p-2 text-indigo-400">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Yapay Zeka Modeli</p>
                          <p className="text-xs text-white/60">Bot şu anda Gemini-2.0-Flash modelini kullanıyor</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Model</span>
                          <span className="font-medium">gemini-2.0-flash</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Maksimum Token</span>
                          <span className="font-medium">2048</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Sıcaklık</span>
                          <span className="font-medium">0.6</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="greeting" className="text-sm font-medium text-white/70">
                        Karşılama Mesajı
                      </label>
                      <Textarea
                        id="greeting"
                        value={editedBot?.greeting || ''}
                        onChange={(e) => updateEditedBot('greeting', e.target.value)}
                        className="bg-white/5 border-white/10 text-white min-h-24"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="content" className="mt-6">
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Bot Bilgi Tabanı</CardTitle>
                <CardDescription>Botun kullandığı bilgiler ve içerikler</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editedBot?.knowledge || ''}
                      onChange={(e) => updateEditedBot('knowledge', e.target.value)}
                      className="bg-white/5 border-white/10 text-white min-h-80 font-mono text-sm"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleUpdateBot}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Değişiklikleri Kaydet
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-black/50 p-4 rounded-lg border border-white/10 min-h-80 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap">
                        {bot.knowledge || 'Bu bot için herhangi bir özel bilgi tabanı eklenmemiş.'}
                      </pre>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        className="bg-white/5 border-white/10"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        İçeriği Düzenle
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Entegrasyon Bilgileri</CardTitle>
                <CardDescription>Web sitenize entegre etme kodu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black/60 p-3 rounded-md overflow-x-auto text-xs font-mono text-white/80">
                  &lt;script&gt;<br />
                  &nbsp;&nbsp;(function(d,t) {"{"}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;var BASE_URL = "https://chatbot-forge.example.com";<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;var g=d.createElement(t),s=d.getElementsByTagName(t)[0];<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;g.src=BASE_URL+"/widget/loader.js"; g.defer=true; g.async=true;<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;s.parentNode.insertBefore(g,s);<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;g.onload=function(){"{"}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;window.ChatBotForge.init({"{"}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;botId: "{bot.id}",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;primaryColor: "{bot.primaryColor || '#6366f1'}",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;secondaryColor: "{bot.secondaryColor || '#a855f7'}"<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"}"});<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br />
                  &nbsp;&nbsp;{"}"}(document,"script"));<br />
                  &lt;/script&gt;
                </div>
                <p className="text-xs text-white/50 mt-3">
                  Bu kodu web sitenizin &lt;body&gt; etiketinin sonuna ekleyin.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 