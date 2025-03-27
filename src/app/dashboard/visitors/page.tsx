'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Search,
  Users,
  UserPlus,
  User,
  Clock,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Laptop,
  Smartphone,
  Tablet,
  Filter,
  Download,
  BarChart3,
  MapPin,
  RefreshCw,
  ArrowDown,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

// Animasyon varyantları
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

// Ziyaretçi veri tipleri
type DeviceType = 'desktop' | 'mobile' | 'tablet';
type VisitorSource = 'direct' | 'organic' | 'referral' | 'social' | 'email';

type Visitor = {
  id: string;
  ip: string;
  country: string;
  city: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
  firstVisit: string;
  lastVisit: string;
  visits: number;
  conversations: number;
  totalTimeSpent: number; // saniye cinsinden
  source: VisitorSource;
  pagesViewed: string[];
  referrer?: string;
};

type VisitorStats = {
  totalVisitors: number;
  newVisitorsToday: number;
  totalVisits: number;
  conversionsRate: number;
  growthRate: number;
};

// Tek bir ziyaretçi kartı bileşeni
const VisitorCard = ({ visitor }: { visitor: Visitor }) => {
  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'desktop': return <Laptop className="h-3 w-3" />;
      case 'mobile': return <Smartphone className="h-3 w-3" />;
      case 'tablet': return <Tablet className="h-3 w-3" />;
    }
  };
  
  const getSourceColor = (source: VisitorSource) => {
    switch (source) {
      case 'direct': return 'bg-blue-500/10 text-blue-400 border-blue-400/20';
      case 'organic': return 'bg-green-500/10 text-green-400 border-green-400/20';
      case 'referral': return 'bg-purple-500/10 text-purple-400 border-purple-400/20';
      case 'social': return 'bg-pink-500/10 text-pink-400 border-pink-400/20';
      case 'email': return 'bg-amber-500/10 text-amber-400 border-amber-400/20';
    }
  };
  
  const getSourceLabel = (source: VisitorSource) => {
    switch (source) {
      case 'direct': return 'Doğrudan';
      case 'organic': return 'Organik';
      case 'referral': return 'Yönlendirme';
      case 'social': return 'Sosyal Medya';
      case 'email': return 'E-posta';
    }
  };
  
  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} dk`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} sa ${remainingMinutes} dk`;
    }
  };

  return (
    <motion.div variants={itemAnimation}>
      <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm overflow-hidden hover:bg-black/50 transition-all">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <div className="font-medium">{visitor.ip}</div>
                <div className="flex items-center text-sm text-white/60">
                  <MapPin className="h-3 w-3 mr-1" />
                  {visitor.city}, {visitor.country}
                </div>
              </div>
            </div>
            <Badge className={`border ${getSourceColor(visitor.source)}`}>
              {getSourceLabel(visitor.source)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-md p-2">
              <div className="text-xs text-white/60 mb-1">İlk Ziyaret</div>
              <div className="text-sm">{format(parseISO(visitor.firstVisit), 'dd MMM yyyy', { locale: tr })}</div>
            </div>
            <div className="bg-white/5 rounded-md p-2">
              <div className="text-xs text-white/60 mb-1">Son Ziyaret</div>
              <div className="text-sm">{format(parseISO(visitor.lastVisit), 'dd MMM yyyy', { locale: tr })}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 rounded-md p-2 text-center">
              <div className="text-lg font-semibold">{visitor.visits}</div>
              <div className="text-xs text-white/60">Ziyaretler</div>
            </div>
            <div className="bg-white/5 rounded-md p-2 text-center">
              <div className="text-lg font-semibold">{visitor.conversations}</div>
              <div className="text-xs text-white/60">Konuşmalar</div>
            </div>
            <div className="bg-white/5 rounded-md p-2 text-center">
              <div className="text-lg font-semibold">{formatTimeSpent(visitor.totalTimeSpent)}</div>
              <div className="text-xs text-white/60">Geçirilen Süre</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-white/60">
            <div className="flex items-center">
              <div className="flex items-center mr-3">
                {getDeviceIcon(visitor.deviceType)}
                <span className="ml-1">{visitor.deviceType === 'desktop' ? 'Masaüstü' : visitor.deviceType === 'mobile' ? 'Mobil' : 'Tablet'}</span>
              </div>
              <div>{visitor.browser} / {visitor.os}</div>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Detaylar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// İstatistik Kartı Bileşeni
const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  change: string; 
  changeType: 'increase' | 'decrease' | 'neutral' 
}) => {
  return (
    <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-white/70">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="size-9 rounded-md bg-white/5 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className={cn(
          "mt-3 text-xs flex items-center",
          changeType === 'increase' && "text-green-400",
          changeType === 'decrease' && "text-red-400",
          changeType === 'neutral' && "text-white/60"
        )}>
          {changeType === 'increase' && <ArrowUpRight className="h-3 w-3 mr-1" />}
          {changeType === 'decrease' && <ArrowDownRight className="h-3 w-3 mr-1" />}
          {change}
        </div>
      </CardContent>
    </Card>
  );
};

