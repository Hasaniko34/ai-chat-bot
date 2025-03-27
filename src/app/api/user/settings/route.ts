import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/mongoose';
import { User, UserSettings } from '@/lib/db/models/user';

// Varsayılan ayarlar
const defaultSettings: UserSettings = {
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
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    // Veritabanına bağlan
    await connectDB();
    
    // Kullanıcıyı bul
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    // Kullanıcının ayarlarını döndür (yoksa varsayılan ayarları döndür)
    return NextResponse.json({
      settings: user.settings || defaultSettings
    });
    
  } catch (error) {
    console.error('Ayarlar alınırken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Ayarlar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kullanıcı ayarlarını güncelle
export async function PUT(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    // İstek gövdesini doğrula
    const body = await req.json();
    
    if (!body.settings) {
      return NextResponse.json(
        { error: 'Ayarlar gerekli bir alandır' },
        { status: 400 }
      );
    }
    
    // Veritabanına bağlan
    await connectDB();
    
    // Kullanıcıyı bul ve güncelle
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { settings: body.settings },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    // Güncellenmiş ayarları döndür
    return NextResponse.json({
      settings: updatedUser.settings
    });
    
  } catch (error) {
    console.error('Ayarlar güncellenirken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 