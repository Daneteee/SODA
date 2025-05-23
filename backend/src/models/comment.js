/**
 * @module models/comment
 * @description Modelo para los comentarios en publicaciones
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @schema CommentSchema
 * @description Esquema de mongoose para los comentarios
 */
const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

/**
 * Modelo de comentario
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Comment', CommentSchema);
