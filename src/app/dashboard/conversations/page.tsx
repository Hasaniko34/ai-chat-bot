'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { format, subDays, parseISO } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import {
  Search,
  Filter,
  Calendar,
  MessageSquare,
  Bot,
  User,
  Star,
  StarHalf,
  ThumbsUp,
  ThumbsDown,
  BarChart,
  Clock,
  Sparkles,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  X,
  Download,
  Calendar as CalendarIcon,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  SlidersHorizontal,
  Eye,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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
      staggerChildren: 0.08
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

// Konuşma durumu için tip tanımı
type ConversationStatus = 'completed' | 'ongoing' | 'abandoned';

// Memnuniyet durumu için tip tanımı
type SatisfactionRating = 'positive' | 'neutral' | 'negative' | null;

// Konuşma tipi tanımı
type Conversation = {
  id: string;
  botId: string;
  botName: string;
  botIcon: string;
  userId: string;
  userName: string;
  userImageUrl?: string;
  startedAt: string;
  endedAt?: string;
  status: ConversationStatus;
  messageCount: number;
  duration: number; // saniye cinsinden
  satisfaction: SatisfactionRating;
  resolutionSuccess: boolean;
  tags: string[];
  preview: string;
};

// Bot tipi
type Bot = {
  id: string;
  name: string;
  icon: string;
};

