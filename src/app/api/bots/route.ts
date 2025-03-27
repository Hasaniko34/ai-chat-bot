import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectToDatabase from '@/lib/db/mongoose';
import mongoose from 'mongoose';
import { z } from 'zod';

// Bot şema doğrulaması
const botSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  websiteUrl: z.string().url(),
  prompt: z.string().min(20),
  primaryColor: z.string().regex(/^#([0-9A-F]{6})$/i).default('#4338ca'),
  fontFamily: z.string().default('Inter, sans-serif'),
});

export async function POST(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Bu işlem için giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    // Veritabanına bağlan
    await connectToDatabase();
    
    // Mongoose bağlantısı üzerinden veritabanına erişim
    const db = mongoose.connection.db!;
    
    // İstek gövdesini doğrula
    const body = await req.json();
    const validationResult = botSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Geçersiz bot bilgileri', errors: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const {
      name,
      description,
      websiteUrl,
      prompt,
      primaryColor,
      fontFamily,
    } = validationResult.data;
    
    // Bot adının benzersiz olduğunu kontrol et
    const existingBot = await db.collection('bots').findOne({ 
      name, 
      userId: session.user.id 
    });
    
    if (existingBot) {
      return NextResponse.json(
        { message: 'Bu isimle bir bot zaten mevcut' },
        { status: 400 }
      );
    }
    
    // Yeni bot oluştur
    const newBot = await db.collection('bots').insertOne({
      name,
      description,
      websiteUrl,
      prompt,
      userId: session.user.id,
      stylingOptions: {
        primaryColor,
        fontFamily,
      },
      createdAt: new Date(),
      updatedAt: new Date()
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
          userId: session.user.id,
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
    console.error('Bot oluşturma hatası:', error);
    return NextResponse.json(
      { message: 'Bot oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    // Veritabanına bağlan
    await connectToDatabase();
    
    // Mongoose bağlantısı üzerinden veritabanına erişim
    const db = mongoose.connection.db!;
    
    // Kullanıcı ID'sini al
    const userId = session.user.id;
    
    // URL'den parametre kontrolü
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';
    
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
    
    return NextResponse.json({ bots });
    
  } catch (error) {
    console.error('Bots API Error:', error);
    return NextResponse.json(
      { error: 'Botlar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 