import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Gemini model kimliği - Güncellenmiş model
const MODEL_NAME = "gemini-2.0-flash";

// API anahtarı environment variable olarak belirleniyor
const getApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("NEXT_PUBLIC_GEMINI_API_KEY environment variable belirlenmemiş, demo anahtarı kullanılıyor");
    // Gerçek uygulamada API anahtarı olmadan devam edilmemeli
    // Geliştirme sırasında test için bir anahtar döndürüyoruz
    return "DEMO_ANAHTAR_KULLANILMAMALI";
  }
  return apiKey;
};

// Gemini AI istemcisi oluşturma
const getGenerativeModel = () => {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);

  // İçerik filtreleme ayarları - güncellenmiş flash model için optimize edildi
  const generationConfig = {
    temperature: 0.6, // Flash modeli için daha düşük sıcaklık değeri
    topK: 32,
    topP: 0.9,
    maxOutputTokens: 2048, // Daha uzun çıktılar için arttırıldı
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig,
    safetySettings,
  });
};

// Website URL'inden içerik çekmek için yeni fonksiyon
export async function extractWebsiteContent(url: string) {
  try {
    console.log(`Website içeriği çekiliyor: ${url}`);
    
    // Önce URL formatını kontrol et
    try {
      new URL(url);
    } catch (error) {
      return { 
        success: false, 
        error: 'Geçersiz URL formatı. Lütfen http:// veya https:// ile başlayan tam bir URL girin.',
        content: ""
      };
    }
    
    // API endpoint'ine istek at
    const response = await fetch('/api/extract-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error || `Web sitesi içeriği çekilemedi: ${response.status} ${response.statusText}`,
        content: ""
      };
    }
    
    const data = await response.json();
    
    // Veriler başarıyla döndüyse
    if (data.success && data.content) {
      return {
        success: true,
        content: data.content
      };
    }
    
    // İçerik yoksa
    return { 
      success: false, 
      error: data.error || 'Web sitesinden kullanılabilir içerik çekilemedi.',
      content: ""
    };
    
  } catch (error) {
    console.error('Website içeriği çekme hatası:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
      content: ""
    };
  }
}

// Chat yanıtı oluşturmak için fonksiyon
export async function generateChatResponse(
  prompt: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  botPrompt: string
) {
  try {
    const model = getGenerativeModel();
    
    // Sistem talimatı olarak bot prompt'unu ekleyelim
    const systemInstruction = botPrompt || "Yardımcı bir asistan olarak davran. Soruları kısa ve öz bir şekilde yanıtla.";

    // Chat geçmişini Gemini formatına çevirelim
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Yeni bir chat başlat ve sistem talimatını ekle
    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: systemInstruction,
    });

    // Kullanıcı mesajını gönder ve yanıt al
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    return { text };

  } catch (error) {
    console.error('Gemini API hatası:', error);
    return { 
      text: "Üzgünüm, şu anda yanıt üretemiyorum. Lütfen daha sonra tekrar deneyin.",
      error: error instanceof Error ? error.message : "Bilinmeyen hata" 
    };
  }
}

// Gemini sınıfı - Widget önizleme ve diğer uygulamalar için
export class Gemini {
  private model: any;
  private isDemoMode: boolean;

  constructor() {
    this.model = getGenerativeModel();
    // API anahtarı "DEMO" ile başlıyorsa demo modunu etkinleştir
    const apiKey = getApiKey();
    this.isDemoMode = apiKey.startsWith("DEMO_");
  }

