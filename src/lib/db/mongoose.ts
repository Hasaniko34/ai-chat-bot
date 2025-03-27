import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış');
}

const MONGODB_URI = process.env.MONGODB_URI;

// Bağlantı durumunu global olarak takip eden değişken
let isConnected = false;

/**
 * MongoDB bağlantısı oluştur veya mevcut bağlantıyı kullan
 * @returns Mongoose bağlantısı
 */
async function connectToDatabase() {
  // Zaten bağlıysa tekrar bağlanma
  if (isConnected) {
    return mongoose;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    
    isConnected = true;
    console.log('MongoDB bağlantısı başarılı!');
    
    return mongoose;
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw error;
  }
}

export default connectToDatabase; 