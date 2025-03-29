'use client';

import { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
type ViewType = 'grid' | 'list';

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
  location: {
    country: string;
    city: string;
  };
};

type VisitorStats = {
  totalVisitors: number;
  newVisitorsToday: number;
  totalVisits: number;
  conversionsRate: number;
  growthRate: number;
};

// Tek bir ziyaretçi kartı bileşeni
const VisitorCard = ({ visitor, viewType, t }: { visitor: Visitor; viewType: ViewType; t: (key: string) => string }) => {
  const { t: langT } = useLanguage();
  
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
    return langT(`visitors.source.${source}`);
  };
  
  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return langT('visitors.timeSpent.minutes', { minutes: minutes });
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return langT('visitors.timeSpent.hoursMinutes', { hours: hours, minutes: remainingMinutes });
    }
  };

  return (
    <motion.div variants={itemAnimation}>
      <Card className={cn(
        "bg-black/40 border-white/10 shadow-xl backdrop-blur-sm overflow-hidden hover:bg-black/50 transition-all",
        viewType === 'list' && 'flex items-center'
      )}>
        <CardContent className={cn(
          "p-4",
          viewType === 'list' && 'flex gap-4'
        )}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4" />
              <p className="font-medium">{visitor.ip}</p>
              <Badge className={`border ${getSourceColor(visitor.source)}`}>
                {getSourceLabel(visitor.source)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
              <div>
                <p>{langT('visitors.firstVisit')}</p>
                <p className="font-medium text-foreground">{format(parseISO(visitor.firstVisit), 'dd MMM yyyy', { locale: tr })}</p>
              </div>
              <div>
                <p>{langT('visitors.lastVisit')}</p>
                <p className="font-medium text-foreground">{format(parseISO(visitor.lastVisit), 'dd MMM yyyy', { locale: tr })}</p>
              </div>
              <div>
                <p>{langT('visitors.visits')}</p>
                <p className="font-medium text-foreground">{visitor.visits}</p>
              </div>
              <div>
                <p>{langT('visitors.conversations')}</p>
                <p className="font-medium text-foreground">{visitor.conversations}</p>
              </div>
              <div>
                <p>{langT('visitors.timeSpent.label')}</p>
                <p className="font-medium text-foreground">
                  {formatTimeSpent(visitor.totalTimeSpent)}
                </p>
              </div>
            </div>
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
  const { t } = useLanguage();
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
  
  // Cleanup için ref
  const mounted = useRef(true);
  
  // API'den veri yükleme fonksiyonu
  const loadVisitorData = async () => {
    if (!mounted.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // API'ye istek at
      const response = await fetch(`/api/visitors?range=${timeFilter}`);
      
      if (!response.ok) {
        throw new Error('Ziyaretçi verileri alınamadı');
      }
      
      if (!mounted.current) return;
      
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
      if (!mounted.current) return;
      console.error('Ziyaretçi verileri yüklenirken hata:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      toast.error('Ziyaretçi verileri yüklenirken bir hata oluştu');
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };
  
  // Sayfa yüklendiğinde ve filtreler değiştiğinde veri yükleme
  useEffect(() => {
    loadVisitorData();
    
    // 3 dakikada bir verileri otomatik yenileme
    const interval = setInterval(loadVisitorData, 3 * 60 * 1000);
    
    // Cleanup function
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
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
              <h1 className="text-3xl font-bold tracking-tight">{t('visitors.title')}</h1>
              <p className="text-white/70 mt-1">
                {t('visitors.description')}
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
            <h1 className="text-3xl font-bold tracking-tight">{t('visitors.title')}</h1>
            <p className="text-white/70 mt-1">
              {t('visitors.description')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white/5 border-white/10">
            <Download className="h-4 w-4 mr-2" />
            {t('visitors.exportData')}
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
          title={t('visitors.stats.totalVisitors')}
          value={isLoading ? "..." : stats.totalVisitors.toString()}
          icon={<Users className="h-5 w-5 text-indigo-400" />}
          change={growthText}
          changeType={stats.growthRate >= 0 ? "increase" : "decrease"}
        />
        
        <StatCard 
          title={t('visitors.stats.newVisitors')}
          value={isLoading ? "..." : stats.newVisitorsToday.toString()}
          icon={<UserPlus className="h-5 w-5 text-green-400" />}
          change={t('visitors.stats.today')}
          changeType="neutral"
        />
        
        <StatCard 
          title={t('visitors.stats.totalVisits')}
          value={isLoading ? "..." : stats.totalVisits.toString()}
          icon={<Globe className="h-5 w-5 text-blue-400" />}
          change={`${stats.totalVisits > 0 ? '+8% ' : '0% '}${t('visitors.stats.fromLastWeek')}`}
          changeType="increase"
        />
        
        <StatCard 
          title={t('visitors.stats.conversionRate')}
          value={isLoading ? "..." : `%${stats.conversionsRate}`}
          icon={<BarChart3 className="h-5 w-5 text-purple-400" />}
          change={`${stats.conversionsRate > 10 ? '+2.5% ' : '0% '}${t('visitors.stats.improvement')}`}
          changeType="increase"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm p-4 col-span-1">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{t('visitors.filter.timeFrame')}</h3>
              <Select 
                value={timeFilter} 
                onValueChange={setTimeFilter}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder={t('visitors.filter.timeFrame')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('visitors.filter.allTime')}</SelectItem>
                  <SelectItem value="today">{t('visitors.filter.today')}</SelectItem>
                  <SelectItem value="week">{t('visitors.filter.lastWeek')}</SelectItem>
                  <SelectItem value="month">{t('visitors.filter.lastMonth')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">{t('visitors.filter.source')}</h3>
              <Select 
                value={sourceFilter} 
                onValueChange={setSourceFilter}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder={t('visitors.filter.source')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('visitors.filter.allSources')}</SelectItem>
                  <SelectItem value="direct">{t('visitors.source.direct')}</SelectItem>
                  <SelectItem value="organic">{t('visitors.source.organic')}</SelectItem>
                  <SelectItem value="referral">{t('visitors.source.referral')}</SelectItem>
                  <SelectItem value="social">{t('visitors.source.social')}</SelectItem>
                  <SelectItem value="email">{t('visitors.source.email')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">{t('visitors.filter.deviceType')}</h3>
              <Select 
                value={deviceFilter} 
                onValueChange={setDeviceFilter}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder={t('visitors.filter.deviceType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('visitors.filter.allDevices')}</SelectItem>
                  <SelectItem value="desktop">{t('visitors.deviceType.desktop')}</SelectItem>
                  <SelectItem value="mobile">{t('visitors.deviceType.mobile')}</SelectItem>
                  <SelectItem value="tablet">{t('visitors.deviceType.tablet')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input 
              placeholder={t('visitors.search.placeholder')} 
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
                <h3 className="text-xl font-medium mb-2">{t('visitors.empty.title')}</h3>
                <p className="text-white/60 max-w-md mb-6">
                  {t('visitors.empty.description')}
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
                  {t('common.clear')}
                </Button>
              </div>
            </Card>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerContainer}
            >
              {sortedVisitors.map(visitor => (
                <VisitorCard key={visitor.id} visitor={visitor} viewType="grid" t={t} />
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
                    {t('dashboard.loading')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('dashboard.refresh')}
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