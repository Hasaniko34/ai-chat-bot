import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/db/connect';
import User from '@/lib/db/models/user';
import { Types } from 'mongoose';

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
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.error('GET settings: Yetkisiz erişim, oturum yok');
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const isConnected = await connectToDatabase();
    if (!isConnected) {
      console.error('GET settings: Veritabanı bağlantı hatası');
      return NextResponse.json(
        { error: 'Veritabanı bağlantı hatası' },
        { status: 500 }
      );
    }

    const userId = session.user.id;
    console.log('Ayarlar getiriliyor - Oturum ID:', userId);

    try {
      // Önce kullanıcıyı ID ile ara
      let user = await User.findById(userId);
      
      // Kullanıcı bulunamadıysa, e-posta ile ara
      if (!user && session.user.email) {
        console.log(`Kullanıcı ID ile bulunamadı (${userId}), e-posta ile aranıyor: ${session.user.email}`);
        user = await User.findOne({ email: session.user.email });
      }
      
      // Kullanıcı hala bulunamadıysa, yeni bir kullanıcı oluştur
      if (!user) {
        console.log('Kullanıcı bulunamadı, yeni kullanıcı oluşturuluyor');
        
        try {
          // Oturum bilgisiyle yeni kullanıcı oluştur
          const newUser = new User({
            _id: userId, // Oturumdaki ID'yi kullan
            name: session.user.name || 'İsimsiz Kullanıcı',
            email: session.user.email,
            settings: {
              theme: 'light',
              language: 'tr',
              notifications: true,
              messageHistory: 10,
              apiKey: '',
              model: 'gpt-3.5-turbo'
            }
          });
          
          user = await newUser.save();
          console.log('Yeni kullanıcı oluşturuldu:', user._id);
        } catch (saveError: any) {
          // ID formatı hatası olabilir, eğer öyleyse MongoDB'nin kendi ID oluşturmasına izin ver
          if (saveError.name === 'CastError' || saveError.message?.includes('Cast to ObjectId failed')) {
            console.log('ID formatı hatası, MongoDB ID kullanılacak');
            const newUser = new User({
              // _id alanını belirtme, MongoDB kendi oluşturacak
              name: session.user.name || 'İsimsiz Kullanıcı',
              email: session.user.email,
              settings: {
                theme: 'light',
                language: 'tr',
                notifications: true,
                messageHistory: 10,
                apiKey: '',
                model: 'gpt-3.5-turbo'
              }
            });
            
            user = await newUser.save();
            console.log('Yeni kullanıcı MongoDB ID ile oluşturuldu:', user._id);
          } else if (saveError.code === 11000) {
            // Duplicate key error - aynı e-posta ile başka kullanıcı var
            console.error('Kullanıcı oluşturma hatası: Aynı e-posta ile kayıtlı kullanıcı var');
            return NextResponse.json(
              { 
                error: 'Kullanıcı kaydı hatası', 
                details: 'Bu e-posta adresi zaten kayıtlı' 
              },
              { status: 409 }
            );
          } else {
            // Diğer kaydetme hataları
            console.error('Kullanıcı oluşturma hatası:', saveError);
            return NextResponse.json(
              { 
                error: 'Kullanıcı kaydı hatası', 
                details: saveError.message 
              },
              { status: 500 }
            );
          }
        }
      }
      
      // Kullanıcı bulundu veya oluşturuldu, ayarları döndür
      return NextResponse.json({ 
        userId: user._id ? user._id.toString() : undefined,
        settings: user.settings || {
          theme: 'light',
          language: 'tr',
          notifications: true,
          messageHistory: 10,
          apiKey: '',
          model: 'gpt-3.5-turbo'
        }
      });
    } catch (dbError: any) {
      console.error('Veritabanı işlemi sırasında hata:', dbError);
      return NextResponse.json(
        { 
          error: 'Veritabanı işlem hatası', 
          details: dbError.message 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('GET settings: Genel hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}

// Kullanıcı ayarlarını güncelle
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.error('PUT settings: Yetkisiz erişim, oturum yok');
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const isConnected = await connectToDatabase();
    if (!isConnected) {
      console.error('PUT settings: Veritabanı bağlantı hatası');
      return NextResponse.json(
        { error: 'Veritabanı bağlantı hatası' },
        { status: 500 }
      );
    }

    const userId = session.user.id;
    console.log('Ayarlar güncelleniyor - Oturum ID:', userId);
    
    try {
      const body = await req.json();
      const { settings } = body;

      if (!settings) {
        return NextResponse.json(
          { error: 'Ayarlar verisi eksik' },
          { status: 400 }
        );
      }

      // Önce kullanıcıyı ID ile ara
      let user = await User.findById(userId);
      
      // Kullanıcı bulunamadıysa, e-posta ile ara
      if (!user && session.user.email) {
        console.log(`Kullanıcı ID ile bulunamadı (${userId}), e-posta ile aranıyor: ${session.user.email}`);
        user = await User.findOne({ email: session.user.email });
      }
      
      // Kullanıcı hala bulunamadıysa, yeni bir kullanıcı oluştur
      if (!user) {
        console.log('Kullanıcı bulunamadı, yeni ayarlarla kullanıcı oluşturuluyor');
        
        try {
          // Oturum bilgisiyle ve gönderilen ayarlarla yeni kullanıcı oluştur
          const newUser = new User({
            _id: userId, // Oturumdaki ID'yi kullan
            name: session.user.name || 'İsimsiz Kullanıcı',
            email: session.user.email,
            settings: settings
          });
          
          user = await newUser.save();
          console.log('Yeni kullanıcı oluşturuldu ve ayarları kaydedildi:', user._id);
          
          return NextResponse.json({ 
            message: 'Kullanıcı oluşturuldu ve ayarlar kaydedildi',
            userId: user._id ? user._id.toString() : undefined
          });
        } catch (saveError: any) {
          // ID formatı hatası olabilir, eğer öyleyse MongoDB'nin kendi ID oluşturmasına izin ver
          if (saveError.name === 'CastError' || saveError.message?.includes('Cast to ObjectId failed')) {
            console.log('ID formatı hatası, MongoDB ID kullanılacak');
            const newUser = new User({
              // _id alanını belirtme, MongoDB kendi oluşturacak
              name: session.user.name || 'İsimsiz Kullanıcı',
              email: session.user.email,
              settings: settings
            });
            
            user = await newUser.save();
            console.log('Yeni kullanıcı MongoDB ID ile oluşturuldu ve ayarlar kaydedildi:', user._id ? user._id.toString() : 'ID bilinmiyor');
            
            return NextResponse.json({ 
              message: 'Kullanıcı oluşturuldu ve ayarlar kaydedildi',
              userId: user._id ? user._id.toString() : undefined
            });
          } else if (saveError.code === 11000) {
            // Duplicate key error - aynı e-posta ile başka kullanıcı var
            console.error('Kullanıcı oluşturma hatası: Aynı e-posta ile kayıtlı kullanıcı var');
            return NextResponse.json(
              { 
                error: 'Kullanıcı kaydı hatası', 
                details: 'Bu e-posta adresi zaten kayıtlı' 
              },
              { status: 409 }
            );
          } else {
            // Diğer kaydetme hataları
            console.error('Kullanıcı oluşturma hatası:', saveError);
            return NextResponse.json(
              { 
                error: 'Kullanıcı kaydı hatası', 
                details: saveError.message 
              },
              { status: 500 }
            );
          }
        }
      }
      
      // Var olan kullanıcının ayarlarını güncelle
      user.settings = settings;
      await user.save();
      console.log('Kullanıcı ayarları güncellendi:', user._id ? user._id.toString() : 'ID bilinmiyor');

      return NextResponse.json({ 
        message: 'Ayarlar başarıyla güncellendi',
        userId: user._id ? user._id.toString() : undefined
      });
    } catch (dbError: any) {
      console.error('Veritabanı işlemi sırasında hata:', dbError);
      return NextResponse.json(
        { 
          error: 'Veritabanı işlem hatası', 
          details: dbError.message 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('PUT settings: Genel hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}