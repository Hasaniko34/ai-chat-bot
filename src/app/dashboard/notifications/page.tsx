'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Bell, BellOff, Check, Clock, Settings, 
  AlertCircle, MessageSquare, User, Loader2, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Animasyon varyantları
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }
};

// Bildirim öğesi için tip tanımı
type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'message';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: string;
  link?: string;
};

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Yeni Mesaj',
      message: '"E-Ticaret Asistanı" botunuz için yeni bir mesaj var',
      type: 'message',
      isRead: false,
      timestamp: '2024-03-15T11:40:00Z'
    },
    {
      id: '2',
      title: 'Mesaj Kotası',
      message: 'Aylık mesaj kotanızın %80\'ini kullandınız. Kota limitinizi artırmak için abonelik planınızı yükseltin.',
      type: 'warning',
      isRead: false,
      timestamp: '2024-03-14T09:22:00Z'
    },
    {
      id: '3',
      title: 'Hesap Güvenliği',
      message: 'Hesabınıza yeni bir tarayıcıdan giriş yapıldı. Bu siz değilseniz, lütfen şifrenizi değiştirin.',
      type: 'error',
      isRead: true,
      timestamp: '2024-03-13T16:35:00Z'
    },
    {
      id: '4',
      title: 'Bot Entegrasyonu Tamamlandı',
      message: '"Müşteri Hizmetleri" botunuz başarıyla web sitenize entegre edildi.',
      type: 'success',
      isRead: true,
      timestamp: '2024-03-12T14:20:00Z'
    },
    {
      id: '5',
      title: 'Yeni Özellik: Sesli Yanıtlar',
      message: 'Artık chatbotlarınız sesli yanıtlar verebilir! Yeni özelliği hemen deneyin.',
      type: 'info',
      isRead: true,
      timestamp: '2024-03-11T10:15:00Z'
    },
    {
      id: '6',
      title: 'Analitik Raporunuz Hazır',
      message: 'Geçen ayın analitik raporu hazır. Botunuzun performansını kontrol edin.',
      type: 'info',
      isRead: true,
      timestamp: '2024-03-10T08:30:00Z'
    }
  ]);

  const unreadCount = notifications.filter(item => !item.isRead).length;

  const markAllAsRead = () => {
    setIsLoading(true);

    // API çağrısını simüle et
    setTimeout(() => {
      setNotifications(
        notifications.map(notification => ({
          ...notification,
          isRead: true
        }))
      );
      setIsLoading(false);
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    }, 1000);
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(
      notifications.filter(notification => notification.id !== id)
    );
    toast.success('Bildirim silindi');
  };

  const deleteAllNotifications = () => {
    setIsLoading(true);

    // API çağrısını simüle et
    setTimeout(() => {
      setNotifications([]);
      setIsLoading(false);
      toast.success('Tüm bildirimler silindi');
    }, 1000);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info': return <Bell className="h-5 w-5 text-blue-400" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-amber-400" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'success': return <Check className="h-5 w-5 text-green-400" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-indigo-400" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Bugün, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Dün, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  return (
    <motion.div 
      className="container mx-auto py-8 px-4 md:px-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="mr-4 border-white/10 bg-white/5">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bildirimler</h1>
            <p className="text-white/70 mt-1">
              Tüm sistem bildirimleri ve güncellemeler
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={isLoading}
              className="border-white/10 bg-white/5"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Tümünü Okundu İşaretle
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={deleteAllNotifications}
              disabled={isLoading || notifications.length === 0}
              className="border-white/10 bg-white/5"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
              Tümünü Temizle
            </Button>
          )}
        </div>
      </div>

      <motion.div variants={slideUp} className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-white/5 p-4 mb-4">
                <BellOff className="h-8 w-8 text-white/40" />
              </div>
              <h3 className="text-xl font-medium mb-2">Bildirim Yok</h3>
              <p className="text-white/60 text-center max-w-md">
                Şu anda hiç bildiriminiz bulunmuyor. Önemli sistem bildirimleri ve güncellemeler burada görüntülenecektir.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {unreadCount > 0 && (
              <div className="mb-2">
                <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Okunmamış Bildirimler ({unreadCount})</h2>
              </div>
            )}
            
            {notifications.filter(notification => !notification.isRead).map((notification) => (
              <NotificationCard 
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
            
            {notifications.some(notification => notification.isRead) && (
              <div className="mt-8 mb-2">
                <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Önceki Bildirimler</h2>
              </div>
            )}
            
            {notifications.filter(notification => notification.isRead).map((notification) => (
              <NotificationCard 
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function NotificationCard({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: NotificationItem; 
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { id, title, message, type, isRead, timestamp, link } = notification;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info': return <Bell className="h-5 w-5 text-blue-400" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-amber-400" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'success': return <Check className="h-5 w-5 text-green-400" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-indigo-400" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Bugün, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Dün, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  // Bildirim tipine göre arka plan rengi
  const getBgColor = (type: NotificationType, isRead: boolean) => {
    if (isRead) return "bg-black/40";
    
    switch (type) {
      case 'info': return "bg-blue-950/30";
      case 'warning': return "bg-amber-950/30";
      case 'error': return "bg-red-950/30";
      case 'success': return "bg-green-950/30";
      case 'message': return "bg-indigo-950/30";
      default: return "bg-black/40";
    }
  };

  // Bildirim tipine göre kenarlık rengi
  const getBorderColor = (type: NotificationType, isRead: boolean) => {
    if (isRead) return "border-white/10";
    
    switch (type) {
      case 'info': return "border-blue-800/40";
      case 'warning': return "border-amber-800/40";
      case 'error': return "border-red-800/40";
      case 'success': return "border-green-800/40";
      case 'message': return "border-indigo-800/40";
      default: return "border-white/10";
    }
  };

  return (
    <Card 
      className={cn(
        "shadow-xl backdrop-blur-sm transition-all duration-200",
        getBgColor(type, isRead),
        getBorderColor(type, isRead)
      )}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start">
          <div className={cn(
            "flex-shrink-0 rounded-full p-2",
            isRead ? "bg-white/5" : "bg-white/10"
          )}>
            {getNotificationIcon(type)}
          </div>
          
          <div className="ml-4 flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={cn(
                  "font-medium",
                  isRead ? "text-white/90" : "text-white"
                )}>
                  {title}
                </h3>
                <p className={cn(
                  "text-sm mt-1",
                  isRead ? "text-white/60" : "text-white/80"
                )}>
                  {message}
                </p>
              </div>
              <div className="flex items-center ml-4">
                {!isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkAsRead(id)}
                    className="h-8 w-8 text-white/60 hover:text-white"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(id)}
                  className="h-8 w-8 text-white/60 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center text-xs text-white/50">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(timestamp)}
              </div>
              
              {link && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Görüntüle
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 