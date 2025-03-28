'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, BarChart as BarChartIcon, ArrowUpRight, ArrowDownRight, Users, MessageSquare, Layers, Filter, AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText } from '@/components/ui/gradient-text';
import { AnimatedGradientBorder } from '@/components/ui/animated-gradient-border';
import Link from 'next/link';
import { toast } from 'sonner';

// Veri tipleri
interface TopQuestion {
  question: string;
  count: number;
}

interface TopBot {
  id: string;
  name: string;
  conversations: number;
  successRate: number;
}

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  avgSessionTime: string;
  successRate: number;
  dailyConversations: number[];
  dailyMessages: number[];
  hourlyUsers: number[];
  topQuestions: TopQuestion[];
  topBots: TopBot[];
}

// Analitik görünümü için varsayılan veri
const defaultData: AnalyticsData = {
  totalConversations: 0,
  totalMessages: 0,
  avgSessionTime: '0:00',
  successRate: 0,
  dailyConversations: Array(15).fill(0),
  dailyMessages: Array(15).fill(0),
  hourlyUsers: Array(24).fill(0),
  topQuestions: [],
  topBots: []
};

// Basit grafik bileşeni
const SimpleChart = ({ 
  data, 
  height = 100, 
  color = '#6366f1',
  showLabels = false,
  type = 'line' // 'line', 'bar', 'area'
}: { 
  data: number[], 
  height?: number,
  color?: string,
  showLabels?: boolean,
  type?: 'line' | 'bar' | 'area'
}) => {
  if (!data.length) return null;
  
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min;
  
  // Veri noktalarının toplam genişliği
  const width = data.length - 1;
  
  // Nokta koordinatlarını hesapla
  const points = data.map((value, index) => {
    const x = index;
    const y = max - value; // SVG'de y ekseni ters olduğu için
    return { x, y };
  });
  
  // Çizgi çizmek için path oluştur
  const linePath = points.map((point, i) => 
    i === 0 
      ? `M ${point.x},${point.y}` 
      : `L ${point.x},${point.y}`
  ).join(' ');

  // Alan dolgusu için path
  const areaPath = `
    ${linePath}
    L ${width},${max}
    L 0,${max}
    Z
  `;

  return (
    <div style={{ height: `${height}px` }} className="relative w-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${max}`} preserveAspectRatio="none">
        {/* X ekseni referans çizgisi */}
        <line
          x1="0"
          y1={max}
          x2={width}
          y2={max}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="0.5"
        />
        
        {/* Y ekseni referans çizgileri */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={max - (range * ratio)}
            x2={width}
            y2={max - (range * ratio)}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="0.5"
            strokeDasharray="1 1"
          />
        ))}
        
        {/* Grafik tipi seçimi */}
        {type === 'area' && (
          <path
            d={areaPath}
            fill={`url(#gradient-${color.replace('#', '')})`}
            opacity="0.2"
          />
        )}
        
        {type === 'line' && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        
        {type === 'bar' && points.map((point, i) => (
          <rect
            key={i}
            x={point.x - 0.4}
            y={point.y}
            width="0.8"
            height={max - point.y}
            fill={color}
            opacity="0.7"
            rx="0.2"
          />
        ))}
        
        {/* Gradient tanımı */}
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* X ekseni etiketleri */}
      {showLabels && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/40 mt-1">
          <span>15 gün önce</span>
          <span>Bugün</span>
        </div>
      )}
    </div>
  );
};