export default function VisitorsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    newVisitorsToday: 0,
    totalVisits: 0,
    conversionsRate: 0,
    growthRate: 0
  });
  
  // API'den veri yükleme fonksiyonu
  const loadVisitorData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API'ye istek at
      const response = await fetch(`/api/visitors?range=${timeFilter}`);
      
      if (!response.ok) {
        throw new Error('Ziyaretçi verileri alınamadı');
      }
      
      const data = await response.json();
      
      // Veriyi state'e kaydet
      setVisitors(data.visitors || []);
      setStats(data.stats || {
        totalVisitors: 0,
        newVisitorsToday: 0,
        totalVisits: 0,
        conversionsRate: 0,
        growthRate: 0
      });
      
    } catch (error) {
      console.error('Ziyaretçi verileri yüklenirken hata:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      toast.error('Ziyaretçi verileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde ve filtreler değiştiğinde veri yükleme
  useEffect(() => {
    loadVisitorData();
    
    // 3 dakikada bir verileri otomatik yenileme
    const interval = setInterval(loadVisitorData, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [timeFilter]);
  
  // Filtreleme fonksiyonu
  const filteredVisitors = visitors.filter(visitor => {
    // Arama filtresi
    const matchesSearch = 
      visitor.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.browser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.os.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Kaynak filtresi
    const matchesSource = 
      sourceFilter === 'all' || 
      visitor.source === sourceFilter;
    
    // Cihaz filtresi
    const matchesDevice = 
      deviceFilter === 'all' || 
      visitor.deviceType === deviceFilter;
    
    return matchesSearch && matchesSource && matchesDevice;
  });

  // Ziyaretçileri en son ziyaret tarihine göre sırala
  const sortedVisitors = [...filteredVisitors].sort((a, b) => {
    return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
  });
  
  // Büyüme oranı metni
  const growthText = `${stats.growthRate >= 0 ? '+' : ''}${stats.growthRate}% geçen haftaya göre`;
  
  // Ay başından şimdiye kadar geçen süreyi hesaplama
  const now = new Date();
  const monthStart = startOfMonth(now);
  const daysIntoMonth = now.getDate();
  const totalDaysInMonth = endOfMonth(now).getDate();
  const monthProgress = (daysIntoMonth / totalDaysInMonth) * 100;
  
  // Hata durumunda
  if (error) {
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
              <h1 className="text-3xl font-bold tracking-tight">Ziyaretçiler</h1>
              <p className="text-white/70 mt-1">
                Sitenizin ve chatbotlarınızın ziyaretçi istatistikleri
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-8">
          <h2 className="text-xl font-medium text-red-400 mb-2">Hata</h2>
          <p className="text-white/70">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-white/10 bg-white/5"
            onClick={loadVisitorData}
          >
            Yeniden Dene
          </Button>
        </div>
      </motion.div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Ziyaretçiler</h1>
            <p className="text-white/70 mt-1">
              Sitenizin ve chatbotlarınızın ziyaretçi istatistikleri
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white/5 border-white/10">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={loadVisitorData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Toplam Ziyaretçiler" 
          value={isLoading ? "..." : stats.totalVisitors.toString()}
          icon={<Users className="h-5 w-5 text-indigo-400" />}
          change={growthText}
          changeType={stats.growthRate >= 0 ? "increase" : "decrease"}
        />
        
        <StatCard 
          title="Yeni Ziyaretçiler" 
          value={isLoading ? "..." : stats.newVisitorsToday.toString()}
          icon={<UserPlus className="h-5 w-5 text-green-400" />}
          change="Bugün"
          changeType="neutral"
        />
        
        <StatCard 
          title="Toplam Ziyaretler" 
          value={isLoading ? "..." : stats.totalVisits.toString()}
          icon={<Globe className="h-5 w-5 text-blue-400" />}
          change="+18% geçen haftaya göre"
          changeType="increase"
        />
        
        <StatCard 
          title="Dönüşüm Oranı" 
          value={isLoading ? "..." : `%${stats.conversionsRate}`}
          icon={<BarChart3 className="h-5 w-5 text-purple-400" />}
          change="+5% geçen aya göre"
          changeType="increase"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm p-4 col-span-1">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Zaman Aralığı</h3>
              <Select 
                value={timeFilter} 
                onValueChange={setTimeFilter}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Tüm zamanlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm zamanlar</SelectItem>
                  <SelectItem value="week">Son 7 gün</SelectItem>
                  <SelectItem value="month">Son 30 gün</SelectItem>
                  <SelectItem value="quarter">Son 90 gün</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Kaynak</h3>
              <Select 
                value={sourceFilter} 
                onValueChange={setSourceFilter}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Tüm kaynaklar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm kaynaklar</SelectItem>
                  <SelectItem value="direct">Doğrudan</SelectItem>
                  <SelectItem value="organic">Organik</SelectItem>
                  <SelectItem value="referral">Yönlendirme</SelectItem>
                  <SelectItem value="social">Sosyal Medya</SelectItem>
                  <SelectItem value="email">E-posta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Cihaz Tipi</h3>
              <Select 
                value={deviceFilter} 
                onValueChange={setDeviceFilter}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Tüm cihazlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm cihazlar</SelectItem>
                  <SelectItem value="desktop">Masaüstü</SelectItem>
                  <SelectItem value="mobile">Mobil</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input 
              placeholder="Ziyaretçi ara (IP, ülke, şehir, tarayıcı, OS...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border-white/10 pl-10 w-full"
            />
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-white/10 rounded animate-pulse w-24"></div>
                          <div className="h-3 bg-white/10 rounded animate-pulse w-32"></div>
                        </div>
                      </div>
                      <div className="h-5 bg-white/10 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-md p-2 space-y-1">
                          <div className="h-3 bg-white/10 rounded animate-pulse w-16"></div>
                          <div className="h-4 bg-white/10 rounded animate-pulse w-20"></div>
                        </div>
                        <div className="bg-white/5 rounded-md p-2 space-y-1">
                          <div className="h-3 bg-white/10 rounded animate-pulse w-16"></div>
                          <div className="h-4 bg-white/10 rounded animate-pulse w-20"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 rounded-md p-2 space-y-1">
                          <div className="h-4 bg-white/10 rounded animate-pulse w-8 mx-auto"></div>
                          <div className="h-3 bg-white/10 rounded animate-pulse w-12 mx-auto"></div>
                        </div>
                        <div className="bg-white/5 rounded-md p-2 space-y-1">
                          <div className="h-4 bg-white/10 rounded animate-pulse w-8 mx-auto"></div>
                          <div className="h-3 bg-white/10 rounded animate-pulse w-12 mx-auto"></div>
                        </div>
                        <div className="bg-white/5 rounded-md p-2 space-y-1">
                          <div className="h-4 bg-white/10 rounded animate-pulse w-8 mx-auto"></div>
                          <div className="h-3 bg-white/10 rounded animate-pulse w-12 mx-auto"></div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-white/10 rounded animate-pulse w-32"></div>
                        <div className="h-3 bg-white/10 rounded animate-pulse w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedVisitors.length === 0 ? (
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm text-center p-8">
              <div className="flex flex-col items-center justify-center">
                <Users className="h-16 w-16 text-white/40 mb-4" />
                <h3 className="text-xl font-medium mb-2">Ziyaretçi Bulunamadı</h3>
                <p className="text-white/60 max-w-md mb-6">
                  Aramanıza uygun ziyaretçi bulunamadı. Filtreleri değiştirerek daha geniş sonuçlar görebilirsiniz.
                </p>
                <Button 
                  variant="outline" 
                  className="bg-white/5 border-white/10"
                  onClick={() => {
                    setTimeFilter('all');
                    setSourceFilter('all');
                    setDeviceFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Filtreleri Temizle
                </Button>
              </div>
            </Card>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerContainer}
            >
              {sortedVisitors.map(visitor => (
                <VisitorCard key={visitor.id} visitor={visitor} />
              ))}
            </motion.div>
          )}
          
          {!isLoading && filteredVisitors.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline" 
                className="bg-black/40 border-white/10 hover:bg-white/5"
                onClick={() => loadVisitorData()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Verileri Yenile
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
} 