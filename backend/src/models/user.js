const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Método para comparar contraseñas en el login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
