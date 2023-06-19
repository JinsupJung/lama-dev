import mongoose from 'mongoose'

/* 커뮤니티 게시글  */
const ForumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a name for this post.'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  category: {
    type: String,
  },
  tags: {
    type: Array,
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

export default mongoose.models.Forum || mongoose.model('Forum', ForumSchema)
