/**
 * @module models/message
 * @description Modelo para los mensajes de chat entre usuarios
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @schema messageSchema
 * @description Esquema de mongoose para los mensajes de chat
 */
const messageSchema = new mongoose.Schema({
  from: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  to: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

/**
 * Modelo de mensaje
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Message', messageSchema);
