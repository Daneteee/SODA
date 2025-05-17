const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // No likes acá porque están en esquema separado
});

module.exports = mongoose.model('Comment', CommentSchema);
