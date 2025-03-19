const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sector: String,
    industry: String,
    exchange: String,
    country: String,
    currency: String,
    description: String,
    website: String,
    logo: String,
});

module.exports = mongoose.model('Stock', stockSchema);