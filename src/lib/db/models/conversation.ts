import { Schema, model, models, Model } from 'mongoose';

// Mesaj türü
export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Conversation türü
export interface IConversation {
  _id?: string;
  botId: string;
  userId?: string;
  visitorId?: string;
  messages: IMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referer?: string;
    country?: string;
    device?: string;
    [key: string]: any;
  };
  rating?: {
    score?: number;
    feedback?: string;
  };
  isResolved: boolean;
  tags?: string[];
  lastActivity?: Date;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    botId: {
      type: String,
      required: [true, 'Bot ID gereklidir'],
    },
    userId: {
      type: String,
    },
    visitorId: {
      type: String,
    },
    messages: [MessageSchema],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

// Arama için indeks ekle
ConversationSchema.index({ botId: 1, startedAt: -1 });
ConversationSchema.index({ botId: 1, userId: 1 });
ConversationSchema.index({ botId: 1, visitorId: 1 });
// Daha fazla performans için ek indeksler
ConversationSchema.index({ lastMessageAt: -1 }); // Son mesaj tarihine göre sıralama için
ConversationSchema.index({ isResolved: 1 }); // Çözülmüş/çözülmemiş filtreleme için
ConversationSchema.index({ 'rating.score': 1 }); // Puanlama filtreleme için
ConversationSchema.index({ tags: 1 }); // Etiketlere göre arama için
ConversationSchema.index({ lastActivity: -1 }); // Son aktivite tarihine göre sıralama
ConversationSchema.index({ messageCount: -1 }); // Mesaj sayısına göre filtreleme

// Mesaj sayısını otomatik güncelleme
ConversationSchema.pre('save', function(next) {
  if (this.messages) {
    this.messageCount = this.messages.length;
    this.lastActivity = new Date();
    this.lastMessageAt = new Date();
  }
  this.updatedAt = new Date();
  next();
});

export const Conversation: Model<IConversation> = models.Conversation || model<IConversation>('Conversation', ConversationSchema); 