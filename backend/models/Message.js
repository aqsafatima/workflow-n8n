import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    required: true
  },
  polarity: {
    type: Number,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ user: 1, createdAt: -1 });
messageSchema.index({ sentiment: 1 });

export default mongoose.model('Message', messageSchema); 