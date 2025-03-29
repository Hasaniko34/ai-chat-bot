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
    console.log('Oturum E-posta:', session.user.email);

    try {
      // Önce kullanıcıyı ID ile ara
      let user: any = null;
      
      try {
        user = await User.findById(userId);
        if (user) {
          console.log('Kullanıcı ID ile bulundu:', userId);
        }
      } catch (idError: any) {
        console.log('ID ile arama sırasında hata:', idError.message);
        // ID formatı hatası olabilir, devam et
      }
      
      // Kullanıcı bulunamadıysa ve e-posta varsa, e-posta ile ara
      // Case-insensitive arama için regex kullan
      if (!user && session.user.email) {
        console.log(`Kullanıcı ID ile bulunamadı (${userId}), e-posta ile aranıyor: ${session.user.email}`);
        
        // E-postayı temizle (trim) ve case-insensitive arama yap
        const email = session.user.email.trim();
        console.log('Temizlenmiş e-posta ile aranıyor:', email);
        user = await User.findOne({ 
          email: { $regex: new RegExp(`^${email}$`, 'i') } 
        });
        
        if (user) {
          console.log('Kullanıcı e-posta ile bulundu:', user._id);
        } else {
          console.log('Kullanıcı e-posta ile de bulunamadı');
        }
      }
      
      // Kullanıcı hala bulunamadıysa, yeni bir kullanıcı oluştur
      if (!user) {
        console.log('Kullanıcı bulunamadı, yeni kullanıcı oluşturuluyor');
        
        // Önce kullanıcının gerçekten olmadığından emin olmak için bir daha kontrol et
        // Bazen regex araması çalışmayabilir
        if (session.user.email) {
          console.log('Standart sorgu deneniyor...');
          const existingUser = await User.findOne({ email: session.user.email });
          if (existingUser) {
            console.log('Kullanıcı standart sorgu ile bulundu:', existingUser._id);
            user = existingUser;
            return NextResponse.json({ 
              userId: user._id ? user._id.toString() : undefined,
              settings: user.settings || defaultSettings
            });
          } else {
            console.log('Standart sorgu da başarısız oldu');
          }
        }
        
        try {
          // Oturum bilgisiyle yeni kullanıcı oluştur
          const newUser = new User({
            name: session.user.name || 'İsimsiz Kullanıcı',
            email: session.user.email,
            settings: defaultSettings
          });
          
          user = await newUser.save();
          console.log('Yeni kullanıcı oluşturuldu:', user._id);
        } catch (saveError: any) {
          if (saveError.code === 11000) {
            // Duplicate key error - aynı e-posta ile başka kullanıcı var
            // Bu durumda o kullanıcıyı bulmaya çalış
            console.log('Aynı e-posta ile kayıtlı kullanıcı var, onu bulmaya çalışıyorum');
            
            if (session.user.email) {
              // ÇÖZÜM: Eğer hiçbir şekilde kullanıcı bulunamadıysa ama duplicate hatası varsa,
              // mevcut veritabanı durumunu analiz edip çözüm uygula
              console.log('VERİTABANI TUTARSIZLIĞI TESPİT EDİLDİ - ÇÖZÜM DENENİYOR');

              // Yeni yaklaşım: Tüm kullanıcıları getir ve e-posta ile ilişkili olanları analiz et
              try {
                const userEmail = session.user.email?.trim().toLowerCase();
                if (!userEmail) {
                  console.error('Kullanıcı e-postası bulunamadı');
                  return NextResponse.json(
                    { 
                      error: 'Kullanıcı kaydı hatası', 
                      details: 'Oturum bilgisinde e-posta adresi eksik veya geçersiz' 
                    },
                    { status: 400 }
                  );
                }

                console.log('Tüm kullanıcıları analiz ediyorum...');
                const allUsersForCleanup = await User.find({});
                
                // E-posta ile ilişkili tüm kullanıcıları bul
                const relatedUsers = allUsersForCleanup.filter(u => {
                  if (!u.email) return false;
                  const dbEmail = u.email.trim().toLowerCase();
                  return dbEmail === userEmail || dbEmail.includes(userEmail) || userEmail.includes(dbEmail);
                });
                
                console.log(`${relatedUsers.length} adet ilişkili kullanıcı bulundu.`);
                
                if (relatedUsers.length === 0) {
                  // Hiç ilişkili kullanıcı bulunamadıysa, yeni temiz bir kullanıcı oluşturmaya çalış
                  console.log('İlişkili kullanıcı bulunamadı, temiz kullanıcı oluşturulacak');
                  
                  try {
                    // E-postayı temizle ve güvenli bir şekilde kaydet
                    const cleanUser = new User({
                      name: session.user.name || 'İsimsiz Kullanıcı',
                      email: userEmail, // Temizlenmiş e-posta kullan
                      settings: defaultSettings
                    });
                    
                    user = await cleanUser.save();
                    console.log('Temiz kullanıcı başarıyla oluşturuldu:', user._id);
                  } catch (cleanError: any) {
                    console.error('Temiz kullanıcı oluşturma hatası:', cleanError);
                    if (cleanError.code === 11000) {
                      console.error('E-posta çakışması devam ediyor, farklı bir yöntem deneniyor...');
                      
                      // Son çare - veritabanı sorgusunu atla ve varsayılan ayarları döndür
                      console.log('SON ÇARE: Client tarafına varsayılan ayarları gönderiyorum');
                      return NextResponse.json({ 
                        userId: userId || 'temporary-id',
                        settings: defaultSettings,
                        _warning: 'Kullanıcı veritabanında bulunamadı, geçici ayarlar kullanılıyor'
                      });
                    }
                  }
                } else if (relatedUsers.length === 1) {
                  // Tek ilişkili kullanıcı var, bunu kullan
                  user = relatedUsers[0];
                  console.log('Tek ilişkili kullanıcı bulundu ve kullanılıyor:', user._id);
                } else {
                  // Birden fazla ilişkili kullanıcı var - en son oluşturulanı kullan
                  console.log('Birden fazla ilişkili kullanıcı bulundu:');
                  relatedUsers.forEach((u: any, i) => console.log(`${i+1}. ID: ${u._id}, E-posta: ${u.email}, Oluşturulma: ${u._id.getTimestamp?.() || 'bilinmiyor'}`));
                  
                  // En son oluşturulan kullanıcıyı seç
                  relatedUsers.sort((a: any, b: any) => {
                    const aTime = a._id && typeof a._id.getTimestamp === 'function' ? a._id.getTimestamp() : new Date(0);
                    const bTime = b._id && typeof b._id.getTimestamp === 'function' ? b._id.getTimestamp() : new Date(0);
                    return bTime.getTime() - aTime.getTime(); // En yeniden en eskiye sırala
                  });
                  
                  user = relatedUsers[0]; // En yeni kullanıcıyı kullan
                  console.log('En son oluşturulan kullanıcı seçildi:', user._id);
                  
                  // Eğer geliştirme ortamındaysak, diğer kullanıcıları temizle (opsiyonel)
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Geliştirme ortamında çalışıyor, fazla kullanıcılar temizleniyor');
                    for (let i = 1; i < relatedUsers.length; i++) {
                      try {
                        await User.findByIdAndDelete(relatedUsers[i]._id);
                        console.log(`Fazla kullanıcı silindi: ${relatedUsers[i]._id}`);
                      } catch (deleteError) {
                        console.error(`Kullanıcı silinirken hata: ${relatedUsers[i]._id}`, deleteError);
                      }
                    }
                  }
                }
              } catch (fixError: any) {
                console.error('Veritabanı düzeltme hatası:', fixError);
                
                // Kritik hata durumunda frontend'e uyarı ile varsayılan ayarları döndür
                return NextResponse.json({ 
                  userId: userId || 'temporary-id',
                  settings: defaultSettings,
                  _warning: 'Veritabanı hatası, geçici ayarlar kullanılıyor'
                });
              }
            } else {
              console.error('Kullanıcı kaydı hatası: E-posta yok');
              return NextResponse.json(
                { 
                  error: 'Kullanıcı kaydı hatası', 
                  details: 'Oturum bilgisinde e-posta adresi eksik' 
                },
                { status: 400 }
              );
            }
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
        settings: user.settings || defaultSettings
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
    console.log('Oturum E-posta:', session.user.email);
    
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
      let user: any = null;
      
      try {
        user = await User.findById(userId);
        if (user) {
          console.log('Kullanıcı ID ile bulundu:', userId);
        }
      } catch (idError: any) {
        console.log('ID ile arama sırasında hata:', idError.message);
        // ID formatı hatası olabilir, devam et
      }
      
      // Kullanıcı bulunamadıysa ve e-posta varsa, e-posta ile ara
      // Case-insensitive arama için regex kullan
      if (!user && session.user.email) {
        console.log(`Kullanıcı ID ile bulunamadı (${userId}), e-posta ile aranıyor: ${session.user.email}`);
        
        // E-postayı temizle (trim) ve case-insensitive arama yap
        const email = session.user.email.trim();
        console.log('Temizlenmiş e-posta ile aranıyor:', email);
        user = await User.findOne({ 
          email: { $regex: new RegExp(`^${email}$`, 'i') } 
        });
        
        if (user) {
          console.log('Kullanıcı e-posta ile bulundu:', user._id);
        } else {
          console.log('Kullanıcı e-posta ile de bulunamadı');
        }
      }
      
      // Kullanıcı hala bulunamadıysa, yeni bir kullanıcı oluştur
      if (!user) {
        console.log('Kullanıcı bulunamadı, yeni ayarlarla kullanıcı oluşturuluyor');
        
        // Standart sorgu da deneyelim
        if (session.user.email) {
          console.log('Standart sorgu deneniyor...');
          const existingUser = await User.findOne({ email: session.user.email });
          if (existingUser) {
            console.log('Kullanıcı standart sorgu ile bulundu:', existingUser._id);
            user = existingUser;
            user.settings = settings;
            await user.save();
            
            return NextResponse.json({ 
              message: 'Mevcut kullanıcı bulundu ve ayarları güncellendi',
              userId: user._id ? user._id.toString() : undefined 
            });
          } else {
            console.log('Standart sorgu da başarısız oldu');
          }
        }
        
        try {
          // Yeni kullanıcı oluştur (otomatik ID ile)
          const newUser = new User({
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
          if (saveError.code === 11000) {
            // Duplicate key error - aynı e-posta ile başka kullanıcı var
            // Bu durumda o kullanıcıyı bulmaya çalış
            console.log('Aynı e-posta ile kayıtlı kullanıcı var, onu bulmaya çalışıyorum');
            
            if (session.user.email) {
              // ÇÖZÜM: Eğer hiçbir şekilde kullanıcı bulunamadıysa ama duplicate hatası varsa,
              // mevcut veritabanı durumunu analiz edip çözüm uygula
              console.log('VERİTABANI TUTARSIZLIĞI TESPİT EDİLDİ - ÇÖZÜM DENENİYOR');
  
              // Yeni yaklaşım: Tüm kullanıcıları getir ve e-posta ile ilişkili olanları analiz et
              try {
                const userEmail = session.user.email?.trim().toLowerCase();
                if (!userEmail) {
                  console.error('Kullanıcı e-postası bulunamadı');
                  return NextResponse.json(
                    { 
                      error: 'Kullanıcı kaydı hatası', 
                      details: 'Oturum bilgisinde e-posta adresi eksik veya geçersiz' 
                    },
                    { status: 400 }
                  );
                }
  
                console.log('Tüm kullanıcıları analiz ediyorum...');
                const allUsersForCleanup = await User.find({});
                
                // E-posta ile ilişkili tüm kullanıcıları bul
                const relatedUsers = allUsersForCleanup.filter(u => {
                  if (!u.email) return false;
                  const dbEmail = u.email.trim().toLowerCase();
                  return dbEmail === userEmail || dbEmail.includes(userEmail) || userEmail.includes(dbEmail);
                });
                
                console.log(`${relatedUsers.length} adet ilişkili kullanıcı bulundu.`);
                
                if (relatedUsers.length === 0) {
                  // Hiç ilişkili kullanıcı bulunamadıysa, yeni temiz bir kullanıcı oluşturmaya çalış
                  console.log('İlişkili kullanıcı bulunamadı, temiz kullanıcı oluşturulacak');
                  
                  try {
                    // E-postayı temizle ve güvenli bir şekilde kaydet
                    const cleanUser = new User({
                      name: session.user.name || 'İsimsiz Kullanıcı',
                      email: userEmail, // Temizlenmiş e-posta kullan
                      settings: settings
                    });
                    
                    user = await cleanUser.save();
                    console.log('Temiz kullanıcı başarıyla oluşturuldu:', user._id);
                    
                    return NextResponse.json({ 
                      message: 'Temiz kullanıcı oluşturuldu ve ayarlar kaydedildi',
                      userId: user._id ? user._id.toString() : undefined
                    });
                  } catch (cleanError: any) {
                    console.error('Temiz kullanıcı oluşturma hatası:', cleanError);
                    if (cleanError.code === 11000) {
                      console.error('E-posta çakışması devam ediyor, farklı bir yöntem deneniyor...');
                      
                      // Son çare - veritabanı sorgusunu atla ve varsayılan ayarları döndür
                      console.log('SON ÇARE: Ayarları kaydediyorum ama veritabanına yazamıyorum');
                      return NextResponse.json({ 
                        userId: userId || 'temporary-id',
                        settings: settings,
                        message: 'Ayarlar geçici olarak kaydedildi ama kalıcı değil',
                        _warning: 'Veritabanında tutarsızlık var'
                      });
                    }
                  }
                } else if (relatedUsers.length === 1) {
                  // Tek ilişkili kullanıcı var, bunu kullan
                  user = relatedUsers[0];
                  console.log('Tek ilişkili kullanıcı bulundu ve kullanılıyor:', user._id);
                  
                  // Ayarları güncelle
                  user.settings = settings;
                  await user.save();
                  
                  return NextResponse.json({ 
                    message: 'İlişkili kullanıcı bulundu ve ayarları güncellendi',
                    userId: user._id ? user._id.toString() : undefined
                  });
                } else {
                  // Birden fazla ilişkili kullanıcı var - en son oluşturulanı kullan
                  console.log('Birden fazla ilişkili kullanıcı bulundu:');
                  relatedUsers.forEach((u: any, i) => console.log(`${i+1}. ID: ${u._id}, E-posta: ${u.email}, Oluşturulma: ${u._id.getTimestamp?.() || 'bilinmiyor'}`));
                  
                  // En son oluşturulan kullanıcıyı seç
                  relatedUsers.sort((a: any, b: any) => {
                    const aTime = a._id && typeof a._id.getTimestamp === 'function' ? a._id.getTimestamp() : new Date(0);
                    const bTime = b._id && typeof b._id.getTimestamp === 'function' ? b._id.getTimestamp() : new Date(0);
                    return bTime.getTime() - aTime.getTime(); // En yeniden en eskiye sırala
                  });
                  
                  user = relatedUsers[0]; // En yeni kullanıcıyı kullan
                  console.log('En son oluşturulan kullanıcı seçildi:', user._id);
                  
                  // Ayarları güncelle
                  user.settings = settings;
                  await user.save();
                  
                  // Eğer geliştirme ortamındaysak, diğer kullanıcıları temizle (opsiyonel)
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Geliştirme ortamında çalışıyor, fazla kullanıcılar temizleniyor');
                    for (let i = 1; i < relatedUsers.length; i++) {
                      try {
                        await User.findByIdAndDelete(relatedUsers[i]._id);
                        console.log(`Fazla kullanıcı silindi: ${relatedUsers[i]._id}`);
                      } catch (deleteError) {
                        console.error(`Kullanıcı silinirken hata: ${relatedUsers[i]._id}`, deleteError);
                      }
                    }
                  }
                  
                  return NextResponse.json({ 
                    message: 'En son oluşturulan kullanıcı bulundu ve ayarları güncellendi',
                    userId: user._id ? user._id.toString() : undefined
                  });
                }
              } catch (fixError: any) {
                console.error('Veritabanı düzeltme hatası:', fixError);
                
                // Kritik hata durumunda frontend'e uyarı ile ayarları döndür
                return NextResponse.json({ 
                  userId: userId || 'temporary-id',
                  settings: settings,
                  message: 'Ayarlar geçici olarak kaydedildi ama kalıcı değil',
                  _warning: 'Veritabanı hatası'
                });
              }
            } else {
              console.error('Kullanıcı kaydı hatası: E-posta yok');
              return NextResponse.json(
                { 
                  error: 'Kullanıcı kaydı hatası', 
                  details: 'Oturum bilgisinde e-posta adresi eksik' 
                },
                { status: 400 }
              );
            }
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