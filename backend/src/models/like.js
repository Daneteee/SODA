const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Like a post
LikeSchema.index(
  { user: 1, post: 1 },
  { unique: true }
);

module.exports = mongoose.model('Like', LikeSchema);
