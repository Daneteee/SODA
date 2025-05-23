/**
 * @module models/user
 * @description Modelo para los usuarios de la plataforma
 * @requires mongoose
 * @requires bcryptjs
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @schema userSchema
 * @description Esquema de mongoose para los usuarios
 */
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  profileImage: {
    type: String, 
    required: false,
    default: "/uploads/default.jpg"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  stocks: [
    {
      symbol: { type: String, required: true },  
      quantity: { type: Number, required: true },
      purchasePrice: { type: Number, required: true }, 
      purchaseDate: { type: Date, default: Date.now },
      name: { type: String },
      sector: String,
      industry: String,
      exchange: String,
      country: String,
      currency: String,
      description: String,
      website: String,
      logo: String
    }
  ],
  credit: {
    type: Number,
    default: 50000
  },
  favs: [
    {
      symbol: { type: String, required: true },
      name: { type: String },
      sector: String,
      industry: String,
      exchange: String,
      country: String,
      currency: String,
      description: String,
      website: String,
      logo: String
    }
  ]
});

/**
 * Método para comparar la contraseña ingresada con la almacenada en la base de datos
 * @method matchPassword
 * @param {string} enteredPassword - Contraseña ingresada por el usuario
 * @returns {Promise<boolean>} - Verdadero si las contraseñas coinciden, falso en caso contrario
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Modelo de usuario
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('User', userSchema);