// Performans kartı
const PerformanceCard = ({ 
  title, 
  value, 
  change, 
  chartData, 
  icon,
  color = '#6366f1',
  isPositive = true
}: {
  title: string,
  value: string | number,
  change: number,
  chartData: number[],
  icon: React.ReactNode,
  color?: string,
  isPositive?: boolean
}) => {
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const colorClasses = isPositive 
    ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/20' 
    : 'text-rose-400 bg-rose-950/30 border border-rose-500/20';
  
  return (
    <Card className="bg-black/30 border-white/5 backdrop-blur-sm overflow-hidden rounded-xl">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-white/90 text-sm font-medium">{title}</CardTitle>
          <div className="text-white/50 size-7 flex items-center justify-center bg-white/5 rounded-full">{icon}</div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="text-2xl font-semibold mb-3">{value}</div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClasses}`}>
              <span className="flex items-center gap-0.5">
                <Icon size={12} />
                {change}%
              </span>
            </span>
            <span className="text-xs text-white/50">geçen aya göre</span>
          </div>
          <div className="pt-1">
            <div className="w-full h-12 mt-1">
              <StripChart 
                data={chartData} 
                color={color}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Strip Chart - mini bar grafik
const StripChart = ({
  data,
  color
}: {
  data: number[],
  color: string
}) => {
  if (!data.length) return null;
  
  const max = Math.max(...data, 1);
  
  return (
    <div className="flex items-end h-full w-full gap-[2px]">
      {data.map((val, i) => {
        const height = (val / max) * 100;
        
        return (
          <div 
            key={i}
            className="flex-1 rounded-t transition-all duration-200 hover:opacity-80"
            style={{ 
              height: `${height}%`, 
              backgroundColor: color,
              opacity: 0.3 + (i / data.length) * 0.7 // Sonlara doğru daha opak
            }}
          ></div>
        );
      })}
    </div>
  );
};

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>(defaultData);
  const [dateRange, setDateRange] = useState('month');
  const [error, setError] = useState<string | null>(null);
  
  // API'den veri çekme fonksiyonu
  const fetchAnalyticsData = async (range: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Analitik verilerini al
      const analyticsResponse = await fetch(`/api/analytics?range=${range}`);
      
      if (!analyticsResponse.ok) {
        throw new Error('Analitik verileri alınamadı');
      }
      
      const analyticsData = await analyticsResponse.json();
      
      // Bot istatistiklerini al
      const botsResponse = await fetch('/api/bots');
      
      if (!botsResponse.ok) {
        throw new Error('Bot verileri alınamadı');
      }
      
      const botsData = await botsResponse.json();
      
      // Gelen verileri işle ve state'i güncelle
      const processedData: AnalyticsData = {
        totalConversations: analyticsData.totalConversations || 0,
        totalMessages: analyticsData.totalMessages || 0,
        avgSessionTime: analyticsData.avgSessionTime || '0:00',
        successRate: analyticsData.successRate || 0,
        dailyConversations: analyticsData.dailyConversations || Array(15).fill(0),
        dailyMessages: analyticsData.dailyMessages || Array(15).fill(0),
        hourlyUsers: analyticsData.hourlyUsers || Array(24).fill(0),
        topQuestions: analyticsData.topQuestions || [],
        topBots: botsData.bots
          .filter((bot: any) => bot.conversations > 0)
          .sort((a: any, b: any) => b.conversations - a.conversations)
          .slice(0, 3)
          .map((bot: any) => ({
            id: bot._id || bot.id,
            name: bot.name,
            conversations: bot.conversations || 0,
            successRate: bot.successRate || 0
          }))
      };
      
      setData(processedData);
    } catch (error) {
      console.error('Analitik veriler yüklenirken hata:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      toast.error('Analitik veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Tarih aralığı değiştiğinde yeni verileri yükle
  useEffect(() => {
    fetchAnalyticsData(dateRange);
    
    // 5 dakikada bir verileri güncelle
    const interval = setInterval(() => {
      fetchAnalyticsData(dateRange);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [dateRange]);
  
  // Animasyon varyantları
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      } 
    }
  };

  // Hata durumunda
  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 md:pl-72 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-black/30 border border-red-500/20 rounded-xl overflow-hidden backdrop-blur-sm shadow-sm"
          >
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="size-10 rounded-xl bg-black/30 border border-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-white mb-2">Veriler Yüklenemedi</h2>
                  <p className="text-white/60 text-sm mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    className="border-white/5 bg-black/30 hover:bg-black/40 transition-colors rounded-full px-4"
                    onClick={() => fetchAnalyticsData(dateRange)}
                  >
                    <RefreshCcw size={14} className="mr-2" />
                    Yeniden Dene
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
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
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8"
        >
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="border-white/5 bg-black/30 hover:bg-black/40 transition-colors rounded-full">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold mb-1">
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 text-transparent bg-clip-text">Analitikler</span>
              </h1>
              <p className="text-white/50 text-sm">
                Chatbot sisteminin performansı ve kullanıcı etkileşimleri
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-black/30 border border-white/5 rounded-full p-1 shadow-sm">
              <Button
                variant={dateRange === 'week' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs px-4 rounded-full ${dateRange === 'week' ? 'bg-indigo-500/80 text-white shadow-sm' : 'text-white/70 hover:text-white'}`}
                onClick={() => setDateRange('week')}
              >
                Haftalık
              </Button>
              <Button
                variant={dateRange === 'month' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs px-4 rounded-full ${dateRange === 'month' ? 'bg-indigo-500/80 text-white shadow-sm' : 'text-white/70 hover:text-white'}`}
                onClick={() => setDateRange('month')}
              >
                Aylık
              </Button>
              <Button
                variant={dateRange === 'year' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs px-4 rounded-full ${dateRange === 'year' ? 'bg-indigo-500/80 text-white shadow-sm' : 'text-white/70 hover:text-white'}`}
                onClick={() => setDateRange('year')}
              >
                Yıllık
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/5 bg-black/30 hover:bg-black/40 transition-colors rounded-full"
              onClick={() => fetchAnalyticsData(dateRange)}
            >
              <Filter size={14} className="text-white/70 mr-2" />
              Yenile
            </Button>
          </div>
        </motion.div>
        
        {/* Performans Kartları */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={itemVariants}>
            <PerformanceCard
              title="Toplam Konuşmalar"
              value={isLoading ? "..." : data.totalConversations}
              change={12}
              chartData={data.dailyConversations}
              icon={<MessageSquare size={20} />}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <PerformanceCard
              title="Toplam Mesajlar"
              value={isLoading ? "..." : data.totalMessages}
              change={8}
              chartData={data.dailyMessages}
              icon={<Layers size={20} />}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <PerformanceCard
              title="Ortalama Oturum Süresi"
              value={isLoading ? "..." : data.avgSessionTime}
              change={5}
              chartData={[1.8, 2.1, 2.3, 2.8, 2.5, 2.2, 2.7, 3.0, 2.9, 3.1, 3.4, 3.2, 3.8, 3.5, 3.4]}
              icon={<BarChartIcon size={20} />}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <PerformanceCard
              title="Başarı Oranı"
              value={isLoading ? "..." : `${data.successRate}%`}
              change={-2}
              isPositive={false}
              chartData={[90, 92, 91, 89, 90, 88, 86, 87, 90, 89, 88, 90, 87, 86, 89]}
              icon={<Bot size={20} />}
            />
          </motion.div>
        </motion.div>
        
        {/* Ana Grafik */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-black/30 border-white/5 backdrop-blur-sm overflow-hidden rounded-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Konuşma Aktivitesi</CardTitle>
                    <CardDescription className="text-white/60">
                      Zaman içindeki konuşma sayısı ve kullanıcı etkileşimi
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="size-2.5 rounded-full bg-indigo-400"></div>
                      <span className="text-white/70">Konuşmalar</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="size-2.5 rounded-full bg-violet-400"></div>
                      <span className="text-white/70">Mesajlar</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-72 bg-white/5 animate-pulse rounded-lg"></div>
                ) : (
                  <div className="h-72 relative">
                    <div className="absolute inset-y-0 right-0 left-8 flex flex-col justify-between py-2">
                      {/* Y ekseni etiketleri */}
                      <div className="text-xs text-white/40">800</div>
                      <div className="text-xs text-white/40">600</div>
                      <div className="text-xs text-white/40">400</div>
                      <div className="text-xs text-white/40">200</div>
                      <div className="text-xs text-white/40">0</div>
                    </div>
                  
                    <div className="absolute inset-0 pt-2 pr-2 pb-6 pl-8">
                      {/* Ana konuşmalar grafiği */}
                      <BarChart 
                        data={data.dailyConversations.map((val, index) => ({
                          date: new Date(Date.now() - (14 - index) * 24 * 60 * 60 * 1000),
                          value: val
                        }))}
                        valueKey="value"
                        dateKey="date"
                        color="#818cf8"
                      />
                      
                      {/* Mesajlar grafiği (overlay) */}
                      <LineChart 
                        data={data.dailyMessages.map((val, index) => ({
                          date: new Date(Date.now() - (14 - index) * 24 * 60 * 60 * 1000),
                          value: val
                        }))}
                        valueKey="value"
                        dateKey="date"
                        color="#a78bfa"
                        className="absolute inset-0 pt-2 pr-2 pb-6 pl-8 z-10"
                      />
                    </div>
                    
                    {/* X ekseni çizgisi */}
                    <div className="absolute bottom-0 left-8 right-0 h-px bg-white/10"></div>
                    
                    {/* X ekseni etiketleri */}
                    <div className="absolute bottom-2 left-8 right-2 flex justify-between">
                      <div className="text-xs text-white/40">15 gün önce</div>
                      <div className="text-xs text-white/40">10 gün önce</div>
                      <div className="text-xs text-white/40">5 gün önce</div>
                      <div className="text-xs text-white/40">Bugün</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Bot Performansı ve En Çok Sorulan Sorular */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-black/30 border-white/5 backdrop-blur-sm h-full overflow-hidden rounded-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Bot Performansı</CardTitle>
                    <Link href="/dashboard/bots">
                      <Button variant="link" className="text-indigo-400 hover:text-indigo-300 p-0">
                        Tüm Botlar
                      </Button>
                    </Link>
                  </div>
                  <CardDescription className="text-white/60">
                    Botlarınızın konuşma performansı ve başarı oranları
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="size-10 rounded-full bg-white/5 animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/5 rounded animate-pulse"></div>
                            <div className="h-3 bg-white/5 rounded animate-pulse w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : data.topBots.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="size-16 rounded-full bg-black/30 border border-indigo-500/20 text-indigo-400 mx-auto mb-4 flex items-center justify-center">
                        <Bot size={24} />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Henüz Veri Yok</h3>
                      <p className="text-white/60 max-w-md mx-auto">
                        Konuşma verisi olan botlarınız burada listelenecektir. Veriler toplandıkça performans bilgileri eklenecektir.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {data.topBots.map((bot, index) => (
                        <div key={bot.id} className="p-5 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                          <div className="flex-shrink-0">
                            <div className={`size-12 rounded-xl flex items-center justify-center ${
                              index === 0 
                                ? 'bg-gradient-to-br from-indigo-500/10 to-indigo-700/10 text-indigo-400 border border-indigo-500/20' 
                                : index === 1 
                                  ? 'bg-gradient-to-br from-violet-500/10 to-violet-700/10 text-violet-400 border border-violet-500/20' 
                                  : 'bg-gradient-to-br from-pink-500/10 to-pink-700/10 text-pink-400 border border-pink-500/20'
                            }`}>
                              <Bot size={22} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium truncate">{bot.name}</h3>
                              <span className="text-sm text-white/70">{bot.conversations} konuşma</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-white/60">Başarı Oranı</span>
                                <span className="text-white/80 font-medium">{bot.successRate}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    index === 0 
                                      ? 'bg-gradient-to-r from-indigo-400/80 to-indigo-600/80' 
                                      : index === 1 
                                        ? 'bg-gradient-to-r from-violet-400/80 to-violet-600/80' 
                                        : 'bg-gradient-to-r from-pink-400/80 to-pink-600/80'
                                  }`} 
                                  style={{ width: `${bot.successRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <Card className="bg-black/30 border-white/5 backdrop-blur-sm h-full overflow-hidden rounded-xl">
                <CardHeader>
                  <CardTitle>En Çok Sorulan Sorular</CardTitle>
                  <CardDescription className="text-white/60">
                    Kullanıcıların en sık sorduğu konular
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 bg-white/5 rounded animate-pulse"></div>
                          <div className="h-3 bg-white/5 rounded animate-pulse w-1/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : data.topQuestions.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="size-14 rounded-xl bg-black/30 border border-indigo-500/20 text-indigo-400 mx-auto mb-3 flex items-center justify-center">
                        <MessageSquare size={20} />
                      </div>
                      <h3 className="text-base font-medium mb-1">Henüz Soru Yok</h3>
                      <p className="text-white/60 text-sm max-w-xs mx-auto">
                        Kullanıcılarınızdan gelen sorular burada listelenecektir
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 -mx-3">
                      {data.topQuestions.map((item, index) => (
                        <div key={index} className="rounded-lg p-3 hover:bg-white/5 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm line-clamp-1">{item.question}</p>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-950/50 text-indigo-300 border border-indigo-500/20 ml-2">
                              {item.count}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-400/80 to-indigo-600/80 rounded-full" 
                              style={{ width: `${(item.count / data.topQuestions[0].count) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 border-t border-white/5">
                  <Link href="/dashboard/analytics/questions" className="w-full">
                    <Button variant="outline" size="sm" className="border-white/10 bg-white/5 w-full hover:bg-white/10 transition-colors">
                      Tüm Soruları Görüntüle
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Kullanıcı Aktivitesi Grafiği */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-black/30 border-white/5 backdrop-blur-sm overflow-hidden rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Saatlik Aktivite</CardTitle>
                    <CardDescription className="text-white/60">
                      Son 24 saatteki aktif kullanıcı sayısı
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-white/70 bg-blue-500/10 rounded-full px-3 py-1">
                    <Users size={14} className="text-blue-400" />
                    <span className="text-xs font-medium">Aktif: {isLoading ? "..." : data.hourlyUsers[data.hourlyUsers.length - 1]}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-40 bg-white/5 animate-pulse rounded-lg"></div>
                ) : (
                  <div className="h-40 relative">
                    <div className="absolute inset-y-0 right-0 left-8 flex flex-col justify-between py-2">
                      {/* Y ekseni etiketleri */}
                      <div className="text-xs text-white/40">Max</div>
                      <div className="text-xs text-white/40">Ort</div>
                      <div className="text-xs text-white/40">Min</div>
                    </div>
                    
                    <div className="absolute inset-0 pt-2 pr-2 pb-6 pl-8">
                      <AreaChart 
                        data={data.hourlyUsers.map((val, index) => ({
                          hour: index,
                          value: val
                        }))}
                        valueKey="value"
                        dateKey="hour"
                        color="#3b82f6"
                      />
                    </div>
                    
                    {/* X ekseni çizgisi */}
                    <div className="absolute bottom-0 left-8 right-0 h-px bg-white/10"></div>
                    
                    {/* X ekseni etiketleri */}
                    <div className="absolute bottom-2 left-8 right-2 flex justify-between">
                      <div className="text-xs text-white/40">00:00</div>
                      <div className="text-xs text-white/40">06:00</div>
                      <div className="text-xs text-white/40">12:00</div>
                      <div className="text-xs text-white/40">18:00</div>
                      <div className="text-xs text-white/40">23:59</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Bar Chart
const BarChart = ({ 
  data,
  valueKey,
  dateKey,
  color
}: {
  data: { [key: string]: any }[],
  valueKey: string,
  dateKey: string,
  color: string
}) => {
  if (!data.length) return null;
  
  const values = data.map(item => item[valueKey]);
  const max = Math.max(...values, 1);
  
  return (
    <div className="w-full h-full relative">
      {/* Referans çizgileri */}
      {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <div 
          key={i}
          className="absolute w-full border-t border-white/5"
          style={{ top: `${100 - ratio * 100}%` }}
        ></div>
      ))}
      
      {/* Sütunlar */}
      <div className="absolute inset-0 flex items-end">
        {data.map((item, i) => {
          const height = (item[valueKey] / max) * 100;
          
          return (
            <div key={i} className="flex-1 mx-px flex items-end h-full">
              <div 
                className="w-full rounded-t transition-all duration-200 hover:opacity-100"
                style={{ 
                  height: `${height}%`, 
                  backgroundColor: color,
                  opacity: 0.4 
                }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Line Chart
const LineChart = ({
  data,
  valueKey,
  dateKey,
  color,
  className = ""
}: {
  data: { [key: string]: any }[],
  valueKey: string,
  dateKey: string,
  color: string,
  className?: string
}) => {
  if (!data.length) return null;
  
  const values = data.map(item => item[valueKey]);
  const max = Math.max(...values, 1);
  
  // SVG koordinatlarını oluştur
  const points = data.map((item, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (item[valueKey] / max) * 100
  }));
  
  // Çizgi için SVG path'i
  const linePath = points.map((point, i) => 
    i === 0 
      ? `M ${point.x},${point.y}` 
      : `L ${point.x},${point.y}`
  ).join(' ');
  
  return (
    <div className={`w-full h-full relative ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Çizgi */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Veri noktaları */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="1"
            fill="white"
            stroke={color}
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
};

// Area Chart
const AreaChart = ({
  data,
  valueKey,
  dateKey,
  color
}: {
  data: { [key: string]: any }[],
  valueKey: string,
  dateKey: string,
  color: string
}) => {
  if (!data.length) return null;
  
  const values = data.map(item => item[valueKey]);
  const max = Math.max(...values, 1);
  
  // SVG koordinatlarını oluştur
  const points = data.map((item, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (item[valueKey] / max) * 100
  }));
  
  // Çizgi için SVG path'i
  const linePath = points.map((point, i) => 
    i === 0 
      ? `M ${point.x},${point.y}` 
      : `L ${point.x},${point.y}`
  ).join(' ');
  
  // Alan dolgusu için SVG path'i
  const areaPath = `
    ${linePath}
    L 100,100
    L 0,100
    Z
  `;
  
  return (
    <div className="w-full h-full relative">
      {/* Referans çizgileri */}
      {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <div 
          key={i}
          className="absolute w-full border-t border-white/5"
          style={{ top: `${100 - ratio * 100}%` }}
        ></div>
      ))}
      
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Gradient tanımı */}
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        
        {/* Alan */}
        <path
          d={areaPath}
          fill={`url(#gradient-${color.replace('#', '')})`}
        />
        
        {/* Çizgi */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Veri noktaları */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="1"
            fill="white"
            stroke={color}
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}; 