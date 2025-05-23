/**
 * @module middlewares/authMiddleware
 * @description Middleware para verificar la autenticación de usuarios mediante tokens JWT
 * @requires jsonwebtoken
 * @requires dotenv
 */

const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * @function authMiddleware
 * @description Verifica si el usuario está autenticado mediante un token JWT
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.cookies - Cookies de la solicitud
 * @param {string} req.cookies.jwtToken - Token JWT almacenado en cookies
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 * @returns {void}
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.jwtToken; 
  if (!token) return res.status(401).json({ msg: "No autorizado" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded.user; 
    next(); 
  } catch (err) {
    return res.status(401).json({ msg: "Token inválido" });
  }
};

/**
 * Exportación del middleware de autenticación
 * @exports authMiddleware
 */
module.exports = authMiddleware;
