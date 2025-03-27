import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectToDatabase from '@/lib/db/mongoose';
import mongoose from 'mongoose';

// Ziyaretçiler API endpoint'i
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

    // URL'den tarih aralığını al
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'all';
    
    // Veritabanına bağlan
    await connectToDatabase();
    
    // Mongoose bağlantısı üzerinden veritabanına erişim
    const db = mongoose.connection.db!;
    
    // Kullanıcı ID'sini al
    const userId = session.user.id;
    
    // Tarih aralığına göre filtreleme için başlangıç tarihini belirle
    const startDate = new Date();
    switch (range) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        // 'all' durumunda 1 yıl öncesine git (tüm kayıtlar için yeterli olacaktır)
        startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    // Kullanıcının botlarını al
    const userBots = await db.collection('bots').find({ 
      userId: userId
    }).toArray();
    
    const botIds = userBots.map(bot => bot._id.toString());
    
    // Ziyaretçi verilerini al
    // Bu verilerin yapısı veritabanı şemanıza göre değişebilir
    const visitors = await db.collection('visitors').find({
      botId: { $in: botIds },
      lastVisit: { $gte: startDate }
    }).toArray();
    
    // Ziyaretçileri dönüştür ve gerekli hesaplamaları yap
    const processedVisitors = visitors.map(visitor => {
      // Gerekli konuşmaları al
      const visitorConversations = visitor.conversations || [];
      
      // Toplam ziyaret süresini hesapla
      const totalTimeSpent = visitorConversations.reduce((total, conv) => {
        // createdAt ve updatedAt arasındaki fark (saniye cinsinden)
        if (conv.createdAt && conv.updatedAt) {
          const start = new Date(conv.createdAt).getTime();
          const end = new Date(conv.updatedAt).getTime();
          
          if (end > start) {
            return total + Math.floor((end - start) / 1000);
          }
        }
        return total;
      }, 0);
      
      // Dönüştürülmüş ziyaretçi verisi
      return {
        id: visitor._id.toString(),
        ip: visitor.ip || 'Bilinmiyor',
        country: visitor.country || 'Bilinmiyor',
        city: visitor.city || 'Bilinmiyor',
        deviceType: visitor.deviceType || 'desktop',
        browser: visitor.browser || 'Bilinmiyor',
        os: visitor.os || 'Bilinmiyor',
        firstVisit: visitor.firstVisit || visitor.createdAt,
        lastVisit: visitor.lastVisit || visitor.updatedAt,
        visits: visitor.visits || 1,
        conversations: visitorConversations.length,
        totalTimeSpent,
        source: visitor.source || 'direct',
        pagesViewed: visitor.pagesViewed || [],
        referrer: visitor.referrer
      };
    });
    
    // İstatistik verileri
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newVisitorsToday = visitors.filter(v => {
      const firstVisit = new Date(v.firstVisit || v.createdAt);
      firstVisit.setHours(0, 0, 0, 0);
      return firstVisit.getTime() === today.getTime();
    }).length;
    
    const totalVisits = visitors.reduce((sum, v) => sum + (v.visits || 1), 0);
    
    const conversionsRate = visitors.length > 0 
      ? Math.round((visitors.filter(v => v.conversations?.length > 0).length / visitors.length) * 100)
      : 0;
    
    // Bir hafta önceki ziyaretçi sayısı
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastWeekVisitors = await db.collection('visitors').countDocuments({
      botId: { $in: botIds },
      lastVisit: { $gte: lastWeek, $lt: startDate }
    });
    
    // Büyüme oranı hesapla
    const currentVisitorsCount = visitors.length;
    const growthRate = lastWeekVisitors > 0 
      ? Math.round(((currentVisitorsCount - lastWeekVisitors) / lastWeekVisitors) * 100)
      : 100; // Önceki dönemde hiç ziyaretçi yoksa %100 büyüme
    
    // Sonuçları döndür
    return NextResponse.json({
      visitors: processedVisitors,
      stats: {
        totalVisitors: visitors.length,
        newVisitorsToday,
        totalVisits,
        conversionsRate,
        growthRate
      }
    });
    
  } catch (error) {
    console.error('Visitors API Error:', error);
    return NextResponse.json(
      { error: 'Ziyaretçi verileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 