import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxBots: number;
  maxMessages: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'TRY'
  },
  interval: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  features: [{
    type: String
  }],
  maxBots: {
    type: Number,
    required: true
  },
  maxMessages: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Plan = mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);

export default Plan; 