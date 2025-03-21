const Transaction = require("../models/transaction");

// Función para obtener las transacciones del usuario autenticado
const getTransactions = async (req, res) => {
  try {
    // Se busca por el ID del usuario (asumimos que req.user.id está disponible tras la autenticación)
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    return res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = {
  getTransactions,
};
