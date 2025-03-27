'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  CreditCard,
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  FileText,
  Shield,
  Zap,
  Check,
  BadgeDollarSign,
  LucideIcon,
  Settings,
  Info,
  AlertCircle,
  CheckCircle,
  Users,
  Sparkles,
  MessageCircle,
  Database,
  Receipt,
  Loader2,
  Bot,
  BarChart3,
  Plus,
  X,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

// Animasyon varyantları
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Fatura tipi
type InvoiceStatus = 'paid' | 'pending' | 'overdue';
type InvoiceType = 'subscription' | 'addon' | 'usage';

type Invoice = {
  id: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
  dueDate?: string;
  type: InvoiceType;
  description: string;
  downloadUrl: string;
};

// Plan tipi
type PlanFeature = {
  name: string;
  available: boolean;
  limit?: string;
  icon: LucideIcon;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  color: string;
};

// Kullanım tipi
type UsageMetric = {
  name: string;
  used: number;
  limit: number;
  unit: string;
  icon: LucideIcon;
};

// Fatura kartı bileşeni
const InvoiceCard = ({ invoice }: { invoice: Invoice }) => {
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'overdue': return 'bg-red-500/10 text-red-500 border-red-500/30';
    }
  };
  
  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'Ödendi';
      case 'pending': return 'Bekliyor';
      case 'overdue': return 'Gecikmiş';
    }
  };
  
  const getTypeText = (type: InvoiceType) => {
    switch (type) {
      case 'subscription': return 'Abonelik';
      case 'addon': return 'Ek Hizmet';
      case 'usage': return 'Kullanım';
    }
  };
  
  const getTypeIcon = (type: InvoiceType) => {
    switch (type) {
      case 'subscription': return <Zap className="h-3 w-3 text-indigo-400" />;
      case 'addon': return <Plus className="h-3 w-3 text-green-400" />;
      case 'usage': return <ArrowRightLeft className="h-3 w-3 text-blue-400" />;
    }
  };

  return (
    <motion.div variants={slideUp}>
      <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm overflow-hidden hover:bg-black/50 transition-all">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm font-medium">{invoice.description}</div>
              <div className="text-xs text-white/60 mt-1">
                {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: tr })}
              </div>
            </div>
            <Badge className={`border ${getStatusColor(invoice.status)}`}>
              {getStatusText(invoice.status)}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold">
              {invoice.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </div>
            <div className="flex items-center text-xs text-white/60">
              <span className="flex items-center mr-2">
                {getTypeIcon(invoice.type)}
                <span className="ml-1">{getTypeText(invoice.type)}</span>
              </span>
              <FileText className="h-3 w-3" />
            </div>
          </div>
          
          {invoice.status !== 'paid' && invoice.dueDate && (
            <div className="bg-white/5 rounded-md p-2 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Son Ödeme Tarihi</span>
                <span className="font-medium">
                  {format(new Date(invoice.dueDate), 'dd MMMM yyyy', { locale: tr })}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs bg-white/5 border-white/10"
              asChild
            >
              <a href={invoice.downloadUrl} download>
                <Download className="h-3 w-3 mr-1" />
                Faturayı İndir
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Plan kartı bileşeni
const PlanCard = ({ plan, currentPlan, onSelect }: { plan: Plan; currentPlan: boolean; onSelect: () => void }) => {
  return (
    <Card className={cn(
      "relative bg-black/40 border-white/10 shadow-xl backdrop-blur-sm overflow-hidden",
      currentPlan && "ring-2 ring-indigo-500"
    )}>
      {plan.popular && (
        <div className="absolute top-0 right-0">
          <Badge className="m-2 bg-gradient-to-r from-indigo-600 to-purple-600 border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            En Popüler
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg ${plan.color}`}>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="mb-4">
          <span className="text-3xl font-bold">{plan.price.toLocaleString('tr-TR')}</span>
          <span className="text-sm text-white/60 ml-1">₺/{plan.billingCycle === 'monthly' ? 'ay' : 'yıl'}</span>
        </div>
        
        <div className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start">
              {feature.available ? (
                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-green-500" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center mr-2 flex-shrink-0">
                  <X className="h-3 w-3 text-white/40" />
                </div>
              )}
              <div>
                <div className="text-sm flex items-center">
                  <feature.icon className="h-3 w-3 mr-1 text-white/60" />
                  {feature.name}
                </div>
                {feature.limit && (
                  <div className="text-xs text-white/60 mt-0.5">{feature.limit}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className={cn(
            "w-full",
            currentPlan 
              ? "bg-white/10 hover:bg-white/20 text-white" 
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          )}
          onClick={onSelect}
        >
          {currentPlan ? 'Mevcut Plan' : 'Bu Plana Geç'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Kullanım metriği kartı
const UsageMetricCard = ({ metric }: { metric: UsageMetric }) => {
  const percentage = Math.min(100, Math.round((metric.used / metric.limit) * 100));
  
  let statusColor = 'text-green-500';
  if (percentage > 75) statusColor = 'text-yellow-500';
  if (percentage > 90) statusColor = 'text-red-500';
  
  return (
    <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="mr-3 size-8 rounded bg-white/5 flex items-center justify-center">
              <metric.icon className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{metric.name}</h3>
              <p className="text-xs text-white/60">
                {metric.used.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
              </p>
            </div>
          </div>
          <div className={cn("text-sm font-medium", statusColor)}>
            {percentage}%
          </div>
        </div>
        
        <Progress value={percentage} className="h-2 bg-white/10" indicatorClassName={cn(
          percentage <= 75 && "bg-green-500",
          percentage > 75 && percentage <= 90 && "bg-yellow-500",
          percentage > 90 && "bg-red-500"
        )} />
      </CardContent>
    </Card>
  );
};

export default function BillingPage() {
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  
  // Örnek fatura verileri
  const invoices: Invoice[] = [
    {
      id: 'inv-001',
      amount: 99,
      date: '2024-03-01T10:00:00Z',
      status: 'paid',
      type: 'subscription',
      description: 'ChatBot Forge Pro Plan - Mart 2024',
      downloadUrl: '#'
    },
    {
      id: 'inv-002',
      amount: 29,
      date: '2024-02-15T14:30:00Z',
      status: 'paid',
      type: 'addon',
      description: 'Ek Konuşma Paketi - 1000 Konuşma',
      downloadUrl: '#'
    },
    {
      id: 'inv-003',
      amount: 99,
      date: '2024-02-01T09:15:00Z',
      status: 'paid',
      type: 'subscription',
      description: 'ChatBot Forge Pro Plan - Şubat 2024',
      downloadUrl: '#'
    },
    {
      id: 'inv-004',
      amount: 15,
      date: '2024-01-20T16:45:00Z',
      status: 'paid',
      type: 'usage',
      description: 'Ek Kullanım Ücreti - 150 Konuşma',
      downloadUrl: '#'
    },
    {
      id: 'inv-005',
      amount: 99,
      date: '2024-04-01T00:00:00Z',
      status: 'pending',
      dueDate: '2024-04-07T00:00:00Z',
      type: 'subscription',
      description: 'ChatBot Forge Pro Plan - Nisan 2024',
      downloadUrl: '#'
    }
  ];

  // Örnek plan verileri
  const plans: Plan[] = [
    {
      id: 'plan-free',
      name: 'Ücretsiz',
      price: 0,
      billingCycle: 'monthly',
      description: 'Küçük projeler için ideal başlangıç planı',
      color: 'text-gray-300',
      features: [
        { name: '1 Chatbot', available: true, icon: Bot },
        { name: '100 konuşma/ay', available: true, limit: 'Maksimum 100', icon: MessageCircle },
        { name: '12 saat destek', available: true, icon: Clock },
        { name: 'Temel analitikler', available: true, icon: BarChart3 },
        { name: 'Özel botlar', available: false, icon: Sparkles },
        { name: 'API erişimi', available: false, icon: Database },
      ]
    },
    {
      id: 'plan-pro',
      name: 'Pro',
      price: 99,
      billingCycle: 'monthly',
      description: 'Profesyonel kullanım için genişletilmiş özellikler',
      color: 'text-indigo-400',
      popular: true,
      features: [
        { name: '5 Chatbot', available: true, icon: Bot },
        { name: '5,000 konuşma/ay', available: true, limit: 'Maksimum 5,000', icon: MessageCircle },
        { name: '24/7 destek', available: true, icon: Clock },
        { name: 'Gelişmiş analitikler', available: true, icon: BarChart3 },
        { name: 'Özel botlar', available: true, icon: Sparkles },
        { name: 'API erişimi', available: true, icon: Database },
      ]
    },
    {
      id: 'plan-enterprise',
      name: 'Kurumsal',
      price: 299,
      billingCycle: 'monthly',
      description: 'Büyük işletmeler için tam özellikli çözüm',
      color: 'text-purple-400',
      features: [
        { name: 'Sınırsız Chatbot', available: true, icon: Bot },
        { name: 'Sınırsız konuşma', available: true, icon: MessageCircle },
        { name: 'Öncelikli destek', available: true, icon: Clock },
        { name: 'Özel raporlama', available: true, icon: BarChart3 },
        { name: 'Marka özelleştirme', available: true, icon: Sparkles },
        { name: 'Gelişmiş API erişimi', available: true, icon: Database },
      ]
    }
  ];

  // Örnek kullanım metrikleri
  const usageMetrics: UsageMetric[] = [
    {
      name: 'Chatbot Konuşmaları',
      used: 3240,
      limit: 5000,
      unit: 'konuşma',
      icon: MessageCircle
    },
    {
      name: 'Bot Sayısı',
      used: 3,
      limit: 5,
      unit: 'bot',
      icon: Bot
    },
    {
      name: 'Özel Entegrasyonlar',
      used: 2,
      limit: 10,
      unit: 'entegrasyon',
      icon: Settings
    },
    {
      name: 'Depolama',
      used: 1.2,
      limit: 5,
      unit: 'GB',
      icon: Database
    }
  ];

  // Ödeme yöntemi detayları
  const paymentMethod = {
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiry: '06/2025'
  };

  // Mevcut paket bilgileri
  const currentPlan = {
    id: 'plan-pro',
    name: 'Pro',
    renewalDate: '2024-04-01T00:00:00Z',
    status: 'active' as 'active' | 'canceled' | 'expiring'
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
            <h1 className="text-3xl font-bold tracking-tight">Faturalama</h1>
            <p className="text-white/70 mt-1">
              Aboneliğinizi, faturalarınızı ve kullanım detaylarınızı yönetin
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="bg-black/50 border border-white/10">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="invoices">Faturalar</TabsTrigger>
          <TabsTrigger value="plans">Planlar</TabsTrigger>
          <TabsTrigger value="usage">Kullanım</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Mevcut Plan</CardTitle>
                <CardDescription>Paket detaylarınız ve sonraki ödeme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-indigo-400">{currentPlan.name}</div>
                    <div className="text-sm text-white/60">
                      {currentPlan.status === 'active' && 'Aktif'}
                      {currentPlan.status === 'canceled' && 'İptal Edildi'}
                      {currentPlan.status === 'expiring' && 'Sona Eriyor'}
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                    {currentPlan.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {currentPlan.status === 'active' ? 'Aktif' : 'Değişiyor'}
                  </Badge>
                </div>
                
                <div className="bg-white/5 rounded-md p-3 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm">Sonraki Ödeme</div>
                    <div className="text-sm font-medium">
                      {format(new Date(currentPlan.renewalDate), 'dd MMMM yyyy', { locale: tr })}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-white/60">Tutar</div>
                    <div>₺99,00</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="bg-white/5 border-white/10 w-full">
                    Fatura Bilgileri
                  </Button>
                  <Button variant="outline" className="bg-white/5 border-white/10 text-red-400 hover:text-red-300 w-full">
                    Planı İptal Et
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Ödeme Yöntemi</CardTitle>
                <CardDescription>Kayıtlı ödeme yönteminiz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-12 rounded-md flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{paymentMethod.brand} •••• {paymentMethod.last4}</div>
                    <div className="text-sm text-white/60">Son Kullanma: {paymentMethod.expiry}</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="bg-white/5 border-white/10 w-full">
                    Düzenle
                  </Button>
                  <Button variant="outline" className="bg-white/5 border-white/10 w-full">
                    Yeni Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Son Fatura</CardTitle>
                <CardDescription>En son ödemeniz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm">Mart 2024</div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ödendi
                  </Badge>
                </div>
                
                <div className="text-2xl font-bold mb-4">₺99,00</div>
                
                <div className="bg-white/5 rounded-md p-3 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm">Ödeme Tarihi</div>
                    <div className="text-sm font-medium">1 Mart 2024</div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-white/60">Fatura No</div>
                    <div>INV-001</div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="bg-white/5 border-white/10 w-full"
                  asChild
                >
                  <a href="#" download>
                    <Download className="h-4 w-4 mr-2" />
                    Faturayı İndir
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-6">Kullanım Özeti</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {usageMetrics.map((metric, index) => (
                <UsageMetricCard key={index} metric={metric} />
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="invoices" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="plans" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                currentPlan={plan.id === currentPlan.id}
                onSelect={() => setIsChangingPlan(true)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="usage" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Kullanım Limitleri</CardTitle>
                <CardDescription>Mevcut planınızın kullanım limitleri ve durumu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {usageMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="size-8 rounded-md flex items-center justify-center bg-white/5 mr-3">
                            <metric.icon className="h-4 w-4 text-indigo-400" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{metric.name}</div>
                            <div className="text-xs text-white/60">
                              {metric.used.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {Math.round((metric.used / metric.limit) * 100)}%
                        </div>
                      </div>
                      <Progress 
                        value={Math.round((metric.used / metric.limit) * 100)} 
                        className="h-2 bg-white/10" 
                        indicatorClassName={cn(
                          metric.used / metric.limit <= 0.75 && "bg-green-500",
                          metric.used / metric.limit > 0.75 && metric.used / metric.limit <= 0.9 && "bg-yellow-500",
                          metric.used / metric.limit > 0.9 && "bg-red-500"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Kullanım Geçmişi</CardTitle>
                <CardDescription>Son 30 gündeki kullanım istatistikleriniz</CardDescription>
              </CardHeader>
              <CardContent className="h-72 flex items-center justify-center">
                <div className="text-center text-white/60">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-white/40" />
                  <p>Kullanım verileri görselleştirilecek.</p>
                  <p className="text-sm">Bu örnek için veri görselleştirme eklenmiyor.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
} 