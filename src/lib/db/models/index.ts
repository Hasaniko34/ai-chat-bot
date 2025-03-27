import { connectToDatabase } from '../connect';
import User, { IUser } from './user';
import Bot, { type IBot } from './bot';
import Conversation, { type IConversation, type IMessage } from './conversation';
import BotStatistics, { type IBotStatistics } from './BotStatistics';

// Tüm exportları tek yerde topluyoruz
export {
  connectToDatabase,
  // Model exports
  User,
  Bot,
  Conversation,
  BotStatistics
};

// Type exports
export type {
  IUser,
  IBot,
  IConversation,
  IMessage,
  IBotStatistics
};

// Not: Çift export sorununa neden olan default export kısmını kaldırdık
// export { default as Bot, type IBot } from './Bot';
// export { default as Conversation, type IConversation, type IMessage } from './Conversation';
// export { default as BotStatistics, type IBotStatistics } from './BotStatistics'; 