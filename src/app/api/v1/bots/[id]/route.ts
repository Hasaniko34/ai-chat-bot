import { NextRequest, NextResponse } from 'next/server';
import { withAuthApi } from '@/lib/middleware/apiMiddleware';
import connectToDatabase from '@/lib/db/mongoose';
import mongoose from 'mongoose';
import { ApiError } from '@/lib/utils/apiError';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
import { ObjectId } from 'mongodb';

/**
 * @swagger
 * /bots/{id}:
 *   get:
 *     summary: Bot detaylarını al
 *     description: Belirli bir botun detaylarını getirir
 *     tags:
 *       - Bots
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bot ID
 *     responses:
 *       200:
 *         description: Bot detayları başarıyla alındı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bot:
 *                   $ref: '#/components/schemas/Bot'
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Bot bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
async function handleGetRequest(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      throw ApiError.badRequest('Bot ID gereklidir');
    }
    
    // Veritabanına bağlan
    await connectToDatabase();
    
    // Mongoose bağlantısı üzerinden veritabanına erişim
    const db = mongoose.connection.db!;
    
    // MongoDB ObjectId formatını kontrol et
    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      throw ApiError.badRequest('Geçersiz Bot ID formatı');
    }
    
    // Oturum bilgilerini al (middleware tarafından yapılıyor)
    const session = request.headers.get('session');
    if (!session) {
      throw ApiError.unauthorized();
    }
    
    const userId = JSON.parse(session).user.id;
    
    // Botun varlığını ve sahipliğini kontrol et
    const bot = await db.collection('bots').findOne({ 
      _id: objectId,
      userId: userId
    });
    
    if (!bot) {
      throw ApiError.notFound('Bot bulunamadı');
    }
    
    logger.info(`Bot detayları alındı: ${bot.name}`, {
      context: 'BOT_DETAILS',
      data: { botId: params.id, userId }
    });
    
    return NextResponse.json({ bot });
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error(`Bot detayları alınırken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, {
      context: 'BOT_DETAILS',
      data: { botId: params?.id, error }
    });
    
    throw ApiError.internal('Bot detayları alınırken bir hata oluştu');
  }
}

/**
 * @swagger
 * /bots/{id}:
 *   put:
 *     summary: Bot güncelle
 *     description: Belirli bir botu günceller
 *     tags:
 *       - Bots
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               websiteUrl:
 *                 type: string
 *               prompt:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [online, offline, maintenance]
 *               primaryColor:
 *                 type: string
 *               fontFamily:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bot başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Bot bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
async function handlePutRequest(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      throw ApiError.badRequest('Bot ID gereklidir');
    }
    
    // Veritabanına bağlan
    await connectToDatabase();
    
    // Mongoose bağlantısı üzerinden veritabanına erişim
    const db = mongoose.connection.db!;
    
    // MongoDB ObjectId formatını kontrol et
    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      throw ApiError.badRequest('Geçersiz Bot ID formatı');
    }
    
    // Bot güncelleme şeması
    const updateBotSchema = z.object({
      name: z.string().min(3, 'Bot adı en az 3 karakter olmalıdır').optional(),
      description: z.string().min(10, 'Bot açıklaması en az 10 karakter olmalıdır').optional(),
      websiteUrl: z.string().url('Geçerli bir URL giriniz').optional(),
      prompt: z.string().min(20, 'Prompt en az 20 karakter olmalıdır').optional(),
      status: z.enum(['online', 'offline', 'maintenance']).optional(),
      primaryColor: z.string().regex(/^#([0-9A-F]{6})$/i, 'Geçerli bir HEX renk kodu giriniz').optional(),
      fontFamily: z.string().optional(),
    });
    
    // İstek gövdesini doğrula
    const body = await request.json();
    const validationResult = updateBotSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw ApiError.badRequest('Geçersiz bot bilgileri', validationResult.error.format());
    }
    
    // Oturum bilgilerini al (middleware tarafından yapılıyor)
    const session = request.headers.get('session');
    if (!session) {
      throw ApiError.unauthorized();
    }
    
    const userId = JSON.parse(session).user.id;
    
    // Botun varlığını ve sahipliğini kontrol et
    const existingBot = await db.collection('bots').findOne({ 
      _id: objectId,
      userId: userId
    });
    
    if (!existingBot) {
      throw ApiError.notFound('Bot bulunamadı');
    }
    
    // Güncelleme nesnesi oluştur
    const updateData = {
      ...validationResult.data,
      updatedAt: new Date()
    };
    
    // Özel alanları düzenle
    if (updateData.primaryColor) {
      updateData['stylingOptions.primaryColor'] = updateData.primaryColor;
      delete updateData.primaryColor;
    }
    
    if (updateData.fontFamily) {
      updateData['stylingOptions.fontFamily'] = updateData.fontFamily;
      delete updateData.fontFamily;
    }
    
    // Botu güncelle
    const result = await db.collection('bots').updateOne(
      { _id: objectId, userId: userId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      throw ApiError.notFound('Bot bulunamadı');
    }
    
    logger.info(`Bot güncellendi: ${existingBot.name}`, {
      context: 'BOT_UPDATE',
      data: { botId: params.id, userId, changes: Object.keys(updateData) }
    });
    
    // Güncellenmiş botu al
    const updatedBot = await db.collection('bots').findOne({ _id: objectId });
    
    return NextResponse.json({ 
      message: 'Bot başarıyla güncellendi',
      bot: updatedBot
    });
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error(`Bot güncellenirken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, {
      context: 'BOT_UPDATE',
      data: { botId: params?.id, error }
    });
    
    throw ApiError.internal('Bot güncellenirken bir hata oluştu');
  }
}

/**
 * @swagger
 * /bots/{id}:
 *   delete:
 *     summary: Bot sil
 *     description: Belirli bir botu siler
 *     tags:
 *       - Bots
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bot ID
 *     responses:
 *       200:
 *         description: Bot başarıyla silindi
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Bot bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
async function handleDeleteRequest(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      throw ApiError.badRequest('Bot ID gereklidir');
    }
    
    // Veritabanına bağlan
    await connectToDatabase();
    
    // Mongoose bağlantısı üzerinden veritabanına erişim
    const db = mongoose.connection.db!;
    
    // MongoDB ObjectId formatını kontrol et
    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      throw ApiError.badRequest('Geçersiz Bot ID formatı');
    }
    
    // Oturum bilgilerini al (middleware tarafından yapılıyor)
    const session = request.headers.get('session');
    if (!session) {
      throw ApiError.unauthorized();
    }
    
    const userId = JSON.parse(session).user.id;
    
    // Botun varlığını ve sahipliğini kontrol et
    const existingBot = await db.collection('bots').findOne({ 
      _id: objectId,
      userId: userId
    });
    
    if (!existingBot) {
      throw ApiError.notFound('Bot bulunamadı');
    }
    
    // Botu sil
    const result = await db.collection('bots').deleteOne({
      _id: objectId,
      userId: userId
    });
    
    if (result.deletedCount === 0) {
      throw ApiError.notFound('Bot bulunamadı');
    }
    
    logger.info(`Bot silindi: ${existingBot.name}`, {
      context: 'BOT_DELETE',
      data: { botId: params.id, userId }
    });
    
    // İlişkili konuşmaları da sil (isteğe bağlı)
    await db.collection('conversations').deleteMany({
      botId: params.id
    });
    
    return NextResponse.json({ 
      message: 'Bot ve ilişkili tüm veriler başarıyla silindi'
    });
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error(`Bot silinirken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, {
      context: 'BOT_DELETE',
      data: { botId: params?.id, error }
    });
    
    throw ApiError.internal('Bot silinirken bir hata oluştu');
  }
}

// GET isteklerini işle
export const GET = withAuthApi(
  async (req: NextRequest) => {
    const path = new URL(req.url).pathname;
    const idMatch = path.match(/\/bots\/([^\/]+)$/);
    const id = idMatch ? idMatch[1] : null;
    
    if (!id) {
      throw ApiError.badRequest('Bot ID gereklidir');
    }
    
    return await handleGetRequest(req, { params: { id } });
  }, 
  { 
    rateLimit: 100,
    cacheSeconds: 60, // 1 dakika önbellekleme
    version: 'v1'
  }
);

// PUT isteklerini işle
export const PUT = withAuthApi(
  async (req: NextRequest) => {
    const path = new URL(req.url).pathname;
    const idMatch = path.match(/\/bots\/([^\/]+)$/);
    const id = idMatch ? idMatch[1] : null;
    
    if (!id) {
      throw ApiError.badRequest('Bot ID gereklidir');
    }
    
    return await handlePutRequest(req, { params: { id } });
  }, 
  { 
    rateLimit: 30,
    version: 'v1'
  }
);

// DELETE isteklerini işle
export const DELETE = withAuthApi(
  async (req: NextRequest) => {
    const path = new URL(req.url).pathname;
    const idMatch = path.match(/\/bots\/([^\/]+)$/);
    const id = idMatch ? idMatch[1] : null;
    
    if (!id) {
      throw ApiError.badRequest('Bot ID gereklidir');
    }
    
    return await handleDeleteRequest(req, { params: { id } });
  }, 
  { 
    rateLimit: 10,
    version: 'v1'
  }
); 