import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import { Bot, Conversation, BotStatistics } from '@/lib/db/models';

// Bir botu getir
export async function GET(request: Request) {
  try {
    // URL'den parametre al
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    // Veritabanına bağlan
    await connectToDatabase();

    console.log("API - Bot ID:", id);

    // Botu bul
    const bot = await Bot.findById(id).lean();
    console.log("API - Bot bulundu mu:", !!bot);

    if (!bot) {
      console.log("API - Bot bulunamadı!");
      return NextResponse.json(
        { error: 'Bot bulunamadı' },
        { status: 404 }
      );
    }

    // "bot" anahtarı ile kapsamak widget sayfası ile uyum sağlar
    return NextResponse.json({ bot });
  } catch (error) {
    console.error('Bot getirilemedi:', error);
    return NextResponse.json(
      { error: 'Bot getirilemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Bir botu güncelle
export async function PUT(request: Request) {
  try {
    // URL'den parametre al
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    // Veritabanına bağlan
    await connectToDatabase();

    const body = await request.json();

    // Botu bul ve güncelle
    const updatedBot = await Bot.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedBot) {
      return NextResponse.json(
        { error: 'Bot bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBot);
  } catch (error) {
    console.error('Bot güncellenemedi:', error);
    return NextResponse.json(
      { error: 'Bot güncellenemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Bir botu sil
export async function DELETE(request: Request) {
  try {
    // URL'den parametre al
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    // Veritabanına bağlan
    await connectToDatabase();

    // Botu bul ve sil
    const deletedBot = await Bot.findByIdAndDelete(id);

    if (!deletedBot) {
      return NextResponse.json(
        { error: 'Bot bulunamadı' },
        { status: 404 }
      );
    }

    // Bununla ilişkili tüm konuşmaları ve istatistikleri sil
    await Promise.all([
      Conversation.deleteMany({ botId: id }),
      BotStatistics.deleteMany({ botId: id }),
    ]);

    return NextResponse.json({ success: true, message: 'Bot başarıyla silindi' });
  } catch (error) {
    console.error('Bot silinemedi:', error);
    return NextResponse.json(
      { error: 'Bot silinemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
} 