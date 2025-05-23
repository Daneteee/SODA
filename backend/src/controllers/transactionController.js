/**
 * @module controllers/transactionController
 * @description Controlador para gestionar las transacciones de compra y venta de acciones
 * @requires models/transaction
 */

const Transaction = require("../models/transaction");

/**
 * @function getTransactions
 * @description Obtiene el historial de transacciones del usuario autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.user - Información del usuario autenticado
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Lista de transacciones ordenadas por fecha
 */
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

/**
 * Exportación del controlador de transacciones
 * @exports transactionController
 */
module.exports = {
  getTransactions,
};
