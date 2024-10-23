import mongoose, { Schema, Document } from 'mongoose';

// Define a separate schema for subscription
const SubscriptionSchema = new Schema({
  active: { type: Boolean, default: false },
  endDate: { type: Date }
}, { _id: false }); // Disable _id for subdocuments

interface Subscription {
  active: boolean;
  endDate?: Date;
}

interface SubscriptionMap {
  textToSpeech?: Subscription;
  voiceCloning?: Subscription;
  talkingImage?: Subscription;
}

interface Transaction {
  transactionId: string;
  merchantId: string;
  amount: number;
  status: string;
  credits?: number;
  productName?: string;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
  transactionId: { type: String, required: true, unique: true },
  merchantId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  credits: { type: Number, default: 0 },
  productName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Add this interface before the UserSchema definition
interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  credits: number;
  textToSpeechCharacters: number;
  voiceCloningCharacters: number;
  talkingImageCharacters: number;
  subscriptions: SubscriptionMap;
  transactions: Transaction[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 1000 },
  textToSpeechCharacters: { type: Number, default: 1000 },
  voiceCloningCharacters: { type: Number, default: 1000 },
  talkingImageCharacters: { type: Number, default: 0 },
  subscriptions: {
    type: {
      textToSpeech: { type: SubscriptionSchema },
      voiceCloning: { type: SubscriptionSchema },
      talkingImage: { type: SubscriptionSchema }
    },
    default: {
      textToSpeech: { active: false },
      voiceCloning: { active: false },
      talkingImage: { active: false }
    }
  },
  transactions: { type: [TransactionSchema], default: [] },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

// Create indexes
UserSchema.index({ 'transactions.transactionId': 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
