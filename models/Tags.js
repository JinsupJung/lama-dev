import mongoose from 'mongoose'

/* 태그 저장 */
const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this post.'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  createdAt: {
    type: Date, default: Date.now,
  },
})

export default mongoose.models.Tag || mongoose.model('Tag', TagSchema)
