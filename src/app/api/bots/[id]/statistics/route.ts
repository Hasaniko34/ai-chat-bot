import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Bot from '@/lib/db/models/bot';
import Conversation from '@/lib/db/models/conversation';
import BotStatistics, { IBotStatistics } from '@/lib/db/models/BotStatistics';

// Bot istatistiklerini getir
export async function GET(request: Request) {
  try {
    // URL'den parametre al
    const url = new URL(request.url);
    const id = url.pathname.split('/').filter(Boolean).pop();
    
    // Veritabanına bağlan
    await connectToDatabase();

    const botId = id;

    // Botun varlığını kontrol et
    const bot = await Bot.findById(botId);
    if (!bot) {
      return NextResponse.json(
        { error: 'Bot bulunamadı' },
        { status: 404 }
      );
    }

    // İstatistikleri bul
    let statistics = await BotStatistics.findOne({ botId }).lean();

    // Her seferinde yeniden hesaplama yapacağız
    // Gerçek bir uygulamada cache kullanmak daha uygun olabilir
    const shouldRecalculate = true;
    
    if (shouldRecalculate) {
      // Gerçek verileri veritabanından hesapla
      const totalConversations = await Conversation.countDocuments({ botId });
      
      // Tüm mesajları sayalım
      const allMessages = await Conversation.aggregate([
        { $match: { botId } },
        { $unwind: '$messages' },
        { $group: { _id: '$botId', count: { $sum: 1 } } }
      ]);
      const totalMessages = allMessages.length > 0 ? allMessages[0].count : 0;
      
      // Benzersiz kullanıcı ve ziyaretçileri bul
      const uniqueUsers = await Conversation.distinct('userId', { botId });
      const uniqueVisitors = await Conversation.distinct('visitorId', { botId });
      const totalUniqueUsers = [...new Set([...uniqueUsers, ...uniqueVisitors].filter(Boolean))].length;
      
      // Ortalama mesaj sayısı
      const avgMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0;
      
      // Son 7 günlük konuşma sayıları
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const dailyConversations = await Conversation.aggregate([
        { 
          $match: { 
            botId, 
            createdAt: { $gte: oneWeekAgo } 
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      // Gerçek başarı oranını hesapla (olumlu geri bildirim yüzdesi veya tamamlanmış konuşmalar)
      const completedConversations = await Conversation.countDocuments({ 
        botId, 
        'feedback.rating': { $exists: true } 
      });
      
      const positiveRatings = await Conversation.countDocuments({ 
        botId, 
        'feedback.rating': { $gt: 3 } 
      });
      
      const successRate = completedConversations > 0 
        ? Math.round((positiveRatings / completedConversations) * 100) 
        : 90; // Henüz geri bildirim yoksa %90 göster (varsayılan)
      
      // Güncellenmiş veya yeni istatistik objesi oluştur
      const updatedStats = {
        botId,
        totalConversations,
        totalMessages,
        uniqueUsers: totalUniqueUsers,
        averageMessagesPerConversation: parseFloat(avgMessagesPerConversation.toFixed(2)),
        averageResponseTime: 800, // Varsayılan değer
        successRate,
        feedbackCounts: {
          positive: positiveRatings,
          negative: completedConversations - positiveRatings
        },
        dailyStats: dailyConversations.map(item => ({
          date: item._id,
          conversations: item.count,
          messages: 0,
          uniqueUsers: 0
        })),
        topQueries: [],
        date: new Date()
      };
      
      // İstatistiği güncelle veya oluştur
      if (!statistics) {
        statistics = await BotStatistics.create(updatedStats);
      } else {
        statistics = await BotStatistics.findOneAndUpdate(
          { botId },
          updatedStats,
          { new: true, upsert: true }
        ).lean();
      }
    }

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('İstatistikler getirilemedi:', error);
    return NextResponse.json(
      { error: 'İstatistikler getirilemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Bot istatistiklerini güncelle
export async function PUT(request: Request) {
  try {
    // URL'den parametre al
    const url = new URL(request.url);
    const id = url.pathname.split('/').filter(Boolean).pop();
    
    // Veritabanına bağlan
    await connectToDatabase();

    const botId = id;
    const body = await request.json();

    // Botun varlığını kontrol et
    const bot = await Bot.findById(botId);
    if (!bot) {
      return NextResponse.json(
        { error: 'Bot bulunamadı' },
        { status: 404 }
      );
    }

    // İstatistiği bul veya oluştur
    let statistics = await BotStatistics.findOne({ botId });

    if (!statistics) {
      statistics = new BotStatistics({ 
        botId,
        date: new Date(),
        ...body  
      });
    } else {
      // Güncelleme verilerini ekle
      Object.keys(body).forEach(key => {
        if (key !== 'botId' && key !== '_id') {
          statistics[key] = body[key];
        }
      });
      
      // Güncelleme zamanını ayarla
      statistics.date = new Date();
    }

    // Kaydet
    await statistics.save();

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('İstatistikler güncellenemedi:', error);
    return NextResponse.json(
      { error: 'İstatistikler güncellenemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Bot istatistiklerini güncelle (yeni konuşma veya mesaj eklendiğinde)
export async function POST(request: Request) {
  try {
    // URL'den parametre al
    const url = new URL(request.url);
    const id = url.pathname.split('/').filter(Boolean).pop();
    
    // Veritabanına bağlan
    await connectToDatabase();

    const botId = id;
    const { type } = await request.json();

    // Botun varlığını kontrol et
    const bot = await Bot.findById(botId);
    if (!bot) {
      return NextResponse.json(
        { error: 'Bot bulunamadı' },
        { status: 404 }
      );
    }

    // İstatistiği bul veya oluştur
    let statistics = await BotStatistics.findOne({ botId });

    if (!statistics) {
      // Basit bir istatistik oluşturalım
      statistics = new BotStatistics({ 
        botId,
        totalConversations: type === 'conversation' ? 1 : 0,
        totalMessages: type === 'message' ? 1 : 0,
        uniqueUsers: 1,
        averageMessagesPerConversation: 1,
        averageResponseTime: 800,
        successRate: 90,
        feedbackCounts: {
          positive: 0,
          negative: 0
        },
        dailyStats: [{
          date: new Date().toISOString().split('T')[0],
          conversations: type === 'conversation' ? 1 : 0,
          messages: 0,
          uniqueUsers: 0
        }],
        topQueries: [],
        date: new Date()
      });
    } else {
      // Mevcut istatistiği güncelle
      if (type === 'conversation') {
        statistics.totalConversations = (statistics.totalConversations || 0) + 1;
        
        // Günlük istatistiği güncelle
        const today = new Date().toISOString().split('T')[0];
        const todayStats = statistics.dailyStats?.find(stat => stat.date === today);
        
        if (todayStats) {
          todayStats.conversations += 1;
        } else if (statistics.dailyStats) {
          statistics.dailyStats.push({
            date: today,
            conversations: 1,
            messages: 0,
            uniqueUsers: 0
          });
        }
      } else if (type === 'message') {
        statistics.totalMessages = (statistics.totalMessages || 0) + 1;
      }
    }
    
    // Kaydet
    await statistics.save();

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('İstatistik güncellenemedi:', error);
    return NextResponse.json(
      { error: 'İstatistik güncellenemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
} 