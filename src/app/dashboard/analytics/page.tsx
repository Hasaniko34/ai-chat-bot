'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, BarChart, ArrowUpRight, ArrowDownRight, Users, MessageSquare, Layers, Filter } from 'lucide-react';
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
  lineColor = 'rgba(99, 102, 241, 0.8)',
  fillColor = 'rgba(99, 102, 241, 0.2)',
  showLabels = false
}: { 
  data: number[], 
  height?: number,
  lineColor?: string,
  fillColor?: string,
  showLabels?: boolean
}) => {
  if (!data.length) return null;
  
  const max = Math.max(...data);
  
  return (
    <div style={{ height: `${height}px` }} className="relative">
      <svg width="100%" height="100%" viewBox={`0 0 ${data.length} ${max || 1}`} preserveAspectRatio="none">
        {/* Doldurma alanı */}
        <path
          d={`
            M0,${max || 1}
            ${data.map((val, i) => `L${i},${max - val}`).join(' ')}
            L${data.length - 1},${max || 1}
            Z
          `}
          fill={fillColor}
        />
        
        {/* Çizgi */}
        <path
          d={`
            M0,${max - data[0]}
            ${data.map((val, i) => i === 0 ? '' : `L${i},${max - val}`).join(' ')}
          `}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
        />
        
        {/* Noktalar */}
        {data.map((val, i) => (
          <circle
            key={i}
            cx={i}
            cy={max - val}
            r="0.5"
            fill="#fff"
          />
        ))}
      </svg>
      
      {/* X ekseni etiketleri */}
      {showLabels && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/50">
          <span>15 gün önce</span>
          <span>Bugün</span>
        </div>
      )}
    </div>
  );
};

