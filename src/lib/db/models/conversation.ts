import mongoose, { Schema, models, model } from 'mongoose';

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
  },
  {
    timestamps: true,
  }
);

// Arama için indeks ekle
ConversationSchema.index({ botId: 1, startedAt: -1 });
ConversationSchema.index({ botId: 1, userId: 1 });
ConversationSchema.index({ botId: 1, visitorId: 1 });

export default models.Conversation || model<IConversation>('Conversation', ConversationSchema); 