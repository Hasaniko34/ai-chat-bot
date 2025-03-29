import { Schema, model, models, Model } from 'mongoose';

interface IBotStatistics {
  botId: string;
  totalConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  lastUpdated: Date;
}

const botStatisticsSchema = new Schema<IBotStatistics>({
  botId: { type: String, required: true, unique: true },
  totalConversations: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Güncelleme yapıldığında lastUpdated alanını otomatik güncelle
botStatisticsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export const BotStatistics: Model<IBotStatistics> = models.BotStatistics || model<IBotStatistics>('BotStatistics', botStatisticsSchema); 