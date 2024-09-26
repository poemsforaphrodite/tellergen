import mongoose, { Schema, Document } from 'mongoose';

interface Transaction {
  transactionId: string;
  merchantId: string;
  amount: number;
  status: string;
  // Remove the credits field from here
}

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  credits: number;
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
  // Remove the credits field from here
});

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 0 },
  subscriptions: {
    type: Map,
    of: Boolean,
  },
  transactions: { type: [TransactionSchema], default: [] },
});

// Create an index on transactions.transactionId for faster lookup
UserSchema.index({ 'transactions.transactionId': 1 });

export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);