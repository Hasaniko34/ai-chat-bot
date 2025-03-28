import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserSettings {
  appearance: {
    theme: string;
    colorScheme: string;
    fontSize: string;
    reduceAnimations: boolean;
    borderRadius: string;
  };
  language: string;
  notifications: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    marketingEmails: boolean;
    monthlyNewsletter: boolean;
    chatbotUpdates: boolean;
  };
  privacy: {
    collectAnalytics: boolean;
    shareUsageData: boolean;
    cookiePreferences: string;
  };
  sessions: {
    autoLogout: string;
    sessionTimeout: string;
  };
}

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  password?: string;
  settings?: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Varsayılan ayarlar
const defaultSettings = {
  appearance: {
    theme: 'system',
    colorScheme: 'indigo',
    fontSize: 'medium',
    reduceAnimations: false,
    borderRadius: 'medium',
  },
  language: 'tr',
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    marketingEmails: false,
    monthlyNewsletter: true,
    chatbotUpdates: true,
  },
  privacy: {
    collectAnalytics: true,
    shareUsageData: false,
    cookiePreferences: 'necessary',
  },
  sessions: {
    autoLogout: '30',
    sessionTimeout: '60',
  }
};

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'İsim alanı zorunludur'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'E-posta alanı zorunludur'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
    },
    password: {
      type: String,
      select: false, // Varsayılan olarak şifre döndürülmez
    },
    settings: {
      type: Schema.Types.Mixed,
      default: () => ({ ...defaultSettings }),
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  }
);

// Koleksiyonun zaten oluşturulup oluşturulmadığını kontrol eder
// Hot-reloading'de birden fazla model tanımlanmaması için gerekli
export const User = (mongoose.models.User as Model<IUser>) || 
  mongoose.model<IUser>('User', UserSchema);

export default User; 