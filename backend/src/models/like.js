/**
 * @module models/like
 * @description Modelo para los likes en publicaciones
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @schema LikeSchema
 * @description Esquema de mongoose para los likes en publicaciones
 */
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

/**
 * Índice compuesto para garantizar que un usuario solo pueda dar like una vez a cada publicación
 * @index {user, post} - Índice compuesto único
 */
LikeSchema.index(
  { user: 1, post: 1 },
  { unique: true }
);

/**
 * Modelo de like
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Like', LikeSchema);
