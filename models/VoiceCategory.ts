import mongoose from 'mongoose'

const VoiceCategorySchema = new mongoose.Schema({
  category: String,
  voices: [{
    name: String,
    free: Boolean
  }]
}, { collection: 'voices' }) // Change the collection name to 'voices'

export default mongoose.models.VoiceCategory || mongoose.model('VoiceCategory', VoiceCategorySchema)