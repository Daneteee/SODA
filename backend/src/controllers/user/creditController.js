/**
 * @module controllers/user/creditController
 * @description Controlador para gestionar las operaciones de crédito de los usuarios
 * @requires models/user
 */

const User = require('../../models/user'); // Asegúrate de ajustar la ruta al modelo de usuario

/**
 * @function addCredit
 * @description Añade crédito a la cuenta del usuario autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos de la operación
 * @param {number} req.body.amount - Cantidad de crédito a añadir
 * @param {Object} req.user - Información del usuario autenticado
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Crédito actualizado del usuario
 */
const addCredit = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "La cantidad debe ser un número positivo." });
    }

    // Suponemos que el id del usuario está en req.user
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Verificar el límite de crédito
    const newCredit = (user.credit || 0) + amount;
    if (newCredit > 1000001) {
      return res.status(400).json({ error: "El crédito máximo permitido es 1.000.000." });
    }

    user.credit = newCredit;
    await user.save();

    return res.status(200).json({ credit: user.credit });
  } catch (error) {
    console.error("Error al añadir crédito:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

/**
 * @function withdrawCredit
 * @description Retira crédito de la cuenta del usuario autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos de la operación
 * @param {number} req.body.amount - Cantidad de crédito a retirar
 * @param {Object} req.user - Información del usuario autenticado
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Crédito actualizado del usuario
 */
const withdrawCredit = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "La cantidad debe ser un número positivo." });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (user.credit < amount) {
      return res.status(400).json({ error: "Fondos insuficientes." });
    }

    user.credit -= amount;
    await user.save();

    return res.status(200).json({ credit: user.credit });
  } catch (error) {
    console.error("Error al retirar crédito:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

/**
 * Exportación de los controladores de crédito
 * @exports creditController
 */
module.exports = {
  addCredit,
  withdrawCredit,
};