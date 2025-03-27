import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@/lib/db/models';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Kullanıcı kayıt şeması
const userSchema = z.object({
  name: z.string().min(2, { message: 'İsim en az 2 karakter olmalıdır' }),
  email: z.string().email({ message: 'Geçerli bir e-posta adresi giriniz' }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
});

export async function POST(req: NextRequest) {
  try {
    // Veritabanına bağlan
    await connectToDatabase();
    
    // İstek gövdesini doğrula
    const body = await req.json();
    const validationResult = userSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Geçersiz kullanıcı bilgileri', errors: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validationResult.data;
    
    // E-posta adresinin benzersiz olduğunu kontrol et
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }
    
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Yeni kullanıcı oluştur
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    
    // Hassas bilgileri çıkar
    const user = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };
    
    return NextResponse.json(
      { message: 'Kullanıcı başarıyla oluşturuldu', user },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Kullanıcı kayıt hatası:', error);
    return NextResponse.json(
      { message: 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 