import { Schema, models, model, Model } from 'mongoose';

export interface IBot {
  _id?: string;
  name: string;
  description: string;
  userId: string;
  model: string;
  prompt: string;
  settings: {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
  };
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  conversations: number;
  users: number;
  successRate: number;
  isPinned: boolean;
  websiteUrl?: string;
  knowledge?: string;
  primaryColor: string;
  secondaryColor: string;
  greeting: string;
  avatar: string;
  apiKey?: string;
}

const BotSchema = new Schema<IBot>(
  {
    name: {
      type: String,
      required: [true, 'Bot adı gereklidir'],
      trim: true,
      maxlength: [50, 'Bot adı en fazla 50 karakter olabilir'],
    },
    description: {
      type: String,
      required: [true, 'Bot açıklaması gereklidir'],
      trim: true,
      maxlength: [500, 'Bot açıklaması en fazla 500 karakter olabilir'],
    },
    userId: {
      type: String,
      required: [true, 'Kullanıcı ID gereklidir'],
    },
    model: {
      type: String,
      required: [true, 'Model gereklidir'],
    },
    prompt: {
      type: String,
      required: [true, 'Prompt gereklidir'],
    },
    settings: {
      temperature: {
        type: Number,
        default: 0.7,
      },
      maxTokens: {
        type: Number,
        default: 1024,
      },
      topP: {
        type: Number,
        default: 0.95,
      },
      topK: {
        type: Number,
        default: 40,
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    conversations: {
      type: Number,
      default: 0,
    },
    users: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 90,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    knowledge: {
      type: String,
      trim: true,
    },
    primaryColor: {
      type: String,
      default: '#6366f1',
    },
    secondaryColor: {
      type: String,
      default: '#a855f7',
    },
    greeting: {
      type: String,
      default: 'Merhaba! Size nasıl yardımcı olabilirim?',
    },
    avatar: {
      type: String,
      default: 'bot',
    },
    apiKey: {
      type: String,
      sparse: true, // Bazı botların API anahtarı olmayabilir
      index: true,
    }
  },
  {
    timestamps: true,
  }
);

// Veritabanı indekslerini ekle
BotSchema.index({ userId: 1 }); // Kullanıcı ID'sine göre hızlı sorgulama
BotSchema.index({ name: 1, userId: 1 }, { unique: true }); // Bir kullanıcı için benzersiz bot adları
BotSchema.index({ status: 1 }); // Duruma göre filtreleme için indeks
BotSchema.index({ isPinned: 1 }); // Sabitlenmiş botları hızlı bulmak için

// Güncelleme yapıldığında updatedAt alanını otomatik güncelle
BotSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Bot: Model<IBot> = models.Bot || model<IBot>('Bot', BotSchema); 