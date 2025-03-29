'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Loader2, Globe, Bell, Clock, Shield, Trash2, ArrowLeft
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/app/contexts/LanguageContext';

// Tip tanımları
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
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  sessions: SessionSettings;
}

const defaultSettings: UserSettings = {
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
  const { data: session } = useSession();
  const { language, changeLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('language');
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  // Kullanıcı oturumunu kontrol et
  useEffect(() => {
    if (session?.user?.id) {
      console.log('Aktif oturum bulundu. Kullanıcı ID:', session.user.id);
      setUserId(session.user.id);
    } else {
      console.error('Oturum bulunamadı veya eksik:', session);
    }
  }, [session]);

  // Sayfa yüklendiğinde ayarları getir
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setIsFetching(true);
        console.log('Ayarlar yükleniyor...', session?.user?.id ? `Kullanıcı ID: ${session.user.id}` : 'Oturum bilgisi yok');
        
        const response = await fetch('/api/user/settings');
        
        // API yanıtını kontrol et
        if (response.ok) {
          const data = await response.json();
          console.log('Ayarlar başarıyla yüklendi');
          
          if (data.userId) {
            console.log('API tarafından dönen kullanıcı ID:', data.userId);
            // Oturum ID'si ile dönen ID farklıysa güncelle 
            if (data.userId !== session?.user?.id) {
              console.log('Oturum ID ile API ID farklı, API ID kullanılacak:', data.userId);
              setUserId(data.userId);
            }
          }
          
          setSettings(data.settings || defaultSettings);
        } else {
          // Hata durumunda
          const errorData = await response.json();
          console.error('Ayarlar yüklenirken API hatası:', errorData.error, errorData.details || '');
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

    if (session?.user?.id) {
      fetchUserSettings();
    }
  }, [session]);

  // Kullanıcı ayarlarını kaydet
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      console.log('Ayarlar kaydediliyor...', userId || session?.user?.id);
      
      // Eğer API'den gelen bir userId varsa onu localStorage'a kaydet
      if (userId && userId !== session?.user?.id) {
        console.log('ID uyumsuzluğu, kaydedilen ayarlar için API tarafından dönen ID kullanılacak:', userId);
        // İleri kullanım için lokale kaydedilebilir
        localStorage.setItem('userIdForSettings', userId);
      }
      
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      const responseData = await response.json();
      
      if (response.ok) {
        // API'den dönen kullanıcı ID'sini güncelle
        if (responseData.userId && responseData.userId !== userId) {
          console.log('Kullanıcı ID güncellemesi:', responseData.userId);
          setUserId(responseData.userId);
        }
        
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
    // Onay kutusu işaretlenmedi ise
    if (!deleteConfirmed) {
      toast.error("Lütfen önce hesap silme işlemini onaylayın", {
        description: "Hesabınızı silmek için onay kutusunu işaretleyin."
      });
      return;
    }

    // Oturum bilgilerini kontrol et
    if (!session?.user?.id) {
      toast.error("Oturum bilgisi bulunamadı", {
        description: "Hesap silme işlemi için aktif bir oturum gereklidir. Lütfen tekrar giriş yapın."
      });
      console.error('Oturum bilgisi eksik:', session);
      return;
    }

    // Ek güvenlik onayı
    if (window.confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz silinecektir.')) {
      try {
        setIsDeleting(true);
        console.log('Hesap silme işlemi başlatılıyor... User ID:', session.user.id);
        
        const response = await fetch('/api/user', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.error('API yanıtını işlerken hata oluştu:', jsonError);
          toast.error("API yanıtını işlerken hata oluştu", {
            description: "Sunucu yanıtı geçersiz format içeriyor."
          });
          setIsDeleting(false);
          return;
        }

        if (response.ok) {
          console.log('Hesap başarıyla silindi:', responseData);
          toast.success('Hesabınız başarıyla silindi. Giriş sayfasına yönlendiriliyorsunuz...');
          
          // Oturumu kapat (Daha iyi bir kullanıcı deneyimi için)
          try {
            await fetch('/api/auth/signout', { method: 'POST' });
            console.log('Oturum başarıyla kapatıldı');
          } catch (signoutError) {
            console.error('Oturum kapatma sırasında hata oluştu:', signoutError);
          }
          
          // Kullanıcıyı giriş sayfasına yönlendir
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        } else {
          const errorCode = response.status;
          const errorMessage = responseData.error || 'Hesap silinirken bir hata oluştu';
          const errorDetails = responseData.details ? `: ${responseData.details}` : '';
          
          console.error(`Hesap silme hatası (${errorCode}): ${errorMessage}${errorDetails}`);
          
          // Hata koduna göre özel mesajlar göster
          switch (errorCode) {
            case 401:
              toast.error("Yetkisiz erişim", {
                description: "Bu işlemi gerçekleştirmek için yetkiniz yok. Lütfen tekrar giriş yapın."
              });
              // Kullanıcıyı giriş sayfasına yönlendir
              setTimeout(() => {
                router.push('/auth/login');
              }, 3000);
              break;
              
            case 404:
              toast.error("Kullanıcı bulunamadı", {
                description: "Hesabınız veritabanında bulunamadı. Lütfen destek ekibiyle iletişime geçin."
              });
              break;
              
            case 500:
              toast.error("Sunucu hatası", {
                description: `Sunucu işlem sırasında bir hata oluştu: ${errorDetails || errorMessage}`
              });
              break;
              
            default:
              toast.error(`Hesap silme hatası: ${errorMessage}`, {
                description: errorDetails || "Beklenmeyen bir hata oluştu."
              });
          }
        }
      } catch (error: any) {
        console.error('Hesap silinirken bir istisna oluştu:', error);
        toast.error(`Hesap silinirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`, {
          description: "Ağ bağlantınızı kontrol edin ve tekrar deneyin."
        });
      } finally {
        setIsDeleting(false);
      }
    }
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

  // "Hesabı Sil" butonuna tıklandığında
  const handleDeleteTab = () => {
    setActiveTab('delete');
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
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-white/70 mt-1">
            {t('settings.description')}
        </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Menü */}
        <motion.div variants={slideUp} className="col-span-1">
          <div className="space-y-2 sticky top-20">
            <Button 
              variant={activeTab === 'language' ? 'default' : 'ghost'} 
              className={`w-full justify-start rounded-md p-3 ${activeTab === 'language' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
              onClick={() => handleTabClick('language')}
            >
              <Globe className="mr-2 h-5 w-5" />
              <span>{t('settings.language')}</span>
            </Button>
            <Button 
              variant={activeTab === 'notifications' ? 'default' : 'ghost'} 
              className={`w-full justify-start rounded-md p-3 ${activeTab === 'notifications' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
              onClick={() => handleTabClick('notifications')}
            >
              <Bell className="mr-2 h-5 w-5" />
              <span>{t('settings.notifications')}</span>
            </Button>
            <Button 
              variant={activeTab === 'privacy' ? 'default' : 'ghost'} 
              className={`w-full justify-start rounded-md p-3 ${activeTab === 'privacy' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
              onClick={() => handleTabClick('privacy')}
            >
              <Shield className="mr-2 h-5 w-5" />
              <span>{t('settings.privacy')}</span>
            </Button>
            <Button 
              variant={activeTab === 'sessions' ? 'default' : 'ghost'} 
              className={`w-full justify-start rounded-md p-3 ${activeTab === 'sessions' ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
              onClick={() => handleTabClick('sessions')}
            >
              <Clock className="mr-2 h-5 w-5" />
              <span>{t('settings.sessions')}</span>
            </Button>
            <Separator className="my-4 bg-white/10" />
            <Button 
              variant="ghost" 
              className="w-full justify-start rounded-md p-3 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              onClick={handleDeleteTab}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-5 w-5" />}
              <span>{t('settings.delete')}</span>
            </Button>
          </div>
        </motion.div>

        {/* Ana İçerik */}
        <motion.div variants={slideUp} className="col-span-1 lg:col-span-2 space-y-8">
          {/* Dil Ayarları */}
          <Card 
            className={`bg-black/40 border-white/10 shadow-xl backdrop-blur-sm ${activeTab === 'language' ? 'block' : 'hidden'}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5 text-indigo-400" />
                {t('settings.language')}
              </CardTitle>
              <CardDescription>
                {t('settings.language.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{t('settings.language')}</h3>
                    <p className="text-xs text-white/60">{t('settings.language.description')}</p>
                  </div>
                  <Select 
                    value={language} 
                    onValueChange={(value) => {
                      // Önce context ile dili değiştir
                      changeLanguage(value);
                      // Ardından ayarları güncelle
                      updateLanguage(value);
                      // Kullanıcıya bildirim göster
                      toast.success(
                        value === 'tr' 
                          ? 'Dil Türkçe olarak değiştirildi' 
                          : 'Language changed to English'
                      );
                      
                      // Dil değişikliğinin tüm uygulamaya yansıması için sayfayı yenile
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    }}
                  >
                    <SelectTrigger className="w-36 bg-white/5 border-white/10">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10">
                      <SelectItem value="tr" className="flex items-center">
                        <span className="mr-2">🇹🇷</span> Türkçe
                      </SelectItem>
                      <SelectItem value="en" className="flex items-center">
                        <span className="mr-2">🇬🇧</span> English
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-6 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                  <h3 className="text-sm font-medium mb-2">{t('settings.language')} {t('settings.info')}</h3>
                  <p className="text-sm text-white/70">
                    {language === 'tr' 
                      ? 'Dil değişiklikleri tüm uygulama genelinde anında etkili olacaktır.' 
                      : 'Language changes will take effect immediately across the entire application.'}
                  </p>
                  <p className="text-sm text-white/70 mt-2">
                    {language === 'tr' 
                      ? 'Şu an seçili dil: Türkçe' 
                      : 'Currently selected language: English'}
                  </p>
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
                {t('settings.notifications')}
              </CardTitle>
              <CardDescription>
                {t('settings.notifications.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{t('notifications.browser')}</h3>
                    <p className="text-xs text-white/60">{t('notifications.browser.description')}</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.pushNotifications} 
                    onCheckedChange={() => updateNotifications('pushNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{t('notifications.email')}</h3>
                    <p className="text-xs text-white/60">{t('notifications.email.description')}</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.emailNotifications} 
                    onCheckedChange={() => updateNotifications('emailNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{t('notifications.marketing')}</h3>
                    <p className="text-xs text-white/60">{t('notifications.marketing.description')}</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.marketingEmails} 
                    onCheckedChange={() => updateNotifications('marketingEmails')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{t('notifications.newsletter')}</h3>
                    <p className="text-xs text-white/60">{t('notifications.newsletter.description')}</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.monthlyNewsletter} 
                    onCheckedChange={() => updateNotifications('monthlyNewsletter')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{t('notifications.chatbot')}</h3>
                    <p className="text-xs text-white/60">{t('notifications.chatbot.description')}</p>
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
                {t('settings.privacy')}
              </CardTitle>
              <CardDescription>
                {t('settings.privacy.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{t('privacy.analytics')}</h3>
                    <p className="text-xs text-white/60">{t('privacy.analytics.description')}</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.collectAnalytics} 
                    onCheckedChange={() => updatePrivacy('collectAnalytics', !settings.privacy.collectAnalytics)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{t('privacy.usage')}</h3>
                    <p className="text-xs text-white/60">{t('privacy.usage.description')}</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.shareUsageData} 
                    onCheckedChange={() => updatePrivacy('shareUsageData', !settings.privacy.shareUsageData)}
                  />
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-3">{t('privacy.cookies')}</h3>
                  <RadioGroup 
                    value={settings.privacy.cookiePreferences}
                    onValueChange={(value) => updatePrivacy('cookiePreferences', value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="necessary" id="necessary" />
                      <Label htmlFor="necessary" className="font-normal">
                        <span className="block text-sm">{t('privacy.cookies.necessary')}</span>
                        <span className="block text-xs text-white/60">{t('privacy.cookies.necessary.description')}</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="functional" id="functional" />
                      <Label htmlFor="functional" className="font-normal">
                        <span className="block text-sm">{t('privacy.cookies.functional')}</span>
                        <span className="block text-xs text-white/60">{t('privacy.cookies.functional.description')}</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="font-normal">
                        <span className="block text-sm">{t('privacy.cookies.all')}</span>
                        <span className="block text-xs text-white/60">{t('privacy.cookies.all.description')}</span>
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
                {t('settings.sessions')}
              </CardTitle>
              <CardDescription>
                {t('settings.sessions.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{t('sessions.autologout')}</h3>
                    <p className="text-xs text-white/60">{t('sessions.autologout.description')}</p>
                  </div>
                  <Select 
                    value={settings.sessions.autoLogout} 
                    onValueChange={(value) => updateSessionSettings('autoLogout', value)}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10">
                      <SelectItem value="never">{t('sessions.never')}</SelectItem>
                      <SelectItem value="15">{language === 'tr' ? '15 dakika' : '15 minutes'}</SelectItem>
                      <SelectItem value="30">{language === 'tr' ? '30 dakika' : '30 minutes'}</SelectItem>
                      <SelectItem value="60">{t('sessions.hour')}</SelectItem>
                      <SelectItem value="120">{language === 'tr' ? '2 saat' : '2 hours'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{t('sessions.timeout')}</h3>
                    <p className="text-xs text-white/60">{t('sessions.timeout.description')}</p>
                  </div>
                  <Select 
                    value={settings.sessions.sessionTimeout} 
                    onValueChange={(value) => updateSessionSettings('sessionTimeout', value)}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10">
                      <SelectItem value="60">{t('sessions.hour')}</SelectItem>
                      <SelectItem value="720">{language === 'tr' ? '12 saat' : '12 hours'}</SelectItem>
                      <SelectItem value="1440">{t('sessions.day')}</SelectItem>
                      <SelectItem value="10080">{t('sessions.week')}</SelectItem>
                      <SelectItem value="43200">{t('sessions.month')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Hesap Silme */}
          <Card className={`bg-black/40 border-red-900/30 shadow-xl backdrop-blur-sm ${activeTab === 'delete' ? 'block' : 'hidden'}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-red-500">
                <Trash2 className="mr-2 h-5 w-5" />
                {t('settings.delete')}
              </CardTitle>
              <CardDescription className="text-white/70">
                {t('settings.delete.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-md p-4">
                <h3 className="text-red-400 font-bold flex items-center mb-2">
                  <span className="mr-2">⚠️</span> {t('delete.warning')}
                </h3>
                <p className="text-sm text-white/80 mb-2">
                  {t('delete.when')}
                </p>
                <ul className="text-sm text-white/70 list-disc pl-5 space-y-1">
                  <li>{t('delete.data1')}</li>
                  <li>{t('delete.data2')}</li>
                  <li>{t('delete.data3')}</li>
                  <li>{t('delete.data4')}</li>
                  <li>{t('delete.data5')}</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-white font-medium mb-2">{t('delete.confirm.title')}</h3>
              <p className="text-sm text-white/70 mb-4">
                  {t('delete.confirm.message')}
                </p>

                <div className="flex items-center space-x-2 mb-6">
                  <Switch 
                    id="delete-confirm" 
                    checked={deleteConfirmed}
                    onCheckedChange={(checked) => setDeleteConfirmed(checked)}
                  />
                  <Label htmlFor="delete-confirm" className="text-sm text-white/80">
                    {t('delete.confirm.checkbox')}
                  </Label>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button 
                  variant="destructive" 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !deleteConfirmed}
                >
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t('delete.button')}
                </Button>
                <Button 
                  variant="ghost"
                  className="border border-white/10 hover:bg-white/5"
                  onClick={() => setActiveTab('language')}
                >
                  {t('delete.cancel')}
              </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto flex justify-between">
          <div className="text-white/70">
            {hasChanges && <p>{t('settings.changes')}</p>}
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading || !hasChanges}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('settings.save')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
} 