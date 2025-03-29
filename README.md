# ChatBot Forge

ChatBot Forge, yapay zeka destekli sohbet botları oluşturmanıza, özelleştirmenize ve yönetmenize olanak tanıyan güçlü bir platformdur. Kullanıcıların sitenizde veya uygulamanızda sorunsuz bir şekilde entegre olabilen akıllı sohbet botları oluşturmasına olanak tanır.

## Özellikler

- 🤖 **Özel Chatbotlar**: Kendi yapay zeka destekli sohbet botlarınızı kolayca oluşturun ve özelleştirin
- 📚 **Bilgi Tabanı Entegrasyonu**: Botlarınıza kendi bilgi tabanınızı ekleyin ve bağlam tabanlı yanıtlar alın
- 📊 **Gelişmiş Analitikler**: Ziyaretçi davranışlarını ve bot etkileşimlerini detaylı olarak analiz edin
- 💬 **Konuşma Yönetimi**: Tüm bot konuşmalarını izleyin ve yönetin
- 🔧 **API Entegrasyonu**: Uygulamalarınıza sorunsuzca entegre olabilmesi için kapsamlı API
- 🌐 **Çoklu Dil Desteği**: Çeşitli dillerde hizmet verin
- ⚙️ **Özelleştirilebilir Ayarlar**: Botunuzun davranışını ve görünümünü özelleştirin
- 🧠 **Gemini AI Entegrasyonu**: Google'ın Gemini AI modelleri ile güçlendirilmiş yapay zeka yetenekleri

## Başlarken

### Ön Koşullar

- Node.js (v18 veya üzeri)
- MongoDB
- npm veya yarn
- Google Gemini API anahtarı

### Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/username/ai-chat-bot.git
   cd ai-chat-bot
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   # veya
   yarn
   ```

3. Ortam değişkenlerini yapılandırın:
   `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişkenleri doldurun:
   ```
   DATABASE_URL=mongodb://localhost:27017/chatbot
   NEXTAUTH_SECRET=your_secret_key
   API_KEY=your_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   # veya
   yarn dev
   ```

5. Tarayıcınızda `http://localhost:3000` adresine gidin

## Gemini AI Entegrasyonu

ChatBot Forge, Google'ın Gemini AI modellerini kullanarak gelişmiş doğal dil anlama ve görsel tanıma yetenekleri sunar:

- **Gemini Pro**: Metin tabanlı sorulara kapsamlı ve doğal yanıtlar oluşturma
- **Gemini Pro Vision**: Hem metin hem de görüntü içeren sorulara yanıt oluşturma
- **Gemini Ultra**: En gelişmiş model, karmaşık görevler için (kullanılabilirliğe bağlı)

Gemini entegrasyonundan yararlanmak için şunları yapabilirsiniz:

1. Bot oluşturma sırasında Gemini modelini seçin
2. Bot ayarlarından model parametrelerini özelleştirin (sıcaklık, token limiti, vb.)
3. API aracılığıyla kendi uygulamanızdan Gemini modellerine erişin

## API Dokümantasyonu

API'miz hakkında daha fazla bilgi için, sunucunuz çalışırken `/api-docs` adresini ziyaret edin. API dokümantasyonu Swagger UI ile sağlanmıştır ve tüm mevcut endpoint'leri, parametreleri ve örnek kullanımları gösterir.

Gemini API endpointleri:
- `POST /api/v1/gemini/completions`: Metin tabanlı tamamlama oluşturma
- `POST /api/v1/gemini/embeddings`: Metin için gömme vektörleri oluşturma

## Proje Yapısı

```
/src
  /app                 # Next.js App Router
    /api               # API Route'ları
      /v1              # API versiyonu 1
        /gemini        # Gemini AI API endpointleri
    /dashboard         # Dashboard sayfaları
    /auth              # Kimlik doğrulama sayfaları
  /components          # Yeniden kullanılabilir bileşenler
  /lib                 # Yardımcı fonksiyonlar ve hook'lar
    /openapi           # OpenAPI spesifikasyonu
  /models              # Veritabanı modelleri
  /styles              # Global stil dosyaları
  /types               # TypeScript tip tanımlamaları
```

## Teknoloji Yığını

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Node.js, Next.js API Routes
- **Veritabanı**: MongoDB
- **Kimlik Doğrulama**: NextAuth.js
- **Stil**: TailwindCSS, Shadcn UI
- **Dil**: TypeScript
- **AI**: Google Gemini API

## Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! Lütfen projeye katkıda bulunmadan önce aşağıdaki adımları izleyin:

1. Bu depoyu "fork"layın
2. Özellik dalınızı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Add some amazing feature'`)
4. Dalınıza push yapın (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Sorularınız veya geri bildirimleriniz mi var? Bizimle iletişime geçin: contact@chatbotforge.com

