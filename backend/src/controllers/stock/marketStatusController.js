/**
 * @module controllers/stock/marketStatusController
 * @description Controlador para verificar el estado actual del mercado de valores
 * @requires utils/marketHours
 */

const { isMarketOpen } = require('../../utils/marketHours');

/**
 * @function getMarketStatus
 * @description Verifica si el mercado de valores está abierto o cerrado actualmente
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Estado del mercado (abierto o cerrado)
 */
const getMarketStatus = async (req, res) => {
  try {
    const marketOpen = isMarketOpen();
    res.json({ isOpen: marketOpen });
  } catch (error) {
    console.error('Error al verificar estado del mercado:', error);
    res.status(500).json({ error: 'Error al verificar estado del mercado' });
  }
};

/**
 * Exportación del controlador de estado del mercado
 * @exports marketStatusController
 */
module.exports = { getMarketStatus }; 