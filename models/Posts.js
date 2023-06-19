import mongoose from 'mongoose'

/* 컨설팅 요청 등록 */
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a name for this post.'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  category: {
    type: String,
  },
  tags: {
    type: String,
  },
  content: {
    type: String,
  },
  createdBy: {
    type: String,
  },
  createdAt: {

    type: Date, default: Date.now,
  },
  totalViews: {

    type: Number, default: 0,
  },
})

export default mongoose.models.Post || mongoose.model('Post', PostSchema)
