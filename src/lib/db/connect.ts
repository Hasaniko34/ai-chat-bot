import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hasant:A6iPuR7PR4HRDg6Q@cluster0.5ok8t.mongodb.net/';
const DB_NAME = process.env.MONGODB_DB || 'chatbot-platform';

// Mongoose bağlantı durumunu takip etmek için global değişken
interface MongooseGlobal {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// global.mongoose'i TypeScript'e tanıtıyoruz
declare global {
  var mongoose: MongooseGlobal;
}

// Development modunda hot reload sırasında birden fazla bağlantı oluşmasını önlemek için
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

/**
 * Veritabanına bağlanmak için kullanılan asenkron fonksiyon
 * @returns MongoDB bağlantısı
 */
export async function connectToDatabase() {
  try {
    if (global.mongoose.conn) {
      console.log('→ MongoDB bağlantısı zaten mevcut');
      return global.mongoose.conn;
    }
  
    // Eğer bağlantı yoksa veya kopmuşsa yeni bağlantı oluştur
    if (!global.mongoose.promise || mongoose.connection.readyState === 0) {
      const opts = {
        bufferCommands: false,
        dbName: DB_NAME,
        maxPoolSize: 10, // Bağlantı havuzu boyutunu artır
        serverSelectionTimeoutMS: 5000, // Sunucu seçim zaman aşımını 5 saniye olarak ayarla
        socketTimeoutMS: 45000, // Soket zaman aşımını 45 saniye olarak ayarla
      };
  
      // Önceki promise'i temizle
      global.mongoose.promise = null;
      
      console.log('→ MongoDB bağlantısı başlatılıyor...');
      global.mongoose.promise = mongoose
        .connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('→ MongoDB bağlantısı başarılı!');
          return mongoose.connection;
        })
        .catch((error) => {
          console.error('→ MongoDB bağlantı hatası:', error);
          throw error;
        });
    }
  
    try {
      const connection = await global.mongoose.promise;
      global.mongoose.conn = connection;
      return global.mongoose.conn;
    } catch (e) {
      global.mongoose.promise = null;
      console.error('→ MongoDB bağlantısı sırasında hata oluştu:', e);
      throw e;
    }
  } catch (error) {
    console.error('→ MongoDB bağlantı işlemi başarısız oldu:', error);
    throw error;
  }
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await connectToDatabase();
    isConnected = true;

    logger.info('MongoDB bağlantısı başarılı', {
      context: 'DATABASE'
    });
  } catch (error) {
    logger.error('MongoDB bağlantı hatası', {
      context: 'DATABASE',
      data: { error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
    });
    throw error;
  }
}

export default connectDB; 