import { NextRequest, NextResponse } from 'next/server';
import { withAuthApi } from '@/lib/middleware/apiMiddleware';
import { z } from 'zod';
import { ApiError } from '@/lib/utils/apiError';
import { logger } from '@/lib/utils/logger';

// Gemini ile entegrasyon için import edilecek
import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Gemini API anahtarı
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Embeddings isteği için şema doğrulama
const embeddingsRequestSchema = z.object({
  text: z.string().min(1, 'Metin gereklidir').max(10000, 'Metin çok uzun'),
  model: z.enum(['text-embedding-001']).default('text-embedding-001')
});

/**
 * Gemini embeddings API istek işleyicisi
 */
async function handleEmbeddingsRequest(request: NextRequest) {
  try {
    // İstek gövdesi al ve doğrula
    const body = await request.json();
    const validationResult = embeddingsRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw ApiError.badRequest('Geçersiz istek parametreleri', validationResult.error.format());
    }
    
    // Doğrulanmış parametreler
    const { text, model } = validationResult.data;
    
    // API anahtarını kontrol et
    if (!GEMINI_API_KEY) {
      throw ApiError.internal('Gemini API anahtarı yapılandırılmamış');
    }
    
    // Generative AI istemcisi oluştur
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const embeddingModel = genAI.getGenerativeModel({ model });
    
    // Gomme vektörü oluştur
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding.values;
    
    // İsteği logla
    logger.info(`Gemini gömme vektörü oluşturuldu: ${model}`, {
      context: 'GEMINI_API',
      data: {
        model,
        textLength: text.length,
        embeddingDimension: embedding.length
      }
    });
    
    // Başarılı yanıt
    return NextResponse.json({
      embedding,
      usage: {
        totalTokens: Math.ceil(text.length / 4) // Yaklaşık token sayısı (4 karakter ~= 1 token)
      }
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
      
      throw ApiError.internal('Gemini API hatası');
    }
    
    // Genel hatalar
    logger.error(`Gemini gömme isteği işlenirken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, {
      context: 'GEMINI_API_ERROR',
      data: { errorType: error.constructor?.name }
    });
    throw ApiError.internal('Gömme isteği işlenirken bir hata oluştu');
  }
}

/**
 * POST /api/v1/gemini/embeddings
 * Gemini AI modeli ile metin gömme vektörleri
 */
export const POST = withAuthApi(
  async (request: NextRequest) => {
    return await handleEmbeddingsRequest(request);
  },
  {
    rateLimit: 30, // 1 dakikada maksimum 30 istek
    version: 'v1',
    cacheSeconds: 86400 // 24 saat önbellekleme - aynı metinler için aynı gömme vektörleri döner
  }
); 