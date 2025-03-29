import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Bot, Conversation } from '@/lib/db/models';

// Belirli bir konuşmayı getir
export async function GET(req: Request) {
  try {
    // URL'den ID'yi çıkar
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const conversationId = pathParts[pathParts.length - 1];
    console.log("Conversation ID:", conversationId);
    
    // Veritabanına bağlan
    await connectToDatabase();

    // Konuşmayı bul
    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) {
      return NextResponse.json(
        { error: 'Konuşma bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Konuşma getirilemedi:', error);
    return NextResponse.json(
      { error: 'Konuşma getirilemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Konuşmaya mesaj ekle
export async function PUT(req: Request) {
  try {
    // URL'den ID'yi çıkar
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const conversationId = pathParts[pathParts.length - 1];
    
    // Veritabanına bağlan
    await connectToDatabase();

    const body = await req.json();

    // Konuşmayı bul
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Konuşma bulunamadı' },
        { status: 404 }
      );
    }
    
    // Yeni mesajlar ekle
    if (body.messages && Array.isArray(body.messages)) {
      const now = new Date();
      
      body.messages.forEach((message: any) => {
        conversation.messages.push({
          ...message,
          timestamp: message.timestamp || now
        });
      });
      
      // Son mesaj zamanını güncelle
      conversation.lastMessageAt = now;
    }
    
    // Diğer alanları güncelle
    if (body.isResolved !== undefined) {
      conversation.isResolved = body.isResolved;
    }
    
    if (body.rating) {
      conversation.rating = {
        ...conversation.rating,
        ...body.rating
      };
    }
    
    // Konuşmayı kaydet
    await conversation.save();
    
    // Bot istatistiklerini güncelle
    if (body.messages && body.messages.length > 0) {
      await Bot.findByIdAndUpdate(conversation.botId, {
        $inc: { messages: body.messages.length }
      });
    }
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Konuşma güncellenemedi:', error);
    return NextResponse.json(
      { error: 'Konuşma güncellenemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Konuşmayı sil
export async function DELETE(req: Request) {
  try {
    // URL'den ID'yi çıkar
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const conversationId = pathParts[pathParts.length - 1];
    
    // Veritabanına bağlan
    await connectToDatabase();

    // Konuşmayı bul ve sil
    const deletedConversation = await Conversation.findByIdAndDelete(conversationId);

    if (!deletedConversation) {
      return NextResponse.json(
        { error: 'Konuşma bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Konuşma başarıyla silindi' });
  } catch (error) {
    console.error('Konuşma silinemedi:', error);
    return NextResponse.json(
      { error: 'Konuşma silinemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
} 