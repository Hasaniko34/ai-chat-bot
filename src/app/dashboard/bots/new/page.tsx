'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Bot, ArrowLeft, ChevronRight, Palette, Database, Code, Settings, Check, Sparkles, Save, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText } from '@/components/ui/gradient-text';
import { AnimatedGradientBorder } from '@/components/ui/animated-gradient-border';
import Link from 'next/link';
import { extractWebsiteContent } from '@/lib/gemini';

// Adım bileşeni
const Step = ({ title, description, icon, isActive, isCompleted, onClick }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-4 rounded-lg transition-all cursor-pointer ${
        isActive ? 'bg-white/5' : 'hover:bg-white/5'
      }`}
    >
      <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${
        isActive 
          ? 'bg-indigo-600 text-white' 
          : isCompleted 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-white/10 text-white/60'
      }`}>
        {isCompleted ? <Check size={20} /> : icon}
      </div>
      <div className="flex-1">
        <h3 className={`font-medium ${isActive || isCompleted ? 'text-white' : 'text-white/70'}`}>{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      {isCompleted && (
        <span className="text-green-400 text-xs font-medium bg-green-500/10 py-1 px-2 rounded-full">
          Tamamlandı
        </span>
      )}
    </div>
  );
};

// Renk seçici bileşeni
const ColorPicker = ({ color, selectedColor, onChange }: {
  color: string;
  selectedColor: string;
  onChange: (color: string) => void;
}) => {
  return (
    <button
      className={`size-8 rounded-full transition-all ${
        selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-110'
      }`}
      style={{ backgroundColor: color }}
      onClick={() => onChange(color)}
    />
  );
};

