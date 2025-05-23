/**
 * @module models/stock
 * @description Modelo para las acciones (stocks) en la plataforma
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @schema stockSchema
 * @description Esquema de mongoose para las acciones (stocks)
 */
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

/**
 * Modelo de acción (stock)
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Stock', stockSchema);