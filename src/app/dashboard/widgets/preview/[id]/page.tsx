'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Send, Bot, Loader2, X, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Gemini } from '@/lib/gemini';
import { GradientText } from '@/components/ui/gradient-text';

type Bot = {
  id: string;
  _id?: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'maintenance';
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  conversations: number;
  users: number;
  successRate: number;
  isPinned?: boolean;
  websiteUrl?: string;
  knowledge?: string;
  primaryColor?: string;
  secondaryColor?: string;
  greeting?: string;
  avatar?: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
};

export default function WidgetPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params.id as string;
  
  const [bot, setBot] = useState<Bot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Bot verilerini yükle
  useEffect(() => {
    const loadBot = async () => {
      try {
        setIsLoading(true);
        
        console.log("Widget - Bot ID:", botId);
        
        // API'den bot verilerini al
        const response = await fetch(`/api/bots/${botId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP error! status: ${response.status}`, errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Widget - API Yanıtı:", data);
        
        const foundBot = data.bot;
        
        if (foundBot) {
          console.log("API'den yüklenen bot:", foundBot);
          
          // MongoDB _id'yi id olarak kullan
          if (foundBot._id && !foundBot.id) {
            foundBot.id = foundBot._id;
          }
          
          setBot(foundBot);
          
          // Karşılama mesajı ekle
          if (foundBot.greeting) {
            setMessages([{
              id: 'greeting',
              role: 'assistant',
              content: foundBot.greeting,
              timestamp: new Date().toISOString()
            }]);
          } else {
            setMessages([{
              id: 'greeting',
              role: 'assistant',
              content: `Merhaba! Ben ${foundBot.name}. Size nasıl yardımcı olabilirim?`,
              timestamp: new Date().toISOString()
            }]);
          }
        } else {
          console.error("Bot verisi yok:", data);
          toast.error('Bot verisi bulunamadı');
          router.push('/dashboard/bots');
        }
      } catch (error) {
        console.error('Bot yükleme hatası:', error);
        toast.error('Bot bilgileri yüklenirken bir hata oluştu');
        router.push('/dashboard/bots');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBot();
  }, [botId, router]);
  
  // Mesajların sonuna otomatik kaydır
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Enter tuşuna basıldığında mesaj gönder
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Mesaj gönder
  const handleSubmit = async () => {
    if (!input.trim() || isProcessing || !bot) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Geçmiş mesajları formatlama
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));
      
      // Kullanıcı mesajını ekle
      messageHistory.push({
        role: 'user',
        parts: [{ text: userMessage.content }]
      });
      
      // Bilgi tabanı bağlamını oluştur
      let systemContext = "";
      
      if (bot.knowledge) {
        systemContext = `Aşağıdaki bilgiler doğrultusunda kullanıcıya yardımcı olun: ${bot.knowledge}. Ben ${bot.name} isimli bir asistanım.`;
      } else if (bot.websiteUrl) {
        // URL'yi kısalt
        const cleanUrl = bot.websiteUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
        systemContext = `Ben ${bot.name} isimli bir asistanım. ${cleanUrl} web sitesini temsil ediyorum.`;
      } else {
        systemContext = `Ben ${bot.name} isimli bir asistanım.`;
      }
      
      // Sistem mesajını ekle
      const fullHistory = [
        {
          role: 'system',
          parts: [{ text: systemContext }]
        },
        ...messageHistory
      ];
      
      // Gemini API'ye istek gönder
      const gemini = new Gemini();
      const response = await gemini.chat(fullHistory);
      
      // Bot cevabını ekle
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, botResponse]);
      
      // Bot istatistiklerini API üzerinden güncelle
      try {
        // Bot ID'si MongoDB formatına uygun hale getir
        const id = bot._id || bot.id;
        
        // API'ye istatistik güncelleme isteği gönder
        await fetch(`/api/bots/${id}/statistics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            type: 'conversation',
            botId: id
          }),
        });
        
        console.log('Bot istatistikleri güncellendi');
      } catch (statsError) {
        console.error('İstatistik güncelleme hatası:', statsError);
      }
      
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      // Hata mesajı ekle
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Üzgünüm, mesajınızı işlerken bir hata oluştu. Lütfen tekrar deneyin.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsProcessing(false);
      // Input'a odaklan
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  // Widget genişletme/daraltma
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Widget kapatma/açma
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 md:pl-72 px-4 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium">Widget Yükleniyor</h3>
          <p className="text-white/60">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }
  
  if (!bot) {
    return (
      <div className="min-h-screen pt-24 pb-16 md:pl-72 px-4 flex justify-center items-center">
        <div className="text-center">
          <Bot className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium">Bot Bulunamadı</h3>
          <p className="text-white/60 mb-6">Aradığınız bot mevcut değil veya silinmiş olabilir.</p>
          <Link href="/dashboard/bots">
            <Button>Botlarıma Dön</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Bot renklerini belirle
  const primaryColor = bot.primaryColor || '#6366f1';
  const secondaryColor = bot.secondaryColor || '#a855f7';

  return (
    <div className="min-h-screen pt-24 pb-16 md:pl-72 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href={`/dashboard/bots/${bot.id}`}>
            <Button variant="outline" size="icon" className="mr-4 border-white/10 bg-white/5">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {bot.icon} {bot.name} <GradientText>Widget Önizlemesi</GradientText>
            </h1>
            <p className="text-white/60">
              Botunuzun web sitenizde nasıl görüneceğini test edin
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
                <CardHeader>
                <CardTitle className="text-lg">Widget Önizlemesi</CardTitle>
                <CardDescription>
                  Botunuzun web sitenize entegre edildiğinde nasıl görüneceğini görebilirsiniz
                  </CardDescription>
                </CardHeader>
              <CardContent>
                <div className="bg-gray-900 p-6 min-h-[600px] relative">
                  {/* Web sitesi taklidi */}
                  <div className="w-full h-full max-w-3xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4 text-white/90">Örnek Web Sayfası</h2>
                    <p className="text-white/70 mb-8">
                      Bu, botunuzun web sitenize entegre edildiğinde nasıl görüneceğinin bir önizlemesidir.
                      Aşağıdaki sohbet penceresinden botunuzu test edebilirsiniz.
                    </p>
                    
                    <div className="space-y-8">
                      {[0, 1, 2].map((i) => (
                        <div key={i}>
                          <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
                          <div className="h-3 w-full bg-white/10 rounded mb-2"></div>
                          <div className="h-3 w-full bg-white/10 rounded mb-2"></div>
                          <div className="h-3 w-2/3 bg-white/10 rounded"></div>
                    </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Chatbot Widget */}
                  {isOpen ? (
                    <div 
                      className={`absolute bottom-6 right-6 w-80 rounded-lg overflow-hidden shadow-xl transition-all ${
                        isExpanded ? 'h-[600px] md:w-96' : 'h-[400px]'
                      }`}
                    >
                      {/* Widget Başlığı */}
                      <div 
                        className="flex items-center justify-between p-3"
                        style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-white/20 p-1.5 rounded-full">
                            <Bot size={14} className="text-white" />
                          </div>
                          <span className="text-white font-medium">{bot.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={toggleExpand}
                            className="p-1.5 rounded-full hover:bg-white/20 text-white"
                          >
                            {isExpanded ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="4 14 10 14 10 20"></polyline>
                                <polyline points="20 10 14 10 14 4"></polyline>
                                <line x1="14" y1="10" x2="21" y2="3"></line>
                                <line x1="3" y1="21" x2="10" y2="14"></line>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <polyline points="9 21 3 21 3 15"></polyline>
                                <line x1="21" y1="3" x2="14" y2="10"></line>
                                <line x1="3" y1="21" x2="10" y2="14"></line>
                              </svg>
                            )}
                          </button>
                          <button 
                            onClick={toggleOpen}
                            className="p-1.5 rounded-full hover:bg-white/20 text-white"
                          >
                            <X size={14} />
                              </button>
                        </div>
                            </div>
                            
                      {/* Sohbet İçeriği */}
                      <div className="flex-1 bg-gray-800 h-[calc(100%-112px)] overflow-y-auto p-4">
                        {messages.map((message) => (
                                <div 
                                  key={message.id}
                            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                            {message.role === 'assistant' && (
                                    <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
                                style={{ background: primaryColor }}
                                    >
                                <Bot size={14} className="text-white" />
                                    </div>
                                  )}
                                  
                            <div
                              className={`py-2 px-3 rounded-lg max-w-[80%] ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-r text-white ml-2'
                                  : 'bg-gray-700 text-white/90'
                              }`}
                              style={
                                message.role === 'user'
                                  ? { background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }
                                  : {}
                              }
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-[10px] mt-1 opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                                  </div>
                                  
                            {message.role === 'user' && (
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2 flex-shrink-0">
                                <User size={14} className="text-white/70" />
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                        {isProcessing && (
                                <div className="flex justify-start mb-4">
                                  <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                              style={{ background: primaryColor }}
                                  >
                              <Bot size={14} className="text-white" />
                                  </div>
                            <div className="py-3 px-3 rounded-lg bg-gray-700">
                                    <div className="flex space-x-1">
                                <div className="size-2 bg-white/40 rounded-full animate-bounce"></div>
                                <div className="size-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="size-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div ref={messagesEndRef} />
                            </div>
                            
                      {/* Mesaj Giriş Alanı */}
                      <div className="bg-gray-900 p-3 border-t border-gray-700">
                              <div className="flex">
                                <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                                  placeholder="Mesajınızı yazın..."
                            className="flex-1 bg-gray-800 border-gray-700 text-white focus:ring-1 focus:ring-gray-700 rounded-l-md rounded-r-none border-r-0"
                            disabled={isProcessing}
                                />
                                <Button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isProcessing}
                            className="rounded-l-none rounded-r-md"
                            style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                          >
                            {isProcessing ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                                  <Send size={18} />
                            )}
                                </Button>
                              </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={toggleOpen}
                      className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                    >
                      <MessageSquare size={24} className="text-white" />
                    </button>
                                )}
                              </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Bot Bilgileri</CardTitle>
                <CardDescription>
                  Widget yapılandırması ve entegrasyon bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-2">Entegrasyon Kodu</h3>
                  <div className="bg-black/50 p-3 rounded text-xs font-mono text-white/80 overflow-x-auto">
                    &lt;script&gt;<br />
                    &nbsp;&nbsp;(function(d,t) {"{"}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;var BASE_URL = "https://chatbot-forge.example.com";<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;var g=d.createElement(t),s=d.getElementsByTagName(t)[0];<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;g.src=BASE_URL+"/widget/loader.js"; g.defer=true; g.async=true;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;s.parentNode.insertBefore(g,s);<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;g.onload=function(){"{"}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;window.ChatBotForge.init({"{"}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;botId: "{bot.id}",<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;primaryColor: "{primaryColor}",<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;secondaryColor: "{secondaryColor}"<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"}"});<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br />
                    &nbsp;&nbsp;{"}"}(document,"script"));<br />
                    &lt;/script&gt;
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    Bu kodu web sitenizin &lt;body&gt; etiketinin sonuna ekleyin.
                  </p>
                            </div>
                
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-medium text-white/70 mb-3">Test Sonuçları</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/70">Cevap süresi</span>
                      <span className="text-sm">0.8 saniye</span>
                          </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/70">Doğruluk oranı</span>
                      <span className="text-sm">%92</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/70">Widget boyutu</span>
                      <span className="text-sm">82 KB</span>
                    </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 