  // Chat yanıtı oluşturmak için metod
  async chat(
    messages: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }>
  ): Promise<string> {
    try {
      // Demo modu kontrolü
      if (this.isDemoMode) {
        console.log("Gemini API ile sohbet ediliyor (demo modu)");
        return this.generateDemoResponse(messages);
      } 
      
      // Gerçek API çağrısı
      console.log("Gemini API ile sohbet ediliyor (gerçek mod)");
      
      // Mesaj yapısını detaylı log et
      console.log("Mesaj yapısı:", JSON.stringify(messages, null, 2));
      
      // Sistem mesajını ayır
      const systemMessages = messages.filter(msg => msg.role === 'system');
      
      // Kullanıcı ve model mesajlarını ayır
      const userAndModelMessages = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: msg.parts
        }));
      
      // Mesaj dizisinin boş olup olmadığını kontrol et
      if (userAndModelMessages.length === 0) {
        console.warn("Uyarı: Sohbet geçmişi boş");
        return "Sohbet geçmişi boş.";
      }
      
      try {
        // Tüm sohbet geçmişini birleştir
        let chatHistory = [...userAndModelMessages];
        
        // Sistem mesajlarını normal model mesajları olarak ekle
        // NOT: Gemini 2.0 Flash modelinde sistemInstruction doğrudan kullanılamıyor
        if (systemMessages.length > 0) {
          // Her sistem mesajını, model mesajı olarak ekle
          for (const sysMsg of systemMessages) {
            const systemContent = sysMsg.parts[0]?.text || "";
            console.log("Sistem mesajı model mesajına dönüştürülüyor:", systemContent);
            
            // Geçmişin başına ekle
            chatHistory.unshift({
              role: 'model',
              parts: [{ text: systemContent }]
            });
          }
          
          // Chat geçmişinin ilk mesajı kullanıcıdan gelmelidir
          if (chatHistory[0].role !== 'user') {
            chatHistory.unshift({
              role: 'user',
              parts: [{ text: "Merhaba" }]
            });
          }
        }
        
        // Sohbet geçmişinde en az bir mesaj olmalı
        if (chatHistory.length === 0) {
          console.warn("Uyarı: Mesaj yok, boş bir sohbet başlatılamaz");
          return "Sohbet başlatılamadı.";
        }
        
        // Son kullanıcı mesajını bul ve ayır
        const lastUserMessageIndex = chatHistory.map(msg => msg.role).lastIndexOf('user');
        
        if (lastUserMessageIndex === -1) {
          console.warn("Uyarı: Son kullanıcı mesajı bulunamadı");
          return "Son kullanıcı mesajı bulunamadı.";
        }
        
        const lastUserMessage = chatHistory[lastUserMessageIndex];
        const lastUserContent = lastUserMessage.parts[0]?.text || "";
        
        // Son kullanıcı mesajını geçmişten çıkar
        const history = chatHistory.slice(0, lastUserMessageIndex);
        
        console.log("Chat geçmişi:", JSON.stringify(history, null, 2));
        console.log("Son kullanıcı mesajı:", lastUserContent);
        
        // Google Generative AI'yi yeniden başlat (performans nedeniyle)
        const genAI = new GoogleGenerativeAI(getApiKey());
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        
        // Yeni bir chat başlat (sistemInstruction olmadan)
        const chat = model.startChat({
          history: history
        });
        
        // Son kullanıcı mesajını gönder
        const result = await chat.sendMessage(lastUserContent);
        return result.response.text();
        
      } catch (error) {
        console.error('Gemini API hata detayları:', error);
        
        // Hata durumunda basitleştirilmiş bir yaklaşım dene
        console.log("Basit sohbet denemesi yapılıyor...");
        
        // Son kullanıcı mesajını bul
        const lastUserMsg = [...userAndModelMessages].reverse().find(msg => msg.role === 'user');
        if (!lastUserMsg) {
          return "Kullanıcı mesajı bulunamadı";
        }
        
        // Doğrudan mesaj gönder (geçmiş olmadan)
        const result = await this.model.generateContent(lastUserMsg.parts[0]?.text || "");
        return result.response.text();
      }
      
    } catch (error) {
      console.error('Gemini API genel hata:', error);
      return "Üzgünüm, yanıt oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin. Hata: " + 
        (error instanceof Error ? error.message : "Bilinmeyen hata");
    }
  }

  // Demo modu için yanıt oluştur
  private async generateDemoResponse(messages: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>): Promise<string> {
    // Mesajları incele
    const userMessage = messages.find(msg => msg.role === 'user')?.parts[0]?.text || "";
    
    // Basit bir bot yanıtı simüle et
    await new Promise(resolve => setTimeout(resolve, 1000)); // AI düşünüyor efekti
    
    if (userMessage.toLowerCase().includes("merhaba") || userMessage.toLowerCase().includes("selam")) {
      return "Merhaba! Size nasıl yardımcı olabilirim?";
    } else if (userMessage.toLowerCase().includes("yardım")) {
      return "Size yardımcı olmak için buradayım. Lütfen nasıl yardımcı olabileceğimi belirtin.";
    } else if (userMessage.toLowerCase().includes("teşekkür")) {
      return "Rica ederim! Başka bir sorunuz var mı?";
    } else if (userMessage.toLowerCase().includes("ürün") || userMessage.toLowerCase().includes("hizmet")) {
      return "Ürünlerimiz ve hizmetlerimiz hakkında detaylı bilgi için web sitemizi ziyaret edebilirsiniz. Size nasıl yardımcı olabilirim?";
    } else if (userMessage.toLowerCase().includes("fiyat")) {
      return "Fiyatlarımız ürün ve hizmetlere göre değişmektedir. Belirli bir ürün veya hizmet hakkında fiyat almak ister misiniz?";
    } else if (userMessage.toLowerCase().includes("iletişim")) {
      return "Bizimle iletişime geçmek için info@example.com adresine e-posta gönderebilir veya +90 123 456 7890 numaralı telefondan bize ulaşabilirsiniz.";
    } else {
      return "Sorunuzu anladım. Size yardımcı olmak için daha fazla bilgiye ihtiyacım var. Lütfen sorunuzu detaylandırır mısınız?";
    }
  }
}

export default generateChatResponse; 