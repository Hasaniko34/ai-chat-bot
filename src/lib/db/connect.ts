import mongoose from 'mongoose';

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

export async function connectToDatabase() {
  if (global.mongoose.conn) {
    console.log('→ MongoDB bağlantısı zaten mevcut');
    return global.mongoose.conn;
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      dbName: DB_NAME,
    };

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
  } catch (e) {
    global.mongoose.promise = null;
    throw e;
  }

  return global.mongoose.conn;
}

export default connectToDatabase; 