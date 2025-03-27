import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Conversation, Bot } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth/options';

interface ConversationDocument {
  _id?: any;
  botId?: any;
  userId: string;
  userName?: string;
  lastMessage?: string;
  lastActivity?: Date;
  createdAt?: Date;
  messageCount?: number;
}

interface BotDocument {
  _id?: any;
  name?: string;
}

export async function GET() {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // MongoDB'ye bağlan
    await connectDB();
    
    // Son 10 konuşmayı al, tarihe göre sırala
    const recentConversations = await Conversation.find({
      userId: session.user.id
    })
    .sort({ lastActivity: -1 })
    .limit(10)
    .lean() as unknown as ConversationDocument[];
    
    // Bot detaylarını çek ve son konuşmalara ekle
    const botIds = [...new Set(recentConversations
      .filter(conv => conv.botId)
      .map(conv => conv.botId.toString()))];
    
    const bots = await Bot.find({
      _id: { $in: botIds }
    }).lean() as unknown as BotDocument[];
    
    // Bot bilgilerini konuşmalarla birleştir
    const formattedConversations = recentConversations.map(conv => {
      const botId = conv.botId ? conv.botId.toString() : '';
      const bot = bots.find(b => b._id && b._id.toString() === botId);
      
      return {
        id: conv._id ? conv._id.toString() : '',
        user: conv.userName || 'Anonim Kullanıcı',
        lastMessage: conv.lastMessage || '',
        timestamp: conv.lastActivity || conv.createdAt,
        botId: botId,
        botName: bot?.name || 'Silinmiş Bot',
        messageCount: conv.messageCount || 0
      };
    });
    
    return NextResponse.json({
      conversations: formattedConversations,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Son konuşmalar alınırken hata:', error);
    return NextResponse.json(
      { error: 'Son konuşmalar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 