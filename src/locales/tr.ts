export default {
  dashboard: {
    overview: 'Genel Bakış',
    my_chatbots: 'Chatbotlarım',
    conversations: 'Konuşmalar',
    analytics: 'Analitik',
    visitors: 'Ziyaretçiler',
    billing: 'Faturalama',
    settings: 'Ayarlar',
    free_plan: 'Ücretsiz Plan',
    upgrade_info: 'Daha fazla özellik için planınızı yükseltin',
    upgrade_button: 'Premium\'a Yükselt',
    api_docs: 'API Dokümantasyonu',
    developer_tools: 'Geliştirici Araçları',
  },
  api_docs: {
    title: 'API Dokümantasyonu',
    description: 'ChatBot Forge API\'sı hakkında kapsamlı dokümantasyon',
    endpoints: 'Uç Noktalar',
    authentication: 'Kimlik Doğrulama',
    auth_description: 'API isteklerinizde kimlik doğrulaması için API anahtarınızı kullanın',
    rate_limits: 'İstek Limitleri',
    rate_description: 'API istekleriniz için istek sınırlamaları ve kısıtlamalar',
    errors: 'Hata Kodları',
    errors_description: 'API tarafından döndürülen ortak hata kodları ve anlamları',
    get_started: 'Başlarken',
    examples: 'Örnekler',
    try_it: 'Deneyin',
    response: 'Yanıt',
    parameters: 'Parametreler',
    request_body: 'İstek Gövdesi',
    required: 'Zorunlu',
    optional: 'İsteğe Bağlı',
    schema: 'Şema',
  },
  gemini: {
    title: 'Gemini AI',
    description: 'Google\'ın Gemini AI modeli entegrasyonu',
    models: {
      pro: 'Gemini Pro',
      pro_vision: 'Gemini Pro Vision',
      ultra: 'Gemini Ultra'
    },
    parameters: {
      temperature: 'Sıcaklık',
      temperature_desc: 'Yanıt çeşitliliği (0.0 - 1.0)',
      top_k: 'Üst K',
      top_k_desc: 'Seçilecek en olası token sayısı',
      top_p: 'Üst P',
      top_p_desc: 'Nucleus sampling eşiği',
      max_tokens: 'Maksimum Token',
      max_tokens_desc: 'Maksimum yanıt token sayısı',
      safety: 'Güvenlik Ayarları',
      safety_desc: 'İçerik güvenlik filtreleri'
    },
    endpoints: {
      completions: 'Tamamlama',
      completions_desc: 'Metinden metine bir tamamlama oluştur',
      vision: 'Görüntü Anlama',
      vision_desc: 'Görüntülerden metine bir tamamlama oluştur',
      embeddings: 'Gömme Vektörleri',
      embeddings_desc: 'Metin için gömme vektörleri oluştur'
    },
    errors: {
      api_key_missing: 'Gemini API anahtarı yapılandırılmamış',
      rate_limit: 'Gemini API istek limiti aşıldı',
      safety_block: 'Gemini güvenlik filtreleri isteği engelledi',
      general_error: 'Gemini API hatası',
      vision_error: 'Görüntü işlenirken hata oluştu'
    }
  }
}; 