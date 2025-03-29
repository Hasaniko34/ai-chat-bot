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
      maxPoolSize: 10, // Bağlantı havuzu boyutu
      serverSelectionTimeoutMS: 5000, // Sunucu seçim zaman aşımı
      socketTimeoutMS: 45000, // Soket zaman aşımı
      connectTimeoutMS: 10000, // Bağlantı zaman aşımı
      heartbeatFrequencyMS: 10000, // Kalp atışı frekansı
    });
    
    isConnected = true;
    console.log('MongoDB bağlantısı başarılı!');
    
    // Bağlantı olaylarını dinle
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB bağlantı hatası:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB bağlantısı kesildi, yeniden bağlanmaya çalışılacak.');
      isConnected = false;
    });
    
    return mongoose;
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw error;
  }
}

export default connectToDatabase; 