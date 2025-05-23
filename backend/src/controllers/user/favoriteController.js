/**
 * @module controllers/user/favoriteController
 * @description Controlador para gestionar los favoritos de acciones de los usuarios
 * @requires models/user
 * @requires models/stock
 */

const User = require('../../models/user');
const Stock = require('../../models/stock');

/**
 * @function toggleFavorite
 * @description Añade o elimina una acción de la lista de favoritos del usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de la solicitud
 * @param {string} req.params.symbol - Símbolo de la acción a añadir/eliminar
 * @param {Object} req.user - Información del usuario autenticado
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Lista actualizada de favoritos del usuario
 */
exports.toggleFavorite = async (req, res) => {
  const userId = req.user.id;              // set by authMiddleware
  const { symbol } = req.params;           // e.g. PATCH /api/favorites/AAPL
  
  if (!symbol || symbol === "undefined") {
    return res.status(400).json({ msg: "Símbolo inválido" });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    // Buscar si el símbolo ya está en favoritos
    const existingFav = user.favs.find(fav => fav.symbol === symbol);
    
    if (!existingFav) {
      // No está en favoritos → añadir con todos los datos del stock
      // Primero obtener la información completa del stock
      const stockInfo = await Stock.findOne({ symbol });
      if (!stockInfo) {
        return res.status(404).json({ msg: 'Stock no encontrado' });
      }
      
      // Añadir a favoritos con todos los datos
      user.favs.push({
        symbol: stockInfo.symbol,
        name: stockInfo.name,
        sector: stockInfo.sector,
        industry: stockInfo.industry,
        exchange: stockInfo.exchange,
        country: stockInfo.country,
        currency: stockInfo.currency,
        description: stockInfo.description,
        website: stockInfo.website,
        logo: stockInfo.logo
      });
    } else {
      // Ya está en favoritos → eliminar
      user.favs = user.favs.filter(fav => fav.symbol !== symbol);
    }

    await user.save();
    res.json({ favs: user.favs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

/**
 * @function getFavorites
 * @description Obtiene la lista de acciones favoritas del usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.user - Información del usuario autenticado
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Lista de favoritos del usuario
 */
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favs');
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json({ favs: user.favs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};
