import { NextRequest, NextResponse } from 'next/server';
import { withAuthApi } from '@/lib/middleware/apiMiddleware';
import { z } from 'zod';
import { ApiError } from '@/lib/utils/apiError';
import { logger } from '@/lib/utils/logger';

// Gemini ile entegrasyon için import edilecek
import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Gemini API anahtarı
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Güvenlik ayarları türleri - uyumluluk için basitleştirildi
type SafetyCategory = 
  | 'HARM_CATEGORY_HARASSMENT'
  | 'HARM_CATEGORY_HATE_SPEECH'
  | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
  | 'HARM_CATEGORY_DANGEROUS_CONTENT';

type SafetyThreshold = 
  | 'BLOCK_NONE'
  | 'BLOCK_LOW_AND_ABOVE'
  | 'BLOCK_MED_AND_ABOVE'
  | 'BLOCK_HIGH_AND_ABOVE'
  | 'BLOCK_ALL';

// Tip uyumsuzluklarını aşmak için Part tipi tanımı
type Part = any;

// Gemini isteği için şema doğrulama
const completionRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt metin gereklidir').max(32000, 'Prompt çok uzun'),
  model: z.enum(['gemini-2.0-flash']).default('gemini-2.0-flash'),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  maxOutputTokens: z.number().int().positive().optional().default(1024),
  topK: z.number().int().positive().optional().default(40),
  topP: z.number().min(0).max(1).optional().default(0.95),
  safetySettings: z.array(
    z.object({
      category: z.enum([
        'HARM_CATEGORY_HARASSMENT',
        'HARM_CATEGORY_HATE_SPEECH',
        'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'HARM_CATEGORY_DANGEROUS_CONTENT'
      ]),
      threshold: z.enum([
        'BLOCK_NONE',
        'BLOCK_LOW_AND_ABOVE',
        'BLOCK_MED_AND_ABOVE', 
        'BLOCK_HIGH_AND_ABOVE',
        'BLOCK_ALL'
      ])
    })
  ).optional(),
  media: z.array(
    z.object({
      type: z.literal('image'),
      data: z.string(),
      mimeType: z.string()
    })
  ).optional()
});

/**
 * Gemini API istek işleyicisi
 */
async function handleCompletionsRequest(request: NextRequest) {
  try {
    // İstek gövdesi al ve doğrula
    const body = await request.json();
    const validationResult = completionRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw ApiError.badRequest('Geçersiz istek parametreleri', validationResult.error.format());
    }
    
    // Doğrulanmış parametreler
    const {
      prompt,
      model,
      temperature,
      maxOutputTokens,
      topK,
      topP,
      safetySettings,
      media
    } = validationResult.data;
    
    // API anahtarını kontrol et
    if (!GEMINI_API_KEY) {
      throw ApiError.internal('Gemini API anahtarı yapılandırılmamış');
    }
    
    // Generative AI istemcisi oluştur
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model });
    
    // Model konfigürasyonu
    const generationConfig = {
      temperature,
      topK,
      topP,
      maxOutputTokens,
    };
    
    let result;
    
    // Medya içerikleri varsa
    if (media && media.length > 0) {
      try {
        const userParts: Part[] = [];
        userParts.push({ text: prompt });
        
        // Medya içeriklerini ekle
        for (const item of media) {
          const base64Data = item.data.replace(/^data:image\/\w+;base64,/, '');
          userParts.push({
            inlineData: {
              data: base64Data,
              mimeType: item.mimeType
            }
          });
        }
        
        // Gemini modeline istek yolla - Gemini 2.0 Flash için role ekle
        result = await geminiModel.generateContent({
          contents: [{ role: 'user', parts: userParts }],
          generationConfig
        });
      } catch (err: any) {
        logger.error(`Vision API hatası: ${err.message}`, {
          context: 'GEMINI_VISION_API',
          data: { errorDetails: err.message }
        });
        throw ApiError.internal('Görüntü işlenirken hata oluştu');
      }
    } else {
      // Standart metin istemli istek - Gemini 2.0 Flash için role ekle
      const textPart: Part = { text: prompt };
      result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [textPart] }],
        generationConfig
      });
    }
    
    // Yanıtı formatla
    const response = result.response;
    
    // Token kullanımı bilgisi (bu özellik gelecekte Gemini API'de desteklenebilir)
    const usage = {
      promptTokens: 0, // Şu an Gemini bu bilgiyi sağlamıyor
      completionTokens: 0, // Şu an Gemini bu bilgiyi sağlamıyor
      totalTokens: 0 // Şu an Gemini bu bilgiyi sağlamıyor
    };
    
    // İsteği logla
    logger.info(`Gemini tamamlama yanıtı oluşturuldu: ${model}`, {
      context: 'GEMINI_API',
      data: {
        model,
        promptLength: prompt.length,
        responseLength: response.text().length
      }
    });
    
    // Başarılı yanıt
    return NextResponse.json({
      text: response.text(),
      finishReason: response.promptFeedback?.blockReason || 'STOP',
      safetyRatings: response.promptFeedback?.safetyRatings || [],
      usage
    });
    
  } catch (error: any) {
    // Özel API hatası ise doğrudan kullan
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Gemini API hataları
    if (error.name === 'GoogleGenerativeAIError') {
      logger.error(`Gemini API hatası: ${error.message}`, {
        context: 'GEMINI_API_ERROR',
        data: { errorMessage: error.message }
      });
      
      if (error.message.includes('rate limit')) {
        throw ApiError.tooManyRequests('Gemini API istek limiti aşıldı');
      }
      
      if (error.message.includes('safety')) {
        throw ApiError.badRequest('Gemini güvenlik filtreleri isteği engelledi');
      }
      
      throw ApiError.internal('Gemini API hatası');
    }
    
    // Genel hatalar
    logger.error(`Gemini tamamlama isteği işlenirken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, {
      context: 'GEMINI_API_ERROR',
      data: { errorType: error.constructor?.name }
    });
    throw ApiError.internal('Tamamlama isteği işlenirken bir hata oluştu');
  }
}

/**
 * POST /api/v1/gemini/completions
 * Gemini AI modeli ile metin tamamlama
 */
export const POST = withAuthApi(
  async (request: NextRequest) => {
    return await handleCompletionsRequest(request);
  },
  {
    rateLimit: 20, // 1 dakikada maksimum 20 istek
    version: 'v1',
    cacheSeconds: 0 // Tamamlama istekleri önbelleğe alınmaz, her seferinde yeni yanıt üretilir
  }
); 