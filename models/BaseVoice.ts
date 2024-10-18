import mongoose from 'mongoose';

const BaseVoiceSchema = new mongoose.Schema({
  category: String,
  voices: [{
    name: String,
    file_url: String,
    is_free: Boolean
  }]
});

const BaseVoice = mongoose.models.BaseVoice || mongoose.model('BaseVoice', BaseVoiceSchema, 'base-voices');

export default BaseVoice;
