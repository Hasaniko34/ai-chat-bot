import mongoose, { Schema, models, model } from 'mongoose';

export interface IBot {
  _id?: string;
  name: string;
  description?: string;
  status: 'online' | 'offline' | 'maintenance';
  icon?: string;
  color: string;
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
  userId?: string;
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
      trim: true,
      maxlength: [500, 'Bot açıklaması en fazla 500 karakter olabilir'],
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance'],
      default: 'online',
    },
    icon: {
      type: String,
      default: '🤖',
    },
    color: {
      type: String,
      default: '6366f1',
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
    userId: {
      type: String,
      required: [true, 'Kullanıcı ID gereklidir'],
    },
  },
  {
    timestamps: true,
  }
);

export default models.Bot || model<IBot>('Bot', BotSchema); 