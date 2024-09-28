import mongoose, { Schema, Document } from 'mongoose';

interface Transaction {
  transactionId: string;
  merchantId: string;
  amount: number;
  status: string;
  credits?: number; // Added optional credits field
  productName?: string;
}

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  credits: number;
  textToSpeechCharacters: number;
  voiceCloningCharacters: number;
  talkingImageCharacters: number; // Changed from talkingImageMinutes to talkingImageCharacters
  subscriptions: {
    [key: string]: boolean;
  };
  transactions: Transaction[];
}

const TransactionSchema: Schema = new Schema({
  transactionId: { type: String, required: true, unique: true },
  merchantId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  credits: { type: Number, default: 0 }, // Added credits field
  productName: { type: String },
});

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 0 },
  textToSpeechCharacters: { type: Number, default: 0 },
  voiceCloningCharacters: { type: Number, default: 0 },
  talkingImageCharacters: { type: Number, default: 0 }, // Changed from talkingImageMinutes to talkingImageCharacters
  subscriptions: {
    type: Map,
    of: Boolean,
  },
  transactions: { type: [TransactionSchema], default: [] },
});

// Create an index on transactions.transactionId for faster lookup
UserSchema.index({ 'transactions.transactionId': 1 });

export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);