export default function NewBotPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form verileri
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primaryColor: '#6366f1',
    secondaryColor: '#a855f7',
    greeting: 'Merhaba! Size nasıl yardımcı olabilirim?',
    knowledge: '',
    websiteUrl: '',
    avatar: 'bot'
  });
  
  // Adım tamamlanma durumları
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  
  // Formu güncelleme fonksiyonu
  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  // Website içeriğini çekme fonksiyonu
  const fetchWebsiteContent = async () => {
    if (!formData.websiteUrl) {
      toast.error('Lütfen geçerli bir website URL\'si girin');
      return;
    }
    
    // URL formatını kontrol et
    try {
      new URL(formData.websiteUrl);
    } catch (e) {
      toast.error('Lütfen geçerli bir URL formatı girin (http:// veya https:// ile başlamalı)');
      return;
    }
    
    setIsLoading(true);
    toast.info('Website içeriği işleniyor, lütfen bekleyin...', { duration: 3000 });
    
    try {
      // Website içeriğini çek
      const result = await extractWebsiteContent(formData.websiteUrl);
      
      if (result.success && result.content) {
        toast.success('Website içeriği başarıyla işlendi');
        // Mevcut içeriğe ekleme yap
        updateForm('knowledge', 
          (formData.knowledge ? formData.knowledge + '\n\n' : '') + 
          `// ${formData.websiteUrl} adresinden çekilen içerik\n${result.content}`
        );
      } else {
        toast.error(result.error || 'Website içeriği çekilemedi');
        console.error('Website içerik hatası:', result.error);
      }
    } catch (error) {
      console.error('Website içeriği çekme hatası:', error);
      toast.error('Website içeriği çekilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adım içerikleri
  const steps = [
    {
      title: 'Temel Bilgiler',
      description: 'Botunuzun adı ve açıklaması',
      icon: <Bot size={20} />,
      content: (
        <div className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-white/70">
              Bot Adı <span className="text-white/40">*</span>
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Örn. Yardım Asistanı"
              className="bg-white/5 border-white/10 text-white focus:border-indigo-500"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium text-white/70">
              Açıklama
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Botunuzun amacını ve işlevini açıklayın"
              className="bg-white/5 border-white/10 text-white focus:border-indigo-500 min-h-24 resize-none"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Görünüm',
      description: 'Botunuzun görsel özelleştirmeleri',
      icon: <Palette size={20} />,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Ana Renk
            </label>
            <div className="flex items-center gap-3">
              {['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#10b981', '#0ea5e9'].map((color) => (
                <ColorPicker
                  key={color}
                  color={color}
                  selectedColor={formData.primaryColor}
                  onChange={(color) => updateForm('primaryColor', color)}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              İkincil Renk
            </label>
            <div className="flex items-center gap-3">
              {['#a855f7', '#d946ef', '#f472b6', '#fb7185', '#fb923c', '#34d399', '#38bdf8'].map((color) => (
                <ColorPicker
                  key={color}
                  color={color}
                  selectedColor={formData.secondaryColor}
                  onChange={(color) => updateForm('secondaryColor', color)}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Avatar
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['bot', 'robot', 'ai', 'assistant'].map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => updateForm('avatar', avatar)}
                  className={`border rounded-lg aspect-square flex items-center justify-center transition-all ${
                    formData.avatar === avatar 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : 'border-white/10 hover:border-white/30 bg-white/5'
                  }`}
                >
                  <Bot size={24} className={formData.avatar === avatar ? 'text-indigo-400' : 'text-white/60'} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2 mt-6">
            <label className="text-sm font-medium text-white/70">
              Önizleme
            </label>
            <div className="border border-white/10 rounded-lg p-4 bg-black/40">
              <div className="w-[300px] h-96 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden">
                <div 
                  className="p-3 flex items-center" 
                  style={{ background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor})` }}
                >
                  <span className="text-white font-semibold">{formData.name || 'Bot Adı'}</span>
                  <button className="ml-auto bg-white/20 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="p-4 h-[calc(100%-56px)] flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-4">
                    <div className="flex items-start gap-2">
                      <div 
                        className="rounded-full p-1.5 text-white"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        <Bot size={14} />
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-sm text-white/90 max-w-[80%]">
                        {formData.greeting}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Bilgi Tabanı',
      description: 'Botunuzun üzerine eğitileceği bilgiler',
      icon: <Database size={20} />,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="websiteUrl" className="text-sm font-medium text-white/70">
                Website URL
              </label>
              <span className="text-xs text-white/50">Opsiyonel</span>
            </div>
            <Input
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => updateForm('websiteUrl', e.target.value)}
              placeholder="https://example.com"
              className="bg-white/5 border-white/10 text-white focus:border-indigo-500"
            />
            <p className="text-xs text-white/50 mt-1">
              Website URL'inizi girerek, botunuzun o siteden bilgileri otomatik olarak çekmesini sağlayabilirsiniz.
            </p>
            
            <div className="flex justify-end mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/5 border-white/10 text-indigo-400 hover:text-indigo-300"
                onClick={fetchWebsiteContent}
              >
                <Globe className="h-4 w-4 mr-2" />
                Siteden İçerik Çek
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="knowledge" className="text-sm font-medium text-white/70">
                Özel Bilgi Tabanı
              </label>
              <span className="text-xs text-white/50">Opsiyonel</span>
            </div>
            <Textarea
              id="knowledge"
              value={formData.knowledge}
              onChange={(e) => updateForm('knowledge', e.target.value)}
              placeholder="Botunuzun kullanması için özel bilgiler, belgeler veya metinler ekleyin. Botunuzun cevapları bu bilgilere dayalı olacaktır."
              className="bg-white/5 border-white/10 text-white focus:border-indigo-500 min-h-64 resize-none"
            />
            <p className="text-xs text-white/50 mt-1">
              Ürün bilgileri, SSS, şirket açıklamaları gibi özel bilgiler ekleyin.
            </p>
          </div>
          
          <div className="border border-white/10 rounded-lg p-4 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-500/20 p-2 text-indigo-400">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Yapay Zeka Desteği</p>
                <p className="text-xs text-white/60">Bilgi tabanınıza ek olarak, botunuz Gemini-2.0-Flash tarafından desteklenen gelişmiş yapay zeka özelliklerine sahip olacaktır.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Entegrasyon',
      description: 'Web sitenize ekleme seçenekleri',
      icon: <Code size={20} />,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Karşılama Mesajı
            </label>
            <Input
              value={formData.greeting}
              onChange={(e) => updateForm('greeting', e.target.value)}
              placeholder="Merhaba! Size nasıl yardımcı olabilirim?"
              className="bg-white/5 border-white/10 text-white focus:border-indigo-500"
            />
            <p className="text-xs text-white/50 mt-1">
              Kullanıcı sohbeti başlattığında botunuzun ilk mesajı
            </p>
          </div>
          
          <div className="border border-white/10 rounded-lg p-4 bg-black/40">
            <h3 className="text-sm font-medium mb-3">Entegrasyon Kodu</h3>
            <div className="bg-black/60 p-3 rounded-md overflow-x-auto text-xs font-mono text-white/80">
              &lt;script&gt;<br />
              &nbsp;&nbsp;(function(d,t) {"{"}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;var BASE_URL = "https://chatbot-forge.example.com";<br />
              &nbsp;&nbsp;&nbsp;&nbsp;var g=d.createElement(t),s=d.getElementsByTagName(t)[0];<br />
              &nbsp;&nbsp;&nbsp;&nbsp;g.src=BASE_URL+"/widget/loader.js"; g.defer=true; g.async=true;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;s.parentNode.insertBefore(g,s);<br />
              &nbsp;&nbsp;&nbsp;&nbsp;g.onload=function(){"{"}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;window.ChatBotForge.init({"{"}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;botId: "bot_id_placeholder",<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;primaryColor: "{formData.primaryColor}",<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;secondaryColor: "{formData.secondaryColor}"<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"}"});<br />
              &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br />
              &nbsp;&nbsp;{"}"}(document,"script"));<br />
              &lt;/script&gt;
            </div>
            <p className="text-xs text-white/50 mt-3">
              Bu kodu web sitenizin &lt;body&gt; etiketinin sonuna ekleyin. Bot oluşturulduğunda "bot_id_placeholder" gerçek bot ID'si ile değiştirilecektir.
            </p>
          </div>
          
          <div className="border border-white/10 rounded-lg p-4 bg-black/40">
            <h3 className="text-sm font-medium mb-2">Gelişmiş Seçenekler</h3>
            <p className="text-xs text-white/60 mb-3">
              Bu seçenekler, botunuzu oluşturduktan sonra Bot Ayarları sayfasından düzenlenebilir.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Settings size={14} className="text-white/60" />
                <span className="text-xs text-white/80">Botun tetiklenme davranışı</span>
              </div>
              <div className="flex items-center gap-3">
                <Settings size={14} className="text-white/60" />
                <span className="text-xs text-white/80">Özel CSS ile stilleştirme</span>
              </div>
              <div className="flex items-center gap-3">
                <Settings size={14} className="text-white/60" />
                <span className="text-xs text-white/80">API erişimi ve webhook'lar</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];
  
  // Geçerli adım içeriği
  const currentStepContent = steps[currentStep].content;
  
  // Adımı değiştirme fonksiyonu
  const handleStepChange = (stepIndex: number) => {
    // Eğer geçerli adım tamamlandıysa, tamamlanmış olarak işaretle
    if (isStepValid(currentStep)) {
      setCompletedSteps(prev => ({ ...prev, [currentStep]: true }));
    }
    
    setCurrentStep(stepIndex);
  };
  
  // Adım geçerliliğini kontrol eden fonksiyon
  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return formData.name.trim().length > 0;
      case 1:
        return true; // Görünüm adımı her zaman geçerlidir
      case 2:
        return true; // Bilgi tabanı opsiyonel
      case 3:
        return true; // Entegrasyon adımı her zaman geçerlidir
      default:
        return false;
    }
  };
  
  // Form geçerliliğini kontrol eden fonksiyon
  const validateForm = (): boolean => {
    // İsim zorunlu
    if (!formData.name.trim()) {
      toast.error('Bot adı boş olamaz');
      setCurrentStep(0); // İlk adıma git
      return false;
    }
    
    // Açıklama en az 10 karakter olmalı
    if (formData.description.trim().length < 10) {
      toast.error('Bot açıklaması en az 10 karakter olmalı');
      setCurrentStep(0); // İlk adıma git
      return false;
    }
    
    // Website URL kontrolü
    if (formData.websiteUrl) {
      try {
        new URL(formData.websiteUrl);
      } catch (e) {
        toast.error('Geçerli bir website URL\'si girin');
        setCurrentStep(2); // Bilgi tabanı adımına git
        return false;
      }
    }
    
    return true;
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const isFormValid = validateForm();
    if (!isFormValid) return;
    
    setIsLoading(true);
    
    try {
      // API şeması için gerekli tüm alanları içeren genişletilmiş form verisi oluştur
      const apiFormData = {
        ...formData,
        // API'nin beklediği tüm zorunlu alanları ekle
        websiteUrl: formData.websiteUrl || 'https://example.com',
        // Prompt API için zorunlu bir alan, form içinde yok, varsayılan değer ekle
        prompt: "Bu bir yapay zeka asistanıdır. Kullanıcı sorularına nazik ve yardımcı cevaplar verecektir."
      };
      
      console.log("Gönderilen veri:", apiFormData); // Hata ayıklama için
      
      // API'ye yeni bot verilerini gönder
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiFormData),
      });
      
      // API yanıtını al
      const result = await response.json();
      
      if (!response.ok) {
        console.error("API Hata Detayları:", result);
        throw new Error(result.message || 'Bot oluşturulurken bir hata oluştu');
      }
      
      toast.success('Bot başarıyla oluşturuldu');
      
      // MongoDB'ye eklendikten sonra bot ID'si döner
      const newBotId = result.bot._id || result.bot.id;
      
      // Bot detay sayfasına yönlendir
      router.push(`/dashboard/bots/${newBotId}`);
      
    } catch (error) {
      console.error('Bot oluşturulurken hata:', error);
      toast.error(error instanceof Error ? error.message : 'Bot oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // İleri/geri butonları
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    } else {
      // Son adımdayız, formu gönder
      const dummyEvent = { preventDefault: () => {} } as React.FormEvent;
      handleFormSubmit(dummyEvent);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };
  
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

  return (
    <div className="min-h-screen pt-24 pb-16 md:pl-72 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="mr-4 border-white/10 bg-white/5">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              Yeni <GradientText>Chatbot</GradientText> Oluştur
            </h1>
            <p className="text-white/60">
              Web siteniz için özel bir yapay zeka chatbotu oluşturun
            </p>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sol kısım - adımlar */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-1"
          >
            <AnimatedGradientBorder>
              <Card className="bg-black/50 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle>Adımlar</CardTitle>
                  <CardDescription className="text-white/60">
                    Botunuzu yapılandırmak için adımları takip edin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {steps.map((step, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <Step
                        title={step.title}
                        description={step.description}
                        icon={step.icon}
                        isActive={currentStep === index}
                        isCompleted={!!completedSteps[index]}
                        onClick={() => handleStepChange(index)}
                      />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedGradientBorder>
          </motion.div>
          
          {/* Sağ kısım - form içeriği */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-2"
          >
            <Card className="bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription className="text-white/60">
                  {steps[currentStep].description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentStepContent}
              </CardContent>
              <CardFooter className="flex justify-between border-t border-white/10 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="border-white/10 bg-white/5"
                >
                  Geri
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep) || isLoading}
                  variant="premium"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      İşleniyor...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      {currentStep === steps.length - 1 ? (
                        <>
                          <Save size={16} className="mr-2" />
                          Botu Oluştur
                        </>
                      ) : (
                        <>
                          Sonraki
                          <ChevronRight size={16} className="ml-1" />
                        </>
                      )}
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 