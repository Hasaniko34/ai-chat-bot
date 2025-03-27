import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Conversation, Bot, User } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth/options';

interface ConversationDocument {
  _id: any;
  botId: string;
  userId: string;
  visitorName?: string;
  messages?: {
    role: string;
    content: string;
    timestamp: Date;
  }[];
  startedAt: Date;
  lastMessageAt?: Date;
  endedAt?: Date;
  isResolved: boolean;
  rating?: {
    score?: number;
    feedback?: string;
  };
  metadata?: {
    referer?: string;
    device?: string;
    userName?: string;
    userImage?: string;
    [key: string]: any;
  };
}

interface BotDocument {
  _id: any;
  name: string;
  icon?: string;
  greeting?: string;
}

// Tüm konuşmaları getir (filtreli)
export async function GET(req: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Veritabanına bağlan
    await connectDB();

    // URL parametrelerini al
    const url = new URL(req.url);
    const botId = url.searchParams.get('botId');
    const searchQuery = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const satisfaction = url.searchParams.get('satisfaction'); // positive, neutral, negative
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const sortBy = url.searchParams.get('sortBy') || 'lastMessageAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const skip = (page - 1) * limit;

    // Filtreleme koşullarını oluştur
    const query: any = {
      userId: session.user.id, // Sadece kullanıcının kendi konuşmalarını göster
    };
    
    if (botId && botId !== 'all') query.botId = botId;
    
    // Metin araması
    if (searchQuery) {
      query.$or = [
        { 'messages.content': { $regex: searchQuery, $options: 'i' } },
        { 'visitorName': { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    // Durum filtresi
    if (status && status !== 'all') {
      switch (status) {
        case 'completed':
          query.isResolved = true;
          break;
        case 'ongoing':
          query.isResolved = false;
          query.endedAt = { $exists: false };
          break;
        case 'abandoned':
          query.isResolved = false;
          query.endedAt = { $exists: true };
          break;
      }
    }
    
    // Tarih filtresi
    if (dateFrom || dateTo) {
      query.startedAt = {};
      if (dateFrom) query.startedAt.$gte = new Date(dateFrom);
      if (dateTo) query.startedAt.$lte = new Date(dateTo);
    }
    
    // Memnuniyet filtresi
    if (satisfaction && satisfaction !== 'all') {
      if (satisfaction === 'positive') {
        query['rating.score'] = { $gte: 4 };
      } else if (satisfaction === 'neutral') {
        query['rating.score'] = { $in: [2, 3] };
      } else if (satisfaction === 'negative') {
        query['rating.score'] = { $lte: 1 };
      }
    }

    // Sıralama seçeneklerini ayarla
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Konuşmaları getir
    const conversations = await Conversation.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean() as unknown as ConversationDocument[];

    // Toplam konuşma sayısını getir
    const total = await Conversation.countDocuments(query);
    
    // Bot detaylarını getir
    const botIds = [...new Set(conversations.map(conv => conv.botId))];
    const bots = await Bot.find({ _id: { $in: botIds } }).lean() as unknown as BotDocument[];
    
    // Formatlanmış konuşmaları oluştur
    const formattedConversations = conversations.map(conv => {
      const bot = bots.find(b => b._id.toString() === conv.botId);
      const messageCount = conv.messages?.length || 0;
      const firstMessage = conv.messages?.[0];
      const lastMessage = conv.messages?.[messageCount - 1];
      
      // Konuşma durumunu belirle
      let status: 'completed' | 'ongoing' | 'abandoned' = 'ongoing';
      if (conv.isResolved) {
        status = 'completed';
      } else if (conv.endedAt) {
        status = 'abandoned';
      }
      
      // Memnuniyet durumunu belirle
      let satisfaction: 'positive' | 'neutral' | 'negative' | null = null;
      if (conv.rating?.score) {
        if (conv.rating.score >= 4) {
          satisfaction = 'positive';
        } else if (conv.rating.score >= 2) {
          satisfaction = 'neutral';
        } else {
          satisfaction = 'negative';
        }
      }
      
      // Konuşma süresini hesapla (saniye cinsinden)
      const startTime = new Date(conv.startedAt).getTime();
      const endTime = conv.endedAt 
        ? new Date(conv.endedAt).getTime() 
        : conv.lastMessageAt 
          ? new Date(conv.lastMessageAt).getTime() 
          : Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);
      
      // Etiketleri oluştur
      const tags: string[] = [];
      if (conv.metadata?.referer) tags.push('web');
      if (conv.metadata?.device === 'mobile') tags.push('mobil');
      if (conv.isResolved) tags.push('çözüldü');
      if (messageCount > 20) tags.push('uzun-konuşma');
      if (duration < 60) tags.push('kısa-konuşma');
      
      return {
        id: conv._id.toString(),
        botId: conv.botId,
        botName: bot?.name || 'Silinmiş Bot',
        botIcon: bot?.icon || '🤖',
        userId: conv.userId,
        userName: conv.visitorName || conv.metadata?.userName || 'Anonim Kullanıcı',
        userImageUrl: conv.metadata?.userImage,
        startedAt: conv.startedAt.toISOString(),
        endedAt: conv.endedAt?.toISOString(),
        status,
        messageCount,
        duration,
        satisfaction,
        resolutionSuccess: conv.isResolved,
        tags,
        preview: firstMessage?.content || ''
      };
    });

    return NextResponse.json({
      conversations: formattedConversations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      filters: {
        bots: bots.map(b => ({ 
          id: b._id.toString(), 
          name: b.name, 
          icon: b.icon 
        }))
      }
    });
  } catch (error) {
    console.error('Konuşmalar getirilemedi:', error);
    return NextResponse.json(
      { error: 'Konuşmalar getirilemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Yeni konuşma oluştur
export async function POST(req: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Veritabanına bağlan
    await connectDB();

    // İstek gövdesini al
    const body = await req.json();

    // Botun varlığını kontrol et
    const bot = await Bot.findById(body.botId);
    if (!bot) {
      return NextResponse.json(
        { error: 'Belirtilen bot bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcı bilgisini ekle
    body.userId = session.user.id;
    body.startedAt = new Date();
    
    // Konuşmayı oluştur
    const conversation = await Conversation.create(body);
    
    // Bot sayaçlarını güncelle
    await Bot.updateOne(
      { _id: body.botId },
      { $inc: { conversations: 1 } }
    );
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Konuşma oluşturulamadı:', error);
    return NextResponse.json(
      { error: 'Konuşma oluşturulamadı', details: (error as Error).message },
      { status: 500 }
    );
  }
} 