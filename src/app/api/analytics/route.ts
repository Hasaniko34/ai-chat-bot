import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectToDatabase from '@/lib/db/mongoose';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

// Analitikler API endpoint'i
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
    const range = searchParams.get('range') || 'month';
    
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
      case 'year':
        startDate.setDate(startDate.getDate() - 365);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Kullanıcının botlarını al
    const userBots = await db.collection('bots').find({ 
      userId: userId
    }).toArray();
    
    const botIds = userBots.map(bot => bot._id);
    
    // Konuşmaları al
    const conversations = await db.collection('conversations').find({
      botId: { $in: botIds.map(id => id.toString()) },
      createdAt: { $gte: startDate }
    }).toArray();
    
    // Mesaj sayısı
    const messages = await db.collection('messages').find({
      conversationId: { $in: conversations.map(c => c._id.toString()) }
    }).toArray();
    
    // Günlük konuşma ve mesaj istatistiklerini hesapla
    const dailyStats = calculateDailyStats(conversations, messages, range);
    
    // En çok sorulan soruları hesapla
    const topQuestions = calculateTopQuestions(messages);
    
    // Saatlik kullanım istatistiklerini hesapla
    const hourlyUsers = calculateHourlyUsers(conversations);
    
    // Ortalama oturum süresini hesapla
    const avgSessionTime = calculateAverageSessionTime(conversations);
    
    // Başarı oranını hesapla
    const successRate = calculateSuccessRate(conversations);
    
    // Analitik verilerini döndür
    return NextResponse.json({
      totalConversations: conversations.length,
      totalMessages: messages.length,
      avgSessionTime,
      successRate,
      dailyConversations: dailyStats.conversations,
      dailyMessages: dailyStats.messages,
      hourlyUsers,
      topQuestions
    });
    
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Analitik verileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Günlük konuşma ve mesaj istatistiklerini hesaplayan yardımcı fonksiyon
function calculateDailyStats(conversations: any[], messages: any[], range: string) {
  const days = range === 'week' ? 7 : range === 'year' ? 365 : 30;
  const result = {
    conversations: Array(days).fill(0),
    messages: Array(days).fill(0)
  };
  
  const now = new Date();
  
  // Konuşma sayılarını hesapla
  conversations.forEach(conversation => {
    const conversationDate = new Date(conversation.createdAt);
    const dayDiff = Math.floor((now.getTime() - conversationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff >= 0 && dayDiff < days) {
      // Dizideki indeks güncel günden geriye doğru
      // (son eleman en son günü temsil eder)
      const index = days - 1 - dayDiff;
      result.conversations[index]++;
    }
  });
  
  // Mesaj sayılarını hesapla
  messages.forEach(message => {
    const messageDate = new Date(message.createdAt);
    const dayDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff >= 0 && dayDiff < days) {
      const index = days - 1 - dayDiff;
      result.messages[index]++;
    }
  });
  
  // İstenilen gün sayısına göre kesme (son x gün)
  if (range === 'month') {
    // Aylık görünüm için 15 gün gösterelim
    return {
      conversations: result.conversations.slice(-15),
      messages: result.messages.slice(-15)
    };
  }
  
  return result;
}

// En çok sorulan soruları hesaplayan yardımcı fonksiyon
function calculateTopQuestions(messages: any[]) {
  // Sadece kullanıcıdan gelen mesajları filtrele
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  // Soruları say
  const questionCounts: Record<string, number> = {};
  userMessages.forEach(message => {
    const content = message.content;
    if (!questionCounts[content]) {
      questionCounts[content] = 0;
    }
    questionCounts[content]++;
  });
  
  // En çok sorulan 5 soruyu dön
  return Object.entries(questionCounts)
    .map(([question, count]) => ({ question, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Saatlik kullanıcı sayısını hesaplayan yardımcı fonksiyon
function calculateHourlyUsers(conversations: any[]) {
  const hourlyCount = Array(24).fill(0);
  
  conversations.forEach(conversation => {
    const date = new Date(conversation.createdAt);
    const hour = date.getHours();
    hourlyCount[hour]++;
  });
  
  return hourlyCount;
}

// Ortalama oturum süresini hesaplayan yardımcı fonksiyon
function calculateAverageSessionTime(conversations: any[]) {
  if (!conversations.length) return '0:00';
  
  let totalSeconds = 0;
  let validSessions = 0;
  
  conversations.forEach(conversation => {
    // createdAt ve updatedAt arasındaki fark (saniye cinsinden)
    if (conversation.createdAt && conversation.updatedAt) {
      const start = new Date(conversation.createdAt).getTime();
      const end = new Date(conversation.updatedAt).getTime();
      
      // Sadece geçerli zaman farkı olan konuşmaları say
      if (end > start) {
        const sessionSeconds = Math.floor((end - start) / 1000);
        totalSeconds += sessionSeconds;
        validSessions++;
      }
    }
  });
  
  if (validSessions === 0) return '0:00';
  
  // Ortalama saniye
  const avgSeconds = Math.floor(totalSeconds / validSessions);
  
  // Dakika ve saniye formatına dönüştür
  const minutes = Math.floor(avgSeconds / 60);
  const seconds = avgSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Başarı oranını hesaplayan yardımcı fonksiyon
function calculateSuccessRate(conversations: any[]) {
  if (!conversations.length) return 0;
  
  // Başarılı konuşma sayısı (örneğin, status alanı 'completed' olanlar)
  const successfulConversations = conversations.filter(c => 
    c.status === 'completed' || c.feedback === 'positive'
  );
  
  // Başarı oranı
  const rate = (successfulConversations.length / conversations.length) * 100;
  
  return Math.round(rate);
} 