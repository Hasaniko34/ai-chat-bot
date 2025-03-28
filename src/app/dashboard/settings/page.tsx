'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Loader2, Moon, Sun, Globe, Monitor, Palette, 
  Languages, Bell, Clock, Shield, Trash2, ArrowLeft
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Tip tanımları
interface AppearanceSettings {
  theme: string;
  colorScheme: string;
  fontSize: string;
  reduceAnimations: boolean;
  borderRadius: string;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
  monthlyNewsletter: boolean;
  chatbotUpdates: boolean;
}

interface PrivacySettings {
  collectAnalytics: boolean;
  shareUsageData: boolean;
  cookiePreferences: string;
}

interface SessionSettings {
  autoLogout: string;
  sessionTimeout: string;
}

interface UserSettings {
  appearance: AppearanceSettings;
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  sessions: SessionSettings;
}

const defaultSettings: UserSettings = {
  appearance: {
    theme: 'system',
    colorScheme: 'indigo',
    fontSize: 'medium',
    reduceAnimations: false,
    borderRadius: 'medium',
  },
  language: 'tr',
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    marketingEmails: false,
    monthlyNewsletter: true,
    chatbotUpdates: true,
  },
  privacy: {
    collectAnalytics: true,
    shareUsageData: false,
    cookiePreferences: 'necessary',
  },
  sessions: {
    autoLogout: '30',
    sessionTimeout: '60',
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }
};

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('appearance');
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sayfa yüklendiğinde ayarları getir
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setIsFetching(true);
        console.log('Ayarlar yükleniyor...');
        
        const response = await fetch('/api/user/settings');
        
        // API yanıtını kontrol et
        if (response.ok) {
          const data = await response.json();
          console.log('Ayarlar başarıyla yüklendi');
          setSettings(data.settings || defaultSettings);
        } else {
          // Hata durumunda
          const errorData = await response.json();
          console.error('Ayarlar yüklenirken API hatası:', errorData.error);
          toast.error('Ayarlar yüklenirken bir hata oluştu. Varsayılan ayarlar kullanılıyor.');
          // Varsayılan ayarları kullan
          setSettings(defaultSettings);
        }
      } catch (error: any) {
        console.error('Ayarlar yüklenirken bir hata oluştu:', error);
        toast.error(`Ayarlar yüklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
        // Hata durumunda varsayılan ayarları kullan
        setSettings(defaultSettings);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserSettings();
  }, []);

  // Kullanıcı ayarlarını kaydet
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      console.log('Ayarlar kaydediliyor...', settings);
      
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      const responseData = await response.json();
      
      if (response.ok) {
        toast.success('Ayarlar başarıyla kaydedildi');
        setHasChanges(false);
      } else {
        const errorMessage = responseData.error || 'Ayarlar kaydedilirken bir hata oluştu';
        const errorDetails = responseData.details ? `: ${responseData.details}` : '';
        console.error(`Ayarlar kaydedilirken hata: ${errorMessage}${errorDetails}`);
        toast.error(`${errorMessage}${errorDetails}`);
      }
    } catch (error: any) {
      console.error('Ayarlar kaydedilirken bir istisna oluştu:', error);
      toast.error(`Ayarlar kaydedilirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Hesap silme fonksiyonu
  const handleDeleteAccount = async () => {
    if (window.confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        setIsDeleting(true);
        console.log('Hesap silme işlemi başlatılıyor...');
        
        const response = await fetch('/api/user', {
          method: 'DELETE',
        });

        const responseData = await response.json();

        if (response.ok) {
          console.log('Hesap başarıyla silindi');
          toast.success('Hesabınız başarıyla silindi. Giriş sayfasına yönlendiriliyorsunuz...');
          // Kullanıcıyı giriş sayfasına yönlendir
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        } else {
          const errorMessage = responseData.error || 'Hesap silinirken bir hata oluştu';
          const errorDetails = responseData.details ? `: ${responseData.details}` : '';
          console.error(`Hesap silme hatası: ${errorMessage}${errorDetails}`);
          toast.error(`${errorMessage}${errorDetails}`);
        }
      } catch (error: any) {
        console.error('Hesap silinirken bir istisna oluştu:', error);
        toast.error(`Hesap silinirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Görünüm ayarlarını güncelle
  const updateAppearance = (key: keyof AppearanceSettings, value: any) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        [key]: value
      }
    });
    setHasChanges(true);
  };

  // Bildirim ayarlarını güncelle
  const updateNotifications = (key: keyof NotificationSettings) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
    setHasChanges(true);
  };

  // Gizlilik ayarlarını güncelle
  const updatePrivacy = (key: keyof PrivacySettings, value: any) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    });
    setHasChanges(true);
  };

  // Dil ayarlarını güncelle
  const updateLanguage = (value: string) => {
    setSettings({
      ...settings,
      language: value
    });
    setHasChanges(true);
  };

  // Oturum ayarlarını güncelle
  const updateSessionSettings = (key: keyof SessionSettings, value: string) => {
    setSettings({
      ...settings,
      sessions: {
        ...settings.sessions,
        [key]: value
      }
    });
    setHasChanges(true);
  };

  // Tab'ları değiştir
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-white/70" />
        <p className="mt-4 text-white/70">Ayarlar yükleniyor...</p>
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
      <div className="flex items-center mb-8">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="mr-4 border-white/10 bg-white/5">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uygulama Ayarları</h1>
          <p className="text-white/70 mt-1">
            Uygulama deneyiminizi kişiselleştirin ve tercihlerinizi yönetin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Menü */}
        <motion.div variants={slideUp} className="col-span-1">
          <div className="space-y-2 sticky top-20">
            <Button 
              variant={activeTab === 'appearance' ? 'default' : 'ghost'} 
              className={`w-full justify-start rounded-md p-3 ${activeTab === 'appearance' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
              onClick={() => handleTabClick('appearance')}
            >
              <Palette className="mr-2 h-5 w-5" />
              <span>Görünüm</span>
            </Button>
            <Button 
              variant={activeTab === 'language' ? 'default' : 'ghost'} 
              className={`w-full justify-start rounded-md p-3 ${activeTab === 'language' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
              onClick={() => handleTabClick('language')}
            >
              <Globe className="mr-2 h-5 w-5" />
              <span>Dil</span>
            </Button>
            <Button 
              variant={activeTab === 'notifications' ? 'default' : 'ghost'} 
              className={`w-full justify-start rounded-md p-3 ${activeTab === 'notifications' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
              onClick={() => handleTabClick('notifications')}
            >
              <Bell className="mr-2 h-5 w-5" />
              <span>Bildirimler</span>
            </Button>
            <Button 
              variant={activeTab === 'privacy' ? 'default' : 'ghost'} 
              className={`w-full justify-start rounded-md p-3 ${activeTab === 'privacy' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
              onClick={() => handleTabClick('privacy')}
            >
              <Shield className="mr-2 h-5 w-5" />
              <span>Gizlilik</span>
            </Button>
            <Button 
              variant={activeTab === 'sessions' ? 'default' : 'ghost'} 
              className={`w-full justify-start rounded-md p-3 ${activeTab === 'sessions' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
              onClick={() => handleTabClick('sessions')}
            >
              <Clock className="mr-2 h-5 w-5" />
              <span>Oturumlar</span>
            </Button>
            <Separator className="my-4 bg-white/10" />
            <Button 
              variant="ghost" 
              className="w-full justify-start rounded-md p-3 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-5 w-5" />}
              <span>Hesabı Sil</span>
            </Button>
          </div>
        </motion.div>

        {/* Ana İçerik */}
        <motion.div variants={slideUp} className="col-span-1 lg:col-span-2 space-y-8">
          {/* Görünüm Ayarları */}
          <Card 
            className={`bg-black/40 border-white/10 shadow-xl backdrop-blur-sm ${activeTab === 'appearance' ? 'block' : 'hidden'}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5 text-indigo-400" />
                Görünüm
              </CardTitle>
              <CardDescription>
                Uygulamanın görünümünü ve arayüzünü kişiselleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Tema</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      className={`flex-col h-24 p-2 border-white/10 ${settings.appearance.theme === 'light' ? 'bg-white/20 border-indigo-500' : 'bg-white/5'}`}
                      onClick={() => updateAppearance('theme', 'light')}
                    >
                      <Sun className="h-6 w-6 mb-2" />
                      <span className="text-sm">Açık</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`flex-col h-24 p-2 border-white/10 ${settings.appearance.theme === 'dark' ? 'bg-white/20 border-indigo-500' : 'bg-white/5'}`}
                      onClick={() => updateAppearance('theme', 'dark')}
                    >
                      <Moon className="h-6 w-6 mb-2" />
                      <span className="text-sm">Koyu</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`flex-col h-24 p-2 border-white/10 ${settings.appearance.theme === 'system' ? 'bg-white/20 border-indigo-500' : 'bg-white/5'}`}
                      onClick={() => updateAppearance('theme', 'system')}
                    >
                      <Monitor className="h-6 w-6 mb-2" />
                      <span className="text-sm">Sistem</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Renk Şeması</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <Button 
                      variant="outline" 
                      className={`h-10 p-2 border-white/10 ${settings.appearance.colorScheme === 'indigo' ? 'border-2 border-white' : 'bg-white/5'}`}
                      onClick={() => updateAppearance('colorScheme', 'indigo')}
                    >
                      <div className="h-full w-full rounded bg-gradient-to-r from-indigo-500 to-indigo-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`h-10 p-2 border-white/10 ${settings.appearance.colorScheme === 'purple' ? 'border-2 border-white' : 'bg-white/5'}`}
                      onClick={() => updateAppearance('colorScheme', 'purple')}
                    >
                      <div className="h-full w-full rounded bg-gradient-to-r from-purple-500 to-purple-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`h-10 p-2 border-white/10 ${settings.appearance.colorScheme === 'blue' ? 'border-2 border-white' : 'bg-white/5'}`}
                      onClick={() => updateAppearance('colorScheme', 'blue')}
                    >
                      <div className="h-full w-full rounded bg-gradient-to-r from-blue-500 to-blue-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`h-10 p-2 border-white/10 ${settings.appearance.colorScheme === 'emerald' ? 'border-2 border-white' : 'bg-white/5'}`}
                      onClick={() => updateAppearance('colorScheme', 'emerald')}
                    >
                      <div className="h-full w-full rounded bg-gradient-to-r from-emerald-500 to-emerald-600" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Yazı Tipi Boyutu</h3>
                    <p className="text-xs text-white/60">Uygulamadaki yazı tiplerinin boyutunu ayarlayın</p>
                  </div>
                  <Select 
                    value={settings.appearance.fontSize} 
                    onValueChange={(value) => updateAppearance('fontSize', value)}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10">
                      <SelectItem value="small">Küçük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="large">Büyük</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Animasyonları Azalt</h3>
                    <p className="text-xs text-white/60">Daha iyi performans için animasyonları azaltın</p>
                  </div>
                  <Switch 
                    checked={settings.appearance.reduceAnimations} 
                    onCheckedChange={(checked) => updateAppearance('reduceAnimations', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Dil Ayarları */}
          <Card 
            className={`bg-black/40 border-white/10 shadow-xl backdrop-blur-sm ${activeTab === 'language' ? 'block' : 'hidden'}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5 text-indigo-400" />
                Dil Ayarları
              </CardTitle>
              <CardDescription>
                Uygulama dilini ve bölgesel ayarlarınızı değiştirin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Uygulama Dili</h3>
                    <p className="text-xs text-white/60">Arayüzün dilini değiştirin</p>
                  </div>
                  <Select 
                    value={settings.language} 
                    onValueChange={updateLanguage}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10">
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Bildirim Ayarları */}
          <Card 
            className={`bg-black/40 border-white/10 shadow-xl backdrop-blur-sm ${activeTab === 'notifications' ? 'block' : 'hidden'}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-indigo-400" />
                Bildirimler
              </CardTitle>
              <CardDescription>
                Hangi bildirimleri almak istediğinizi yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Tarayıcı Bildirimleri</h3>
                    <p className="text-xs text-white/60">Uygulamada olmadığınızda tarayıcı bildirimlerini alın</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.pushNotifications} 
                    onCheckedChange={() => updateNotifications('pushNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">E-posta Bildirimleri</h3>
                    <p className="text-xs text-white/60">Önemli olaylarla ilgili e-posta bildirimleri alın</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.emailNotifications} 
                    onCheckedChange={() => updateNotifications('emailNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Pazarlama E-postaları</h3>
                    <p className="text-xs text-white/60">Promosyonlar ve özel teklifler hakkında e-postalar alın</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.marketingEmails} 
                    onCheckedChange={() => updateNotifications('marketingEmails')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Aylık Bülten</h3>
                    <p className="text-xs text-white/60">Aylık ürün güncellemeleri ve haberler</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.monthlyNewsletter} 
                    onCheckedChange={() => updateNotifications('monthlyNewsletter')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Chatbot Güncellemeleri</h3>
                    <p className="text-xs text-white/60">Chatbotlarınızdaki önemli olaylar hakkında bildirimler</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.chatbotUpdates} 
                    onCheckedChange={() => updateNotifications('chatbotUpdates')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Gizlilik Ayarları */}
          <Card 
            className={`bg-black/40 border-white/10 shadow-xl backdrop-blur-sm ${activeTab === 'privacy' ? 'block' : 'hidden'}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-indigo-400" />
                Gizlilik
              </CardTitle>
              <CardDescription>
                Gizlilik ve veri işleme tercihlerinizi yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Analitik Verisi Toplama</h3>
                    <p className="text-xs text-white/60">Uygulamayı geliştirmek için anonim kullanım verilerinin toplanmasına izin verin</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.collectAnalytics} 
                    onCheckedChange={() => updatePrivacy('collectAnalytics', !settings.privacy.collectAnalytics)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Kullanım Verilerini Paylaşma</h3>
                    <p className="text-xs text-white/60">Geliştiricilere kullanım verilerinin paylaşılmasına izin verin</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.shareUsageData} 
                    onCheckedChange={() => updatePrivacy('shareUsageData', !settings.privacy.shareUsageData)}
                  />
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-3">Çerez Tercihleri</h3>
                  <RadioGroup 
                    value={settings.privacy.cookiePreferences}
                    onValueChange={(value) => updatePrivacy('cookiePreferences', value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="necessary" id="necessary" />
                      <Label htmlFor="necessary" className="font-normal">
                        <span className="block text-sm">Sadece Gerekli</span>
                        <span className="block text-xs text-white/60">Yalnızca web sitesinin çalışması için gerekli olan çerezleri kabul edin</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="functional" id="functional" />
                      <Label htmlFor="functional" className="font-normal">
                        <span className="block text-sm">Fonksiyonel</span>
                        <span className="block text-xs text-white/60">Tercihlerinizi hatırlamak için fonksiyonel çerezleri kabul edin</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="font-normal">
                        <span className="block text-sm">Tümü</span>
                        <span className="block text-xs text-white/60">Tüm çerezleri kabul edin, analitik ve pazarlama dahil</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Oturum Ayarları */}
          <Card 
            className={`bg-black/40 border-white/10 shadow-xl backdrop-blur-sm ${activeTab === 'sessions' ? 'block' : 'hidden'}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-indigo-400" />
                Oturum Yönetimi
              </CardTitle>
              <CardDescription>
                Oturum süresi ve otomatik çıkış ayarlarınızı yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Otomatik Çıkış Süresi</h3>
                    <p className="text-xs text-white/60">Belirli bir hareketsizlik süresi sonrasında</p>
                  </div>
                  <Select 
                    value={settings.sessions.autoLogout} 
                    onValueChange={(value) => updateSessionSettings('autoLogout', value)}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10">
                      <SelectItem value="never">Asla</SelectItem>
                      <SelectItem value="15">15 dakika</SelectItem>
                      <SelectItem value="30">30 dakika</SelectItem>
                      <SelectItem value="60">1 saat</SelectItem>
                      <SelectItem value="120">2 saat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Oturum Sona Erme Süresi</h3>
                    <p className="text-xs text-white/60">Yeniden giriş yapmak zorunda kalmadan önce</p>
                  </div>
                  <Select 
                    value={settings.sessions.sessionTimeout} 
                    onValueChange={(value) => updateSessionSettings('sessionTimeout', value)}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10">
                      <SelectItem value="60">1 saat</SelectItem>
                      <SelectItem value="720">12 saat</SelectItem>
                      <SelectItem value="1440">1 gün</SelectItem>
                      <SelectItem value="10080">1 hafta</SelectItem>
                      <SelectItem value="43200">30 gün</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Hesap Silme */}
          <Card className={`bg-black/5 border-red-900/30 shadow-xl backdrop-blur-sm ${activeTab === 'delete' ? 'block' : 'hidden'}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-red-500">
                <Trash2 className="mr-2 h-5 w-5" />
                Hesabı Sil
              </CardTitle>
              <CardDescription className="text-white/70">
                Hesabınızı ve ilgili tüm verileri kalıcı olarak silin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70 mb-4">
                Hesabınızı sildiğinizde, tüm chatbotlarınız, analitikleriniz ve profiliniz dahil olmak üzere 
                tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </p>
              <Button 
                variant="destructive" 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Hesabı Sil
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto flex justify-between">
          <div className="text-white/70">
            {hasChanges && <p>Kaydedilmemiş değişiklikler var</p>}
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading || !hasChanges}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tüm Ayarları Kaydet
          </Button>
        </div>
      </div>
    </motion.div>
  );
} 