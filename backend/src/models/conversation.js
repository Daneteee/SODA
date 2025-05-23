/**
 * @module models/conversation
 * @description Modelo para las conversaciones de chat entre usuarios
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @schema conversationSchema
 * @description Esquema de mongoose para las conversaciones
 */
const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  lastMessage: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Modelo de conversación
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Conversation', conversationSchema);
