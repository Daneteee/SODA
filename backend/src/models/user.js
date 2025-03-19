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
  createdAt: {
    type: Date,
    default: Date.now
  },
  stocks: [
    {
      symbol: { type: String, required: true },  
      quantity: { type: Number, required: true },
      purchasePrice: { type: Number, required: true }, 
      purchaseDate: { type: Date, default: Date.now } 
    }
  ],
  credit: {
    type: Number,
    default: 50000
  },
});

// Método para comparar contraseñas en el login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