// Gelişmiş performans kartı
const PerformanceCard = ({ 
  title, 
  value, 
  change, 
  chartData, 
  icon,
  isPositive = true
}: {
  title: string,
  value: string | number,
  change: number,
  chartData: number[],
  icon: React.ReactNode,
  isPositive?: boolean
}) => {
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const colorClasses = isPositive 
    ? 'text-green-500 bg-green-500/10' 
    : 'text-red-500 bg-red-500/10';
  
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white/80 text-sm font-medium">{title}</CardTitle>
          <div className="text-indigo-400">{icon}</div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${colorClasses}`}>
            <span className="flex items-center gap-0.5">
              <Icon size={12} />
              {change}%
            </span>
          </span>
          <span className="text-xs text-white/50">geçen aya göre</span>
        </div>
      </CardContent>
      <div className="px-6 pt-3 pb-4">
        <SimpleChart data={chartData} height={60} />
      </div>
    </Card>
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Hata durumunda
  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 md:pl-72 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-8">
            <h2 className="text-xl font-medium text-red-400 mb-2">Hata</h2>
            <p className="text-white/70">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 border-white/10 bg-white/5"
              onClick={() => fetchAnalyticsData(dateRange)}
            >
              Yeniden Dene
            </Button>
          </div>
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
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
        >
          <div className="flex items-center">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="mr-4 border-white/10 bg-white/5">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                <GradientText>Analitikler</GradientText> ve Performans
              </h1>
              <p className="text-white/60">
                Chatbot performansınızı ve kullanıcı istatistiklerinizi görüntüleyin
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
              <Button
                variant={dateRange === 'week' ? 'premium' : 'ghost'}
                size="sm"
                className="text-xs px-3"
                onClick={() => setDateRange('week')}
              >
                Haftalık
              </Button>
              <Button
                variant={dateRange === 'month' ? 'premium' : 'ghost'}
                size="sm"
                className="text-xs px-3"
                onClick={() => setDateRange('month')}
              >
                Aylık
              </Button>
              <Button
                variant={dateRange === 'year' ? 'premium' : 'ghost'}
                size="sm"
                className="text-xs px-3"
                onClick={() => setDateRange('year')}
              >
                Yıllık
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/10 bg-white/5"
              onClick={() => fetchAnalyticsData(dateRange)}
            >
              <Filter size={14} className="mr-2" />
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
              icon={<BarChart size={20} />}
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
            <AnimatedGradientBorder animate={false}>
              <Card className="bg-black/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Konuşma Aktivitesi</CardTitle>
                      <CardDescription className="text-white/60">
                        Zaman içindeki konuşma sayısı ve kullanıcı etkileşimi
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="size-3 rounded-full bg-indigo-500"></div>
                        <span className="text-white/70">Konuşmalar</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="size-3 rounded-full bg-purple-500"></div>
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
                      <div className="absolute inset-0">
                        <SimpleChart 
                          data={data.dailyConversations.map(v => v * 10)} 
                          height={260} 
                          lineColor="rgba(99, 102, 241, 0.8)"
                          fillColor="rgba(99, 102, 241, 0.1)"
                          showLabels={true}
                        />
                      </div>
                      <div className="absolute inset-0 opacity-70">
                        <SimpleChart 
                          data={data.dailyMessages} 
                          height={260} 
                          lineColor="rgba(168, 85, 247, 0.8)"
                          fillColor="rgba(168, 85, 247, 0.05)"
                        />
                      </div>
                      
                      {/* Y ekseni etiketleri */}
                      <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-white/50">
                        <span>800</span>
                        <span>600</span>
                        <span>400</span>
                        <span>200</span>
                        <span>0</span>
                      </div>
                      
                      {/* Grid çizgileri */}
                      <div className="absolute inset-0">
                        <div className="h-full flex flex-col justify-between">
                          {[0, 1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="border-t border-white/5 h-0"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedGradientBorder>
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
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm h-full">
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
                          <div className="size-10 rounded-full bg-white/10 animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                            <div className="h-3 bg-white/10 rounded animate-pulse w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : data.topBots.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="size-16 rounded-full bg-indigo-500/20 text-indigo-400 mx-auto mb-4 flex items-center justify-center">
                        <Bot size={24} />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Henüz Veri Yok</h3>
                      <p className="text-white/60 max-w-md mx-auto">
                        Konuşma verisi olan botlarınız burada listelenecektir. Veriler toplandıkça performans bilgileri eklenecektir.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {data.topBots.map((bot, index) => (
                        <div key={bot.id} className="p-6 flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className={`size-12 rounded-full flex items-center justify-center ${
                              index === 0 
                                ? 'bg-indigo-500/20 text-indigo-400' 
                                : index === 1 
                                  ? 'bg-purple-500/20 text-purple-400' 
                                  : 'bg-pink-500/20 text-pink-400'
                            }`}>
                              <Bot size={24} />
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
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    index === 0 
                                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                                      : index === 1 
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                                        : 'bg-gradient-to-r from-pink-500 to-rose-500'
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
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm h-full">
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
                          <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                          <div className="h-3 bg-white/10 rounded animate-pulse w-1/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : data.topQuestions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-white/60">Henüz soru verisi bulunmuyor</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.topQuestions.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{item.question}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full" 
                                style={{ width: `${(item.count / data.topQuestions[0].count) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-white/70">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 border-t border-white/10">
                  <Link href="/dashboard/analytics/questions" className="w-full">
                    <Button variant="outline" size="sm" className="border-white/10 bg-white/5 w-full">
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
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Saatlik Aktivite</CardTitle>
                    <CardDescription className="text-white/60">
                      Son 24 saatteki aktif kullanıcı sayısı
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 bg-white/5 rounded-lg p-1.5">
                    <Users size={14} />
                    <span className="text-xs">Aktif: {isLoading ? "..." : data.hourlyUsers[data.hourlyUsers.length - 1]}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-40 bg-white/5 animate-pulse rounded-lg"></div>
                ) : (
                  <div className="h-40 relative">
                    <SimpleChart 
                      data={data.hourlyUsers} 
                      height={150}
                      lineColor="rgba(59, 130, 246, 0.8)"
                      fillColor="rgba(59, 130, 246, 0.1)"
                    />
                    
                    {/* Saatlik etiketler */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/50">
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00</span>
                      <span>23:59</span>
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