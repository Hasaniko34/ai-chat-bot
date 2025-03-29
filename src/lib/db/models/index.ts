import { connectToDatabase } from '../connect';
import User, { IUser } from './user';
import { Bot, type IBot } from './bot';
import { Conversation, type IConversation, type IMessage } from './conversation';
import { BotStatistics } from './BotStatistics';

// Model exportları
export {
  User,
  Bot,
  Conversation,
  BotStatistics,
  connectToDatabase
};

// Type exportları
export type {
  IUser,
  IBot,
  IConversation,
  IMessage
};

// Not: Çift export sorununa neden olan default export kısmını kaldırdık
// export { default as Bot, type IBot } from './Bot';
// export { default as Conversation, type IConversation, type IMessage } from './Conversation';
// export { default as BotStatistics, type IBotStatistics } from './BotStatistics'; 