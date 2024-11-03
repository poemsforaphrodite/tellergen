import mongoose from 'mongoose';

const NewVoiceSchema = new mongoose.Schema({
  category: String,
  voices: [{
    name: String,
    file_url: String,
    is_free: Boolean
  }]
});

const NewVoice = mongoose.models.NewVoice || mongoose.model('NewVoice', NewVoiceSchema, 'new-voices');

export default NewVoice;
