const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stock: { type: String, required: true }, // Símbolo de la acción (ej: AAPL)
    type: { type: String, enum: ["buy", "sell"], required: true }, // Compra o venta
    amount: { type: Number, required: true }, // Cantidad de acciones compradas/vendidas
    price: { type: Number, required: true }, // Precio unitario de la acción
    total: { type: Number, required: true }, // Cantidad * Precio
    date: { type: Date, default: Date.now }, // Fecha de la transacción
});

module.exports = mongoose.model("Transaction", transactionSchema);

