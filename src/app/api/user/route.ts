import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/user';
import mongoose from 'mongoose';

// Kullanıcı bilgilerini getir
export async function GET(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      console.error('Yetkisiz erişim girişimi:', JSON.stringify(session, null, 2));
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    // Veritabanına bağlan
    const isConnected = await connectDB();
    if (!isConnected) {
      console.error('Veritabanı bağlantısı başarısız oldu');
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }
    
    // Kullanıcıyı bul (şifre olmadan)
    try {
      const user = await User.findById(session.user.id).select('-password');
      
      if (!user) {
        console.error('Kullanıcı bulunamadı. ID:', session.user.id);
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
      }
      
      // Kullanıcı bilgilerini güvenli bir şekilde döndür
      return NextResponse.json({
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (dbError: any) {
      console.error('Kullanıcı verisi alınırken hata:', dbError);
      return NextResponse.json({ error: 'Kullanıcı verisi alınamadı', details: dbError.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Kullanıcı bilgileri alınırken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınırken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

// Kullanıcı hesabını sil
export async function DELETE(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      console.error('Silme işlemi sırasında yetkilendirme hatası:', JSON.stringify(session, null, 2));
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    console.log('Kullanıcı hesabı siliniyor. User ID:', session.user.id);
    
    // Veritabanına bağlan
    const isConnected = await connectDB();
    if (!isConnected) {
      console.error('Veritabanı bağlantısı başarısız oldu');
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }
    
    try {
      // İlgili botlar koleksiyonunu bul
      try {
        const Bot = mongoose.model('Bot');
        
        try {
          // Kullanıcıya ait botları sil
          const deleteBotsResult = await Bot.deleteMany({ userId: session.user.id });
          console.log(`Silinen bot sayısı: ${deleteBotsResult.deletedCount}`);
        } catch (botError: any) {
          console.error('Botları silerken hata:', botError);
          // Ana silme işlemine devam et
        }
      } catch (modelError) {
        console.error('Bot modeli bulunamadı:', modelError);
        // Model bulunamasa bile ana silme işlemine devam et
      }
      
      // Kullanıcıyı sil
      const deletedUser = await User.findByIdAndDelete(session.user.id);
      
      if (!deletedUser) {
        console.error('Silinecek kullanıcı bulunamadı. ID:', session.user.id);
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
      }
      
      console.log('Kullanıcı başarıyla silindi. ID:', session.user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Hesap başarıyla silindi'
      });
    } catch (dbError: any) {
      console.error('Veritabanından kullanıcı silinirken hata:', dbError);
      return NextResponse.json({ error: 'Kullanıcı silinemedi', details: dbError.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Hesap silinirken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Hesap silinirken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
} 