// Sayfalama için tip
type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export default function ConversationsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedBot, setSelectedBot] = useState('all');
  const [satisfactionFilter, setSatisfactionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastMessageAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  });
  const [botList, setBotList] = useState<Bot[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  
  // Konuşmaları fetch et
  const fetchConversations = async (page = 1) => {
    setIsLoading(true);
    try {
      // Query parametrelerini oluştur
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedBot !== 'all') params.append('botId', selectedBot);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (satisfactionFilter !== 'all') params.append('satisfaction', satisfactionFilter);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
    
    // Zaman filtresi
    if (timeFilter !== 'all') {
        const today = new Date();
        let fromDate = new Date();
      
      switch (timeFilter) {
        case 'today':
            fromDate = new Date(today.setHours(0, 0, 0, 0));
            break;
          case 'yesterday':
            fromDate = new Date(today.setDate(today.getDate() - 1));
            fromDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
            fromDate = new Date(today.setDate(today.getDate() - 7));
          break;
        case 'month':
            fromDate = new Date(today.setMonth(today.getMonth() - 1));
          break;
        }
        
        params.append('dateFrom', fromDate.toISOString());
      }
      
      // API'den konuşmaları al
      const response = await fetch(`/api/conversations?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Konuşmalar alınırken bir hata oluştu');
      }
      
      const data = await response.json();
      setConversations(data.conversations || []);
      setPagination(data.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        pages: 0
      });
      
      // Bot listesini güncelle
      if (data.filters && data.filters.bots) {
        setBotList(data.filters.bots);
      }
      
    } catch (error) {
      console.error('Konuşmalar yüklenemedi:', error);
      toast.error(t('conversations.error.loading'));
      setConversations([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };
  
  // Arama formunu gönder
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setCurrentPage(1);
    fetchConversations(1);
  };
  
  // Filtreleri sıfırla
  const resetFilters = () => {
    setSearchQuery('');
    setTimeFilter('all');
    setSelectedBot('all');
    setSatisfactionFilter('all');
    setStatusFilter('all');
    setSortBy('lastMessageAt');
    setSortOrder('desc');
    setCurrentPage(1);
    fetchConversations(1);
  };
  
  // Sayfa değiştir
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
      fetchConversations(newPage);
    }
  };
  
  // Konuşmayı sil
  const deleteConversation = async (id: string) => {
    if (confirm(t('conversations.confirm.delete'))) {
      try {
        const response = await fetch(`/api/conversations/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(t('conversations.error.deleting'));
        }
        
        toast.success(t('conversations.success.deleted'));
        // Güncel listeyi getir
        fetchConversations(currentPage);
      } catch (error) {
        console.error('Konuşma silinemedi:', error);
        toast.error(t('conversations.error.deleting'));
      }
    }
  };
  
  // İlk yüklemede konuşmaları getir
  useEffect(() => {
    fetchConversations();
  }, []);
  
  // Filtreleri izle ve otomatik uygula
  useEffect(() => {
    // Arama hariç diğer filtreler için otomatik uygula
    if (!isSearching && !isLoading) {
      const timer = setTimeout(() => {
        fetchConversations(1);
        setCurrentPage(1);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedBot, timeFilter, satisfactionFilter, statusFilter, sortBy, sortOrder]);

  // Tarihleri formatla
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    const currentLocale = language === 'tr' ? tr : enUS;
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t('dashboard.today');
    } else if (diffDays === 1) {
      return t('dashboard.yesterday');
    } else if (diffDays < 7) {
      return format(date, 'PPp', { locale: currentLocale });
    } else {
      return format(date, 'PPp', { locale: currentLocale });
    }
  };
  
  // Süreyi formatla
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return t('conversations.duration', { minutes: minutes, seconds: remainingSeconds });
  };
  
  // Memnuniyet ikonu
  const getSatisfactionIcon = (satisfaction: SatisfactionRating) => {
    switch (satisfaction) {
      case 'positive':
        return <ThumbsUp size={12} />;
      case 'neutral':
        return <StarHalf size={12} />;
      case 'negative':
        return <ThumbsDown size={12} />;
      default:
        return null;
    }
  };
  
  // Durum bilgisi
  const getStatusInfo = (status: ConversationStatus) => {
    switch (status) {
      case 'completed':
        return { 
          label: t('conversations.status.completed'),
          color: 'bg-emerald-950/30 border-emerald-500/20 text-emerald-500' 
        };
      case 'ongoing':
        return { 
          label: t('conversations.status.ongoing'),
          color: 'bg-blue-950/30 border-blue-500/20 text-blue-500' 
        };
      case 'abandoned':
        return { 
          label: t('conversations.status.abandoned'),
          color: 'bg-amber-950/30 border-amber-500/20 text-amber-500' 
        };
      default:
        return { 
          label: t('conversations.status.completed'),
          color: 'bg-emerald-950/30 border-emerald-500/20 text-emerald-500' 
        };
    }
  };
  
  // Sayfalama UI
  const renderPagination = () => {
    if (pagination.pages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-white/60">
          {pagination.total} konuşma içinde {(pagination.page - 1) * pagination.limit + 1}-
          {Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="bg-black/30 border-white/10 h-8 w-8 p-0"
            disabled={currentPage === 1}
            onClick={() => changePage(currentPage - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            // 5'ten fazla sayfa varsa, aktif sayfanın etrafındakileri göster
            let pageToShow;
            if (pagination.pages <= 5) {
              pageToShow = i + 1;
            } else {
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(pagination.pages, currentPage + 2);
              if (end - start < 4) {
                if (start === 1) {
                  pageToShow = i + 1;
                } else {
                  pageToShow = pagination.pages - 4 + i;
                }
    } else {
                pageToShow = start + i;
              }
            }
            
            if (pageToShow <= pagination.pages) {
              return (
                <Button
                  key={pageToShow}
                  variant={currentPage === pageToShow ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    currentPage === pageToShow 
                      ? "bg-indigo-600" 
                      : "bg-white/5 border-white/10"
                  )}
                  onClick={() => changePage(pageToShow)}
                >
                  {pageToShow}
                </Button>
              );
            }
            return null;
          })}
          
          <Button
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 h-8 w-8 p-0"
            disabled={currentPage === pagination.pages}
            onClick={() => changePage(currentPage + 1)}
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-16 pb-8 md:pl-64 w-full bg-black/90 bg-[url('/noise.png')] bg-repeat">
      <div className="w-full max-w-full mx-auto px-2">
        <div className="flex items-center mb-5 mt-4 px-3 md:px-4">
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              size="icon" 
              className="mr-3 border-white/10 bg-black/40 hover:bg-white/10 rounded-xl h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
    <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <h1 className="text-2xl font-bold md:text-3xl">{t('conversations.title')}</h1>
            <p className="text-white/60 mt-1">
              {t('conversations.description')}
            </p>
          </motion.div>
          <Button
            variant="outline"
            className="hidden sm:flex border-white/10 bg-black/40 hover:bg-white/10 rounded-xl"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {isFilterOpen ? t('conversations.filter_hide') : t('conversations.filter_show')}
          </Button>
        </div>

        <div className="mx-2 md:mx-4 mb-5 bg-black/50 border border-white/10 backdrop-blur-sm rounded-2xl p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 h-5 w-5" />
              <Input
                type="text"
                placeholder={t('conversations.search.placeholder')}
                className="pl-12 h-12 bg-black/40 border-white/10 text-base rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
      </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 h-12 px-5 rounded-xl"
                disabled={isLoading}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.searching')}
                  </>
                ) : t('common.search')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="bg-black/40 border-white/10 h-12 rounded-xl hover:bg-white/10"
                onClick={resetFilters}
              >
                <X className="h-4 w-4 mr-2" />
                {t('common.clear')}
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col md:flex-row gap-5 mx-2 md:mx-3">
          {/* Mobil Filtreler */}
          <div className="md:hidden w-full mb-4 px-1">
            <Button
              variant="outline"
              className="w-full border-white/10 bg-black/40 hover:bg-white/10 rounded-xl"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t('common.filters')} {isFilterOpen ? t('conversations.filter_hide') : t('conversations.filter_show')}
            </Button>
            
            {isFilterOpen && (
              <div className="bg-black/50 border border-white/10 backdrop-blur-sm mt-3 rounded-2xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="botFilter" className="text-sm font-medium text-white/70">
                      {t('conversations.filter.bot')}
                    </label>
                    <Select value={selectedBot} onValueChange={setSelectedBot}>
                      <SelectTrigger id="botFilter" className="bg-black/40 border-white/10 rounded-xl">
                        <SelectValue placeholder={t('conversations.filter.allBots')} />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white rounded-xl">
                        <SelectItem value="all">{t('conversations.filter.allBots')}</SelectItem>
                        {botList.map((bot) => (
                          <SelectItem key={bot.id} value={bot.id}>
                            {bot.icon} {bot.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="timeFilter" className="text-sm font-medium text-white/70">
                      {t('conversations.filter.timeFrame')}
                    </label>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger id="timeFilter" className="bg-black/40 border-white/10 rounded-xl">
                        <SelectValue placeholder={t('conversations.filter.allTime')} />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white rounded-xl">
                        <SelectItem value="all">{t('conversations.filter.allTime')}</SelectItem>
                        <SelectItem value="today">{t('conversations.filter.today')}</SelectItem>
                        <SelectItem value="yesterday">{t('conversations.filter.yesterday')}</SelectItem>
                        <SelectItem value="week">{t('conversations.filter.lastWeek')}</SelectItem>
                        <SelectItem value="month">{t('conversations.filter.lastMonth')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="statusFilter" className="text-sm font-medium text-white/70">
                      {t('conversations.filter.status')}
                    </label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="statusFilter" className="bg-black/40 border-white/10 rounded-xl">
                        <SelectValue placeholder={t('conversations.filter.allStatuses')} />
                </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white rounded-xl">
                        <SelectItem value="all">{t('conversations.filter.allStatuses')}</SelectItem>
                        <SelectItem value="completed">{t('conversations.status.completed')}</SelectItem>
                        <SelectItem value="ongoing">{t('conversations.status.ongoing')}</SelectItem>
                        <SelectItem value="abandoned">{t('conversations.status.abandoned')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
                  <div className="space-y-2">
                    <label htmlFor="satisfactionFilter" className="text-sm font-medium text-white/70">
                      {t('conversations.filter.satisfaction')}
                    </label>
                    <Select value={satisfactionFilter} onValueChange={setSatisfactionFilter}>
                      <SelectTrigger id="satisfactionFilter" className="bg-black/40 border-white/10 rounded-xl">
                        <SelectValue placeholder={t('conversations.filter.allRatings')} />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white rounded-xl">
                        <SelectItem value="all">{t('conversations.filter.allRatings')}</SelectItem>
                        <SelectItem value="positive">{t('conversations.satisfaction.positive')}</SelectItem>
                        <SelectItem value="neutral">{t('conversations.satisfaction.neutral')}</SelectItem>
                        <SelectItem value="negative">{t('conversations.satisfaction.negative')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="sortBy" className="text-sm font-medium text-white/70">
                    {t('conversations.sortBy.placeholder')}
                  </label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sortBy" className="bg-black/40 border-white/10 flex-1 rounded-xl">
                        <SelectValue placeholder={t('conversations.sortBy.lastMessage')} />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white rounded-xl">
                        <SelectItem value="lastMessageAt">{t('conversations.sortBy.lastMessage')}</SelectItem>
                        <SelectItem value="messageCount">{t('conversations.sortBy.messageCount')}</SelectItem>
                        <SelectItem value="duration">{t('conversations.sortBy.duration')}</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-black/40 border-white/10 h-10 w-10 rounded-xl hover:bg-white/10"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Filtreler */}
          {isFilterOpen && (
            <div className="bg-black/50 border border-white/10 backdrop-blur-sm hidden md:block w-[280px] flex-shrink-0 h-fit sticky top-20 rounded-2xl p-5">
              <div className="flex items-center mb-4">
                <Filter className="h-4 w-4 mr-2 text-white/70" />
                <h3 className="text-lg font-medium">{t('common.filters')}</h3>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="desktopBotFilter" className="text-sm font-medium text-white/70">
                    {t('conversations.filter.bot')}
                  </label>
                  <Select value={selectedBot} onValueChange={setSelectedBot}>
                    <SelectTrigger id="desktopBotFilter" className="bg-black/40 border-white/10 rounded-xl">
                      <SelectValue placeholder={t('conversations.filter.allBots')} />
                </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white rounded-xl">
                      <SelectItem value="all">{t('conversations.filter.allBots')}</SelectItem>
                      {botList.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                          {bot.icon} {bot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
                <div className="space-y-2">
                  <label htmlFor="desktopTimeFilter" className="text-sm font-medium text-white/70">
                    {t('conversations.filter.timeFrame')}
                  </label>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger id="desktopTimeFilter" className="bg-black/40 border-white/10 rounded-xl">
                      <SelectValue placeholder={t('conversations.filter.allTime')} />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white rounded-xl">
                      <SelectItem value="all">{t('conversations.filter.allTime')}</SelectItem>
                      <SelectItem value="today">{t('conversations.filter.today')}</SelectItem>
                      <SelectItem value="yesterday">{t('conversations.filter.yesterday')}</SelectItem>
                      <SelectItem value="week">{t('conversations.filter.lastWeek')}</SelectItem>
                      <SelectItem value="month">{t('conversations.filter.lastMonth')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="desktopStatusFilter" className="text-sm font-medium text-white/70">
                    {t('conversations.filter.status')}
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="desktopStatusFilter" className="bg-black/40 border-white/10 rounded-xl">
                      <SelectValue placeholder={t('conversations.filter.allStatuses')} />
                </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white rounded-xl">
                      <SelectItem value="all">{t('conversations.filter.allStatuses')}</SelectItem>
                      <SelectItem value="completed">{t('conversations.status.completed')}</SelectItem>
                      <SelectItem value="ongoing">{t('conversations.status.ongoing')}</SelectItem>
                      <SelectItem value="abandoned">{t('conversations.status.abandoned')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
                <div className="space-y-2">
                  <label htmlFor="desktopSatisfactionFilter" className="text-sm font-medium text-white/70">
                    {t('conversations.filter.satisfaction')}
                  </label>
                  <Select value={satisfactionFilter} onValueChange={setSatisfactionFilter}>
                    <SelectTrigger id="desktopSatisfactionFilter" className="bg-black/40 border-white/10 rounded-xl">
                      <SelectValue placeholder={t('conversations.filter.allRatings')} />
                </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white rounded-xl">
                      <SelectItem value="all">{t('conversations.filter.allRatings')}</SelectItem>
                      <SelectItem value="positive">{t('conversations.satisfaction.positive')}</SelectItem>
                      <SelectItem value="neutral">{t('conversations.satisfaction.neutral')}</SelectItem>
                      <SelectItem value="negative">{t('conversations.satisfaction.negative')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
                <div className="space-y-2">
                  <label htmlFor="desktopSortBy" className="text-sm font-medium text-white/70">
                    {t('conversations.sortBy.placeholder')}
                  </label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="desktopSortBy" className="bg-black/40 border-white/10 flex-1 rounded-xl">
                        <SelectValue placeholder={t('conversations.sortBy.lastMessage')} />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white rounded-xl">
                        <SelectItem value="lastMessageAt">{t('conversations.sortBy.lastMessage')}</SelectItem>
                        <SelectItem value="messageCount">{t('conversations.sortBy.messageCount')}</SelectItem>
                        <SelectItem value="duration">{t('conversations.sortBy.duration')}</SelectItem>
                      </SelectContent>
                    </Select>
                    
              <Button 
                variant="outline" 
                      size="icon"
                      className="bg-black/40 border-white/10 h-10 w-10 rounded-xl hover:bg-white/10"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
              </Button>
            </div>
          </div>
              </div>
            </div>
          )}

          <div className="bg-black/50 border border-white/10 backdrop-blur-sm flex-1 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-white/60" />
                <h3 className="text-lg font-medium">{t('conversations.list_title')}</h3>
                <Badge className="ml-2 bg-indigo-900/50 text-indigo-300 text-xs py-1 rounded-full border-0">
                  {isLoading ? t('dashboard.loading') : t('conversations.count', { count: pagination.total })}
                </Badge>
          </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex gap-1 items-center bg-black/40 border-white/10 h-9 text-sm rounded-xl hover:bg-white/10"
                  onClick={() => fetchConversations(1)}
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('dashboard.refresh')}
                </Button>
                <Button 
                  variant="outline" 
                  className="hidden md:flex gap-1 items-center bg-black/40 border-white/10 h-9 text-sm rounded-xl hover:bg-white/10"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('dashboard.export')}
                </Button>
              </div>
            </div>
            <div className="px-0">
              {isLoading ? (
                <div className="flex justify-center items-center p-16">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-900/30 opacity-30"></div>
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-indigo-600 animate-spin"></div>
                  </div>
                  <span className="ml-5 text-lg text-white/60">{t('dashboard.loading')}</span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-indigo-900/30 w-24 h-24 flex items-center justify-center rounded-full mx-auto mb-4">
                    <MessageSquare className="h-12 w-12 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{t('conversations.not_found')}</h3>
                  <p className="text-white/60 max-w-md mx-auto mb-6">
                    {t('conversations.not_found_description')}
                  </p>
                  <Button 
                    variant="outline" 
                    className="bg-black/40 border-white/10 rounded-xl hover:bg-white/10"
                    onClick={resetFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('conversations.clear_filters')}
                  </Button>
                </div>
              ) : (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {conversations.map((conversation) => {
                    const statusInfo = getStatusInfo(conversation.status);
                    const statusColors = {
                      completed: "bg-green-900/40 text-green-400",
                      ongoing: "bg-blue-900/40 text-blue-400",
                      abandoned: "bg-amber-900/40 text-amber-400"
                    };
                    const statusBg = statusColors[conversation.status] || statusInfo.color;
                    
                    return (
                      <motion.div 
                        key={conversation.id}
                        variants={itemAnimation}
                        className="border-b border-white/10 last:border-b-0"
                      >
                        <div className="p-6 hover:bg-white/5 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-medium shadow-lg shadow-indigo-500/20 shrink-0">
                              {conversation.userName.slice(0, 2).toUpperCase()}
                                      </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className="font-medium text-lg">{conversation.userName}</div>
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                  <Badge className={cn("rounded-full border-0 px-3 py-1", statusBg)}>
                                    {statusInfo.label}
                                  </Badge>
                                  <div className="bg-black/40 rounded-full px-3 py-1">{formatDate(conversation.startedAt)}</div>
                                      </div>
                                  </div>
                                  
                              <p className="text-base text-white/60 mb-3 line-clamp-2">
                                {conversation.preview || t('dashboard.no_message')}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {conversation.tags.map((tag, idx) => (
                                        <span 
                                    key={idx} 
                                    className="text-xs bg-indigo-900/30 px-2 py-0.5 rounded-full text-indigo-300"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                              
                              <div className="flex flex-wrap items-center gap-5 text-sm">
                                <div className="flex items-center gap-1.5 text-white/60">
                                  <Bot className="h-4 w-4" />
                                  <span>{conversation.botName}</span>
                                  </div>
                                
                                <div className="flex items-center gap-1.5 text-white/60">
                                  <MessageSquare className="h-4 w-4" />
                                  <span>{t('conversations.messageCount', { count: conversation.messageCount })}</span>
                                </div>
                                
                                <div className="flex items-center gap-1.5 text-white/60">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDuration(conversation.duration)}</span>
                                      </div>
                                      
                                <div className="flex items-center gap-1.5 text-white/60">
                                  {getSatisfactionIcon(conversation.satisfaction)}
                                  <span>
                                    {conversation.satisfaction ? t(`conversations.satisfaction.${conversation.satisfaction}`) : '-'}
                                        </span>
                                      </div>
                                    </div>
                                      </div>
                                      
                            <div className="flex flex-col gap-2 ml-2">
                              <Link href={`/dashboard/conversations/${conversation.id}`} className="block">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 px-4 bg-black/40 border-white/10 hover:bg-white/10 hover:border-indigo-500 w-full rounded-xl transition-all duration-200"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t('conversations.view')}
                                </Button>
                              </Link>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 px-4 bg-black/40 border-white/10 text-red-400 hover:bg-red-950/20 hover:border-red-500/50 w-full rounded-xl transition-all duration-200"
                                onClick={() => deleteConversation(conversation.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('conversations.delete')}
                              </Button>
                                  </div>
                                </div>
                              </div>
                      </motion.div>
                    );
                  })}
            </motion.div>
          )}
          
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 bg-black/60 border-t border-white/10">
                  <div className="text-sm text-white/60">
                    {t('conversations.pagination', { 
                      start: (pagination.page - 1) * pagination.limit + 1, 
                      end: Math.min(pagination.page * pagination.limit, pagination.total),
                      total: pagination.total 
                    })}
                  </div>
                  <div className="flex gap-1">
              <Button 
                variant="outline" 
                      size="sm"
                      className="bg-black/40 border-white/10 h-8 w-8 p-0 rounded-lg hover:bg-white/10"
                      disabled={currentPage === 1}
                      onClick={() => changePage(currentPage - 1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      // 5'ten fazla sayfa varsa, aktif sayfanın etrafındakileri göster
                      let pageToShow;
                      if (pagination.pages <= 5) {
                        pageToShow = i + 1;
                      } else {
                        const start = Math.max(1, currentPage - 2);
                        const end = Math.min(pagination.pages, currentPage + 2);
                        if (end - start < 4) {
                          if (start === 1) {
                            pageToShow = i + 1;
                          } else {
                            pageToShow = pagination.pages - 4 + i;
                          }
                        } else {
                          pageToShow = start + i;
                        }
                      }
                      
                      if (pageToShow <= pagination.pages) {
                        return (
                          <Button
                            key={pageToShow}
                            variant={currentPage === pageToShow ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-8 w-8 p-0 rounded-lg",
                              currentPage === pageToShow 
                                ? "bg-indigo-600 hover:bg-indigo-700 border-0" 
                                : "bg-black/40 border-white/10 hover:bg-white/10"
                            )}
                            onClick={() => changePage(pageToShow)}
                          >
                            {pageToShow}
                          </Button>
                        );
                      }
                      return null;
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/40 border-white/10 h-8 w-8 p-0 rounded-lg hover:bg-white/10"
                      disabled={currentPage === pagination.pages}
                      onClick={() => changePage(currentPage + 1)}
                    >
                      <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 