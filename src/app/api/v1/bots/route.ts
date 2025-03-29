import { NextRequest, NextResponse } from 'next/server';
import { withAuthApi } from '@/lib/middleware/apiMiddleware';
import connectToDatabase from '@/lib/db/mongoose';
import mongoose from 'mongoose';
import { ApiError } from '@/lib/utils/apiError';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';

/**
 * @swagger
 * /bots:
 *   get:
 *     summary: Botları listele
 *     description: Kullanıcının tüm botlarını listeler
 *     tags:
 *       - Bots
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeStats
 *         schema:
 *           type: boolean
 *         description: Bot istatistiklerini dahil et
 *     responses:
 *       200:
 *         description: Bot listesi başarıyla alındı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bots:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bot'
 *       401:
 *         description: Yetkisiz erişim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function handleGetRequest(request: NextRequest) {
  try {
    // Oturum kontrolü middleware ile yapılıyor
    
    // Veritabanına bağlan
    await connectToDatabase();
    
    // Mongoose bağlantısı üzerinden veritabanına erişim
    const db = mongoose.connection.db!;
    
    // URL'den parametre kontrolü
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';
    
    // Oturum bilgilerini al (middleware tarafından yapılıyor)
    const session = request.headers.get('session');
    if (!session) {
      throw ApiError.unauthorized();
    }
    
    const userId = JSON.parse(session).user.id;
    
    // Kullanıcının botlarını al
    let bots = await db.collection('bots').find({ 
      userId: userId
    }).toArray();
    
    // İstatistikleri dahil etmek istiyorsak
    if (includeStats) {
      // Tüm botlar için istatistikleri hesapla
      const botIds = bots.map(bot => bot._id.toString());
      
      // İlgili botlar için toplam konuşmaları ve mesajları al
      const conversationsAgg = await db.collection('conversations').aggregate([
        { 
          $match: { 
            botId: { $in: botIds } 
          } 
        },
        { 
          $group: { 
            _id: '$botId', 
            count: { $sum: 1 },
            successCount: {
              $sum: {
                $cond: [
                  { $or: [
                    { $eq: ['$status', 'completed'] },
                    { $eq: ['$feedback', 'positive'] }
                  ]},
                  1,
                  0
                ]
              }
            }
          } 
        }
      ]).toArray();
      
      // Her bot için istatistikleri ekle
      bots = bots.map(bot => {
        const botStats = conversationsAgg.find(
          stats => stats._id === bot._id.toString()
        );
        
        return {
          ...bot,
          conversations: botStats ? botStats.count : 0,
          successRate: botStats 
            ? Math.round((botStats.successCount / botStats.count) * 100) 
            : 0
        };
      });
    }
    
    logger.info(`${bots.length} bot alındı`, {
      context: 'BOT_LIST',
      data: { userId, includeStats }
    });
    
    return NextResponse.json({ bots });
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error(`Botlar alınırken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, {
      context: 'BOT_LIST',
      data: { error }
    });
    
    throw ApiError.internal('Botlar alınırken bir hata oluştu');
  }
}

/**
 * @swagger
 * /bots:
 *   post:
 *     summary: Yeni bot oluştur
 *     description: Yeni bir bot oluşturur
 *     tags:
 *       - Bots
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - websiteUrl
 *               - prompt
 *             properties:
 *               name:
 *                 type: string
 *                 description: Bot adı
 *               description:
 *                 type: string
 *                 description: Bot açıklaması
 *               websiteUrl:
 *                 type: string
 *                 description: Bot entegre edilecek web sitesi URL
 *               prompt:
 *                 type: string
 *                 description: Bot sistem talimatları
 *               primaryColor:
 *                 type: string
 *                 description: Bot birincil rengi (hex) 
 *     responses:
 *       201:
 *         description: Bot başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 bot:
 *                   $ref: '#/components/schemas/Bot'
 *       400:
 *         description: Geçersiz istek
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Yetkisiz erişim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function handlePostRequest(req: NextRequest) {
  try {
    // Veritabanına bağlan
    await connectToDatabase();
    
    // Mongoose bağlantısı üzerinden veritabanına erişim
    const db = mongoose.connection.db!;
    
    // Bot şema doğrulaması
    const botSchema = z.object({
      name: z.string().min(3, 'Bot adı en az 3 karakter olmalıdır'),
      description: z.string().min(10, 'Bot açıklaması en az 10 karakter olmalıdır'),
      websiteUrl: z.string().url('Geçerli bir URL giriniz'),
      prompt: z.string().min(20, 'Prompt en az 20 karakter olmalıdır'),
      primaryColor: z.string().regex(/^#([0-9A-F]{6})$/i, 'Geçerli bir HEX renk kodu giriniz').default('#4338ca'),
      fontFamily: z.string().default('Inter, sans-serif'),
    });
    
    // İstek gövdesini doğrula
    const body = await req.json();
    const validationResult = botSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw ApiError.badRequest('Geçersiz bot bilgileri', validationResult.error.format());
    }
    
    const {
      name,
      description,
      websiteUrl,
      prompt,
      primaryColor,
      fontFamily,
    } = validationResult.data;
    
    // Oturum bilgilerini al (middleware tarafından yapılıyor)
    const session = req.headers.get('session');
    if (!session) {
      throw ApiError.unauthorized();
    }
    
    const userId = JSON.parse(session).user.id;
    
    // Bot adının benzersiz olduğunu kontrol et
    const existingBot = await db.collection('bots').findOne({ 
      name, 
      userId
    });
    
    if (existingBot) {
      throw ApiError.conflict('Bu isimle bir bot zaten mevcut');
    }
    
    // Yeni bot oluştur
    const newBot = await db.collection('bots').insertOne({
      name,
      description,
      websiteUrl,
      prompt,
      userId,
      status: 'online',
      stylingOptions: {
        primaryColor,
        fontFamily,
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    logger.info(`Yeni bot oluşturuldu: ${name}`, {
      context: 'BOT_CREATE',
      data: { botId: newBot.insertedId, userId }
    });
    
    return NextResponse.json(
      { 
        message: 'Bot başarıyla oluşturuldu', 
        bot: {
          _id: newBot.insertedId,
          name,
          description,
          websiteUrl,
          prompt,
          userId,
          status: 'online',
          stylingOptions: {
            primaryColor,
            fontFamily,
          },
          createdAt: new Date(),
          updatedAt: new Date()
        } 
      },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error(`Bot oluşturma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, {
      context: 'BOT_CREATE',
      data: { error }
    });
    
    throw ApiError.internal('Bot oluşturulurken bir hata oluştu');
  }
}

// POST istekleri için middleware uygulama (authentication, rate limit, caching)
export const POST = withAuthApi(handlePostRequest, { 
  rateLimit: 30, 
  version: 'v1' 
});

// GET istekleri için middleware uygulama
export const GET = withAuthApi(handleGetRequest, { 
  rateLimit: 60, 
  cacheSeconds: 60, // 1 dakika önbellekleme
  version: 'v1'
}); 