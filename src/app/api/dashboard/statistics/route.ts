import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Bot, Conversation } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth/options';

export async function GET() {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // MongoDB'ye bağlan
    await connectDB();
    
    // Toplam bot sayısını al
    const totalBots = await Bot.countDocuments({
      userId: session.user.id
    });
    
    // Toplam konuşma sayısını al
    const totalConversations = await Conversation.countDocuments({
      userId: session.user.id
    });
    
    // Toplam mesaj sayısını al - Konuşma modelindeki mesajSayısı alanını topla
    const conversationsWithMessages = await Conversation.find({
      userId: session.user.id
    }).select('messageCount');
    
    const totalMessages = conversationsWithMessages.reduce(
      (total, conv) => total + (conv.messageCount || 0), 
      0
    );
    
    // Aktif ziyaretçi sayısı - son 15 dakika içinde aktif olanlar
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeVisitors = await Conversation.countDocuments({
      userId: session.user.id,
      lastActivity: { $gte: fifteenMinutesAgo }
    });
    
    return NextResponse.json({
      totalBots,
      totalConversations,
      totalMessages,
      activeVisitors,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('İstatistik verileri alınırken hata:', error);
    return NextResponse.json(
      { error: 'İstatistik verileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 