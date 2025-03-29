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
    try {
      await connectDB();
    } catch (err) {
      console.error('Veritabanı bağlantısı başarısız oldu:', err);
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
      return NextResponse.json({ error: 'Yetkisiz erişim', details: 'Geçerli bir oturum bulunamadı' }, { status: 401 });
    }
    
    // Oturum bilgisinden kullanıcı ID'sini ve e-posta adresini al
    const userId = session.user.id;
    const userEmail = session.user.email;
    console.log('Kullanıcı hesabı silme isteği alındı. Oturum User ID:', userId, 'Email:', userEmail);
    
    // Veritabanına bağlan
    try {
      await connectDB();
    } catch (err) {
      console.error('Veritabanı bağlantısı başarısız oldu:', err);
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası', details: 'Sunucu veritabanına bağlanamadı' }, { status: 500 });
    }
    
    // Tüm kullanıcıları kontrol et (hata ayıklama için)
    let allUsers: any[] = [];
    try {
      allUsers = await User.find({}).select('_id name email');
      console.log('Veritabanındaki tüm kullanıcılar:', JSON.stringify(allUsers, null, 2));
    } catch (userListError) {
      console.error('Kullanıcı listesi alınamadı:', userListError);
    }
    
    // KULLANICI BULMA STRATEJİSİ: ID, email veya benzer email ile arama
    let userToDelete: any = null;
    let userObjectId: mongoose.Types.ObjectId | null = null;
    
    // 1. ID ile direkt arama
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
      console.log('1. Direkt ID ile arama:', userObjectId);
      userToDelete = await User.findById(userObjectId);
    }
    
    // 2. ID ile bulunamadıysa e-posta ile arama
    if (!userToDelete && userEmail) {
      console.log('2. E-posta ile arama:', userEmail);
      userToDelete = await User.findOne({ email: userEmail });
      
      // E-posta domain farklılıkları olabilir (örn: .com vs .com.tr)
      if (!userToDelete) {
        // 3. E-posta kısmı temizlenmiş (domain farklılıklarını görmezden gelme)
        const emailBasePart = userEmail.split('@')[0];
        console.log('3. E-posta base kısmı ile arama:', emailBasePart);
        
        if (emailBasePart) {
          // Veritabanındaki tüm kullanıcıları dolaşarak benzer e-posta adresi bul
          for (const user of allUsers) {
            if (user.email && user.email.startsWith(emailBasePart + '@')) {
              console.log('Benzer e-posta ile kullanıcı bulundu:', user.email);
              userToDelete = user;
              break;
            }
          }
        }
      }
    }
    
    // Kullanıcı bulunamadı
    if (!userToDelete) {
      console.error('Silinecek kullanıcı bulunamadı. User ID:', userId, 'Email:', userEmail);
      return NextResponse.json({ 
        error: 'Kullanıcı bulunamadı', 
        details: 'Silmek istediğiniz hesap veritabanında bulunamadı. Sistem yöneticisiyle iletişime geçin.'
      }, { status: 404 });
    }
    
    // Bulunan kullanıcının ID'sini kullan
    userObjectId = userToDelete._id;
    console.log('Silinecek kullanıcı bulundu:', userObjectId, userToDelete.email);
    
    try {
      // Transaction başlat (tüm silme işlemleri atomik olsun)
      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();
      
      try {
        // 1. Kullanıcıya ait botları sil
        try {
          if (mongoose.modelNames().includes('Bot')) {
            const Bot = mongoose.model('Bot');
            const deleteBotsResult = await Bot.deleteMany({ userId: userObjectId }, { session: dbSession });
            console.log(`Silinen bot sayısı: ${deleteBotsResult.deletedCount}`);
          }
        } catch (botError: any) {
          console.error('Botları silerken hata:', botError);
          // İşleme devam et
        }
        
        // 2. Kullanıcıya ait konuşmaları sil
        try {
          if (mongoose.modelNames().includes('Conversation')) {
            const Conversation = mongoose.model('Conversation');
            const deleteConversationsResult = await Conversation.deleteMany({ userId: userObjectId }, { session: dbSession });
            console.log(`Silinen konuşma sayısı: ${deleteConversationsResult.deletedCount}`);
          }
        } catch (convError: any) {
          console.error('Konuşmaları silerken hata:', convError);
          // İşleme devam et
        }
        
        // 3. Kullanıcıya ait mesajları sil
        try {
          if (mongoose.modelNames().includes('Message')) {
            const Message = mongoose.model('Message');
            const deleteMessagesResult = await Message.deleteMany({ userId: userObjectId }, { session: dbSession });
            console.log(`Silinen mesaj sayısı: ${deleteMessagesResult.deletedCount}`);
          }
        } catch (msgError: any) {
          console.error('Mesajları silerken hata:', msgError);
          // İşleme devam et
        }
        
        // 4. Kullanıcı ayarlarını sil (ayrı bir koleksiyon olarak saklanıyorsa)
        try {
          if (mongoose.modelNames().includes('UserSettings')) {
            const UserSettings = mongoose.model('UserSettings');
            await UserSettings.deleteMany({ userId: userObjectId }, { session: dbSession });
          }
        } catch (settingsError: any) {
          console.error('Ayarları silerken hata:', settingsError);
          // İşleme devam et
        }
        
        // 5. Son olarak kullanıcıyı sil
        const deletedUser = await User.findByIdAndDelete(userObjectId).session(dbSession);
        
        if (!deletedUser) {
          await dbSession.abortTransaction();
          dbSession.endSession();
          console.error('Kullanıcı silme işlemi başarısız oldu. ObjectId:', userObjectId);
          return NextResponse.json({ 
            error: 'Kullanıcı silinemedi', 
            details: 'Veritabanından kullanıcı silme işlemi başarısız oldu'
          }, { status: 500 });
        }
        
        // Transaction'ı tamamla
        await dbSession.commitTransaction();
        dbSession.endSession();
        
        console.log('Kullanıcı ve ilişkili tüm veriler başarıyla silindi. ID:', userObjectId);
        
        return NextResponse.json({
          success: true,
          message: 'Hesap ve ilişkili tüm veriler başarıyla silindi'
        });
      } catch (transactionError: any) {
        // Hata durumunda transaction'ı geri al
        await dbSession.abortTransaction();
        dbSession.endSession();
        throw transactionError;
      }
    } catch (dbError: any) {
      console.error('Veritabanından kullanıcı silinirken hata:', dbError);
      return NextResponse.json({ 
        error: 'Kullanıcı silinemedi', 
        details: dbError.message || 'Veritabanı işlemi sırasında bir hata oluştu'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Hesap silinirken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Hesap silinirken bir hata oluştu', details: error.message || 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    );
  }
} 