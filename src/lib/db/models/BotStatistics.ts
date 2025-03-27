import mongoose, { Schema, models, model } from 'mongoose';

export interface IBotStatistics {
  _id?: string;
  botId: string;
  date: Date;
  totalConversations: number;
  totalMessages: number;
  uniqueUsers: number;
  averageMessagesPerConversation: number;
  averageResponseTime: number; // milisaniye cinsinden
  successRate: number; // 0-100 arasında
  feedbackCounts: {
    positive: number;
    negative: number;
  };
  dailyStats: {
    date: string; // YYYY-MM-DD formatında
    conversations: number;
    messages: number;
    uniqueUsers: number;
  }[];
  topQueries: {
    query: string;
    count: number;
  }[];
}

const BotStatisticsSchema = new Schema<IBotStatistics>(
  {
    botId: {
      type: String,
      required: [true, 'Bot ID gereklidir'],
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalConversations: {
      type: Number,
      default: 0,
    },
    totalMessages: {
      type: Number,
      default: 0,
    },
    uniqueUsers: {
      type: Number,
      default: 0,
    },
    averageMessagesPerConversation: {
      type: Number,
      default: 0,
    },
    averageResponseTime: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    feedbackCounts: {
      positive: {
        type: Number,
        default: 0,
      },
      negative: {
        type: Number,
        default: 0,
      },
    },
    dailyStats: [
      {
        date: {
          type: String,
          required: true,
        },
        conversations: {
          type: Number,
          default: 0,
        },
        messages: {
          type: Number,
          default: 0,
        },
        uniqueUsers: {
          type: Number,
          default: 0,
        },
      },
    ],
    topQueries: [
      {
        query: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Önemli alanlar için birleşik indeksler
BotStatisticsSchema.index({ botId: 1, date: 1 }, { unique: true });

export default models.BotStatistics || model<IBotStatistics>('BotStatistics', BotStatisticsSchema); 