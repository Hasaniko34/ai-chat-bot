import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Bot, Conversation } from '@/lib/db/models';
import generateChatResponse from '@/lib/gemini';

export async function GET(req: NextRequest) {
  try {
    // URL'den API key'i çıkar
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const apiKey = pathParts[pathParts.length - 1];
    
    // Veritabanına bağlan
    await connectToDatabase();
    
    // API key ile botu bul
    const bot = await Bot.findOne({ apiKey });
    
    if (!bot) {
      return NextResponse.json(
        { message: 'Geçersiz API anahtarı' },
        { status: 404 }
      );
    }
    
    // Bot bilgilerini temizle ve döndür (API key gibi hassas bilgileri çıkar)
    const botConfig = {
      id: bot._id,
      name: bot.name,
      description: bot.description,
      stylingOptions: bot.stylingOptions,
    };
    
    return NextResponse.json({ bot: botConfig });
    
  } catch (error) {
    console.error('Widget yapılandırma hatası:', error);
    return NextResponse.json(
      { message: 'Widget yapılandırması alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // URL'den API key'i çıkar
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const apiKey = pathParts[pathParts.length - 1];
    
    // Veritabanına bağlan
    await connectToDatabase();
    
    // API key ile botu bul
    const bot = await Bot.findOne({ apiKey });
    
    if (!bot) {
      return NextResponse.json(
        { message: 'Geçersiz API anahtarı' },
        { status: 404 }
      );
    }
    
    // İstek gövdesini al
    const body = await req.json();
    const { message, conversationId } = body;
    
    if (!message) {
      return NextResponse.json(
        { message: 'Mesaj alanı gereklidir' },
        { status: 400 }
      );
    }
    
    // Ziyaretçi bilgilerini al
    const userAgent = req.headers.get('user-agent');
    const referer = req.headers.get('referer');
    const ip = req.headers.get('x-forwarded-for') || 'bilinmeyen';
    
    let conversation;
    
    // Konuşma ID'si varsa mevcut konuşmayı getir, yoksa yeni konuşma oluştur
    if (conversationId) {
      conversation = await Conversation.findOne({ 
        _id: conversationId,
        botId: bot._id
      });
      
      if (!conversation) {
        return NextResponse.json(
          { message: 'Konuşma bulunamadı' },
          { status: 404 }
        );
      }
    } else {
      // Yeni konuşma oluştur
      conversation = await Conversation.create({
        botId: bot._id,
        messages: [],
        visitorInfo: {
          ip,
          userAgent,
          referer
        }
      });
    }
    
    // Kullanıcı mesajını konuşmaya ekle
    conversation.messages.push({
      content: message,
      role: 'user',
      createdAt: new Date()
    });
    
    // Chatbot yanıtı oluştur
    const chatHistory = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Son eklenen kullanıcı mesajını chatHistory'den çıkar 
    // çünkü onu ayrıca prompt olarak göndereceğiz
    const promptMessage = chatHistory.pop();
    
    // Gemini API ile yanıt oluştur
    const response = await generateChatResponse(
      promptMessage!.content,
      chatHistory,
      bot.prompt
    );
    
    // Botun yanıtını konuşmaya ekle
    conversation.messages.push({
      content: response.text,
      role: 'assistant',
      createdAt: new Date()
    });
    
    // Konuşmayı kaydet
    await conversation.save();
    
    return NextResponse.json({
      message: response.text,
      conversationId: conversation._id
    });
    
  } catch (error) {
    console.error('Chatbot yanıt hatası:', error);
    return NextResponse.json(
      { message: 'Chatbot yanıtı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 