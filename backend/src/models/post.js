/**
 * @module models/post
 * @description Modelo para las publicaciones de la red social
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @schema postSchema
 * @description Esquema de mongoose para las publicaciones
 */
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  content: {
    type: String,
    required: [true, 'El contenido es requerido'],
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'tecnologia', 'deportes', 'entretenimiento', 'stocks', 'crypto', 'forex', 'analysis', 'news', 'other'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

/**
 * Modelo de publicación
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Post', postSchema);
