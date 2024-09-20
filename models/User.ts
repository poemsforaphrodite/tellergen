import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  credits: {
    type: Number,
    default: 0,
  },
  subscriptions: {
    tts_pro: { type: Boolean, default: false },
    talking_image_pro: { type: Boolean, default: false },
    clone_voice_pro: { type: Boolean, default: false },
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);