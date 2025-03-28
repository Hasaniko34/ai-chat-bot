import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/user';

// Varsayılan ayarlar
const defaultSettings = {
  appearance: {
    theme: 'system',
    colorScheme: 'indigo',
    fontSize: 'medium',
    reduceAnimations: false,
    borderRadius: 'medium',
  },
  language: 'tr',
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    marketingEmails: false,
    monthlyNewsletter: true,
    chatbotUpdates: true,
  },
  privacy: {
    collectAnalytics: true,
    shareUsageData: false,
    cookiePreferences: 'necessary',
  },
  sessions: {
    autoLogout: '30',
    sessionTimeout: '60',
  }
};

// Kullanıcı ayarlarını getir
export async function GET(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      console.error('Oturum bulunamadı veya kullanıcı ID yok:', JSON.stringify(session, null, 2));
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    // Veritabanına bağlan
    const isConnected = await connectDB();
    if (!isConnected) {
      console.error('Veritabanı bağlantısı başarısız oldu');
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }
    
    console.log('Kullanıcı ayarları aranıyor. User ID:', session.user.id);
    
    // Kullanıcıyı bul
    const user = await User.findById(session.user.id);
    
    if (!user) {
      console.error('Kullanıcı bulunamadı. ID:', session.user.id);
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    console.log('Kullanıcı bulundu, ayarlar kontrol ediliyor...');
    
    // Kullanıcının ayarlarını döndür (yoksa varsayılan ayarları döndür)
    return NextResponse.json({
      settings: user.settings || defaultSettings
    });
    
  } catch (error) {
    console.error('Ayarlar alınırken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Ayarlar alınırken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

// Kullanıcı ayarlarını güncelle
export async function PUT(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      console.error('Oturum bulunamadı veya kullanıcı ID yok:', JSON.stringify(session, null, 2));
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    // İstek gövdesini doğrula
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('İstek gövdesi JSON olarak ayrıştırılamadı:', e);
      return NextResponse.json({ error: 'Geçersiz istek formatı' }, { status: 400 });
    }
    
    if (!body.settings) {
      console.error('İstek gövdesinde settings alanı yok:', body);
      return NextResponse.json(
        { error: 'Ayarlar gerekli bir alandır' },
        { status: 400 }
      );
    }
    
    console.log('Ayarlar güncelleniyor. User ID:', session.user.id);
    
    // Veritabanına bağlan
    const isConnected = await connectDB();
    if (!isConnected) {
      console.error('Veritabanı bağlantısı başarısız oldu');
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }
    
    try {
      // Kullanıcıyı bul ve doğrudan güncelle
      const result = await User.findByIdAndUpdate(
        session.user.id,
        { $set: { settings: body.settings } },
        { new: true, runValidators: false }
      );
      
      if (!result) {
        console.error('Kullanıcı bulunamadı veya güncellenemedi. ID:', session.user.id);
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
      }
      
      console.log('Kullanıcı ayarları başarıyla güncellendi');
      
      // Güncellenmiş ayarları döndür
      return NextResponse.json({
        success: true,
        settings: result.settings || defaultSettings
      });
    } catch (dbError) {
      console.error('Veritabanı güncellemesi sırasında hata:', dbError);
      return NextResponse.json(
        { error: 'Ayarlar kaydedilemedi', details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Ayarlar güncellenirken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}