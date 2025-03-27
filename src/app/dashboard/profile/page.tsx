'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, Shield, User, LockIcon, BellIcon, CreditCard, Settings, BadgeCheck, ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Animasyon varyantları
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({
    name: 'Ali Yılmaz',
    email: 'ali.yilmaz@example.com',
    avatar: '/avatars/user-1.png',
    role: 'Premium Kullanıcı',
    bio: 'E-ticaret sitemiz için chatbot oluşturuyorum. Müşteri hizmetleri ve ürün önerilerinde kullanıyoruz.',
    company: 'Yılmaz Teknoloji Ltd.',
    location: 'İstanbul, Türkiye',
    website: 'https://aliyilmaz.com',
    notifications: {
      email: true,
      marketing: false,
      updates: true,
      newBots: true
    },
    security: {
      twoFactor: false,
      sessionExpiry: '30 gün',
      lastLogin: '15 Mart 2024, 14:30'
    },
    subscription: {
      plan: 'Premium',
      renewDate: '12 Nisan 2024',
      billing: 'Yıllık'
    }
  });

  useEffect(() => {
    // Simüle edilmiş veri yükleme
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    setIsLoading(true);
    // API çağrısını simüle et
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Profil bilgileriniz başarıyla güncellendi');
    }, 1000);
  };

  const toggleNotification = (key: keyof typeof user.notifications) => {
    setUser({
      ...user,
      notifications: {
        ...user.notifications,
        [key]: !user.notifications[key]
      }
    });
  };

  const toggleTwoFactor = () => {
    setUser({
      ...user,
      security: {
        ...user.security,
        twoFactor: !user.security.twoFactor
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto py-8 px-4 md:px-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Geri butonu */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="text-white/70 hover:text-white gap-2"
        >
          <ArrowLeft size={16} />
          <span>Geri</span>
        </Button>
        <h1 className="text-2xl font-bold ml-2">Profil Sayfası</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sol Profil Kartı */}
        <motion.div variants={slideUp} className="lg:col-span-1">
          <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-indigo-500 shadow-md shadow-indigo-500/20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Button size="sm" variant="ghost" className="text-xs">Değiştir</Button>
                </div>
              </div>
              
              <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
              <div className="flex items-center mt-1 text-sm text-indigo-400">
                <BadgeCheck className="h-4 w-4 mr-1" />
                {user.role}
              </div>
              <p className="mt-4 text-sm text-center text-white/70">{user.bio}</p>
              
              <div className="w-full mt-6 space-y-2">
                <div className="flex items-center text-sm text-white/70">
                  <div className="w-5 mr-2 flex justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span>{user.company}</span>
                </div>
                <div className="flex items-center text-sm text-white/70">
                  <div className="w-5 mr-2 flex justify-center">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center text-sm text-white/70">
                  <div className="w-5 mr-2 flex justify-center">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <span>{user.website}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Sağ İçerik Alanı */}
        <motion.div variants={slideUp} className="lg:col-span-3">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-4 bg-black/50 border border-white/10 p-1 rounded-lg">
              <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
                <User className="h-4 w-4 mr-2" /> Profil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
                <BellIcon className="h-4 w-4 mr-2" /> Bildirimler
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
                <Shield className="h-4 w-4 mr-2" /> Güvenlik
              </TabsTrigger>
              <TabsTrigger value="subscription" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
                <CreditCard className="h-4 w-4 mr-2" /> Abonelik
              </TabsTrigger>
            </TabsList>
            
            {/* Profil Tab İçeriği */}
            <TabsContent value="profile">
              <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Profil Bilgileri</CardTitle>
                  <CardDescription>
                    Profil bilgilerinizi güncelleyin ve düzenleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Soyad</Label>
                      <Input 
                        id="name" 
                        value={user.name} 
                        onChange={(e) => setUser({...user, name: e.target.value})}
                        className="bg-white/5 border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user.email}
                        onChange={(e) => setUser({...user, email: e.target.value})}
                        className="bg-white/5 border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Şirket</Label>
                      <Input 
                        id="company" 
                        value={user.company}
                        onChange={(e) => setUser({...user, company: e.target.value})}
                        className="bg-white/5 border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Konum</Label>
                      <Input 
                        id="location" 
                        value={user.location}
                        onChange={(e) => setUser({...user, location: e.target.value})}
                        className="bg-white/5 border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Web Sitesi</Label>
                      <Input 
                        id="website" 
                        value={user.website}
                        onChange={(e) => setUser({...user, website: e.target.value})}
                        className="bg-white/5 border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Hakkında</Label>
                    <Textarea 
                      id="bio" 
                      value={user.bio}
                      onChange={(e) => setUser({...user, bio: e.target.value})}
                      className="min-h-[100px] bg-white/5 border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Değişiklikleri Kaydet
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Bildirimler Tab İçeriği */}
            <TabsContent value="notifications">
              <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Bildirim Ayarları</CardTitle>
                  <CardDescription>
                    Hangi bildirimler almak istediğinizi yönetin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">E-posta Bildirimleri</p>
                        <p className="text-sm text-white/70">Sistem bildirimleri ve iletişim e-postaları</p>
                      </div>
                      <Switch 
                        checked={user.notifications.email} 
                        onCheckedChange={() => toggleNotification('email')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pazarlama E-postaları</p>
                        <p className="text-sm text-white/70">Promosyonlar, indirimler ve yeni özellikler</p>
                      </div>
                      <Switch 
                        checked={user.notifications.marketing} 
                        onCheckedChange={() => toggleNotification('marketing')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Uygulama Güncellemeleri</p>
                        <p className="text-sm text-white/70">Yeni özellikler ve iyileştirmeler hakkında bildirimler</p>
                      </div>
                      <Switch 
                        checked={user.notifications.updates} 
                        onCheckedChange={() => toggleNotification('updates')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Yeni Bot Bildirimleri</p>
                        <p className="text-sm text-white/70">Bot kullanımı ve performansı hakkında bildirimler</p>
                      </div>
                      <Switch 
                        checked={user.notifications.newBots} 
                        onCheckedChange={() => toggleNotification('newBots')}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Değişiklikleri Kaydet
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Güvenlik Tab İçeriği */}
            <TabsContent value="security">
              <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Güvenlik Ayarları</CardTitle>
                  <CardDescription>
                    Hesap güvenliğinizi yönetin ve şifrenizi değiştirin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">İki Faktörlü Doğrulama</p>
                        <p className="text-sm text-white/70">Ek güvenlik katmanı ekleyin</p>
                      </div>
                      <Switch 
                        checked={user.security.twoFactor} 
                        onCheckedChange={toggleTwoFactor}
                      />
                    </div>
                    
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <Label htmlFor="current-password">Mevcut Şifre</Label>
                      <Input 
                        id="current-password" 
                        type="password" 
                        placeholder="••••••••"
                        className="bg-white/10 border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Yeni Şifre</Label>
                        <Input 
                          id="new-password" 
                          type="password" 
                          placeholder="••••••••"
                          className="bg-white/10 border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Şifreyi Doğrula</Label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          placeholder="••••••••"
                          className="bg-white/10 border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-sm font-medium">Hesap Bilgileri</p>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-white/70">Oturum Sona Erme</span>
                          <span className="text-sm">{user.security.sessionExpiry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-white/70">Son Giriş</span>
                          <span className="text-sm">{user.security.lastLogin}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Değişiklikleri Kaydet
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Abonelik Tab İçeriği */}
            <TabsContent value="subscription">
              <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Abonelik Bilgileri</CardTitle>
                  <CardDescription>
                    Mevcut aboneliğinizi ve ödeme bilgilerinizi yönetin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-gradient-to-r from-indigo-900/30 to-purple-800/30 border border-white/10 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {user.subscription.plan} Plan
                        </h3>
                        <p className="text-sm text-white/70">
                          {user.subscription.billing} faturalama
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                          Aktif
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-white/70">Yenileme Tarihi</span>
                        <span className="text-sm">{user.subscription.renewDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white/70">Aylık Chatbot</span>
                        <span className="text-sm">5/10 kullanılıyor</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white/70">Aylık Mesaj Kotası</span>
                        <span className="text-sm">25,000/50,000 kullanılıyor</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <Button
                        variant="outline"
                        className="border-white/20 text-white/70 hover:text-white hover:border-white/40"
                      >
                        Planı Değiştir
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        Plan Yükselt
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-white/5 border border-white/10 p-6">
                    <h3 className="text-base font-medium mb-4">Ödeme Yöntemi</h3>
                    <div className="flex items-center justify-between p-3 rounded-md bg-white/5 border border-white/10 mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-16 rounded bg-white/10 flex items-center justify-center mr-3">
                          <svg className="h-6 w-6 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Visa sonlanıyor •••• 4242</p>
                          <p className="text-sm text-white/60">Sona Eriyor 04/2025</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Değiştir
                      </Button>
                    </div>
                    
                    <h3 className="text-base font-medium mb-3">Fatura Adresi</h3>
                    <div className="space-y-1 p-3 rounded-md bg-white/5 border border-white/10">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-white/70">{user.company}</p>
                      <p className="text-sm text-white/70">Bağdat Caddesi No:123</p>
                      <p className="text-sm text-white/70">Kadıköy, İstanbul 34710</p>
                      <p className="text-sm text-white/70">Türkiye</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white/70 hover:text-white mr-3"
                  >
                    Aboneliği İptal Et
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Değişiklikleri Kaydet
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Badge({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-indigo-500/20 text-indigo-400", className)}>
      {children}
    </div>
  );
} 