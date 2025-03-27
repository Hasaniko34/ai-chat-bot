import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/user';
import { Bot } from '@/lib/db/models';

// Kullanıcı bilgilerini getir
export async function GET(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    // Veritabanına bağlan
    await connectDB();
    
    // Kullanıcıyı bul (şifre olmadan)
    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
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
    
  } catch (error) {
    console.error('Kullanıcı bilgileri alınırken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kullanıcı hesabını sil
export async function DELETE(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    // Veritabanına bağlan
    await connectDB();
    
    // Kullanıcıya ait botları sil
    await Bot.deleteMany({ userId: session.user.id });
    
    // Kullanıcıyı sil
    const deletedUser = await User.findByIdAndDelete(session.user.id);
    
    if (!deletedUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Hesap başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Hesap silinirken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Hesap silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 