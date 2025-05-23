/**
 * @module middlewares/validateRegistration
 * @description Middleware para validar los datos de registro de usuarios
 * @requires express-validator
 */

const { body, validationResult } = require('express-validator');

/**
 * @constant {Array} validateRegistration
 * @description Array de middlewares para validar los campos del formulario de registro
 * @property {Function} - Validación del nombre (no vacío)
 * @property {Function} - Validación del email (formato correcto)
 * @property {Function} - Validación de la contraseña (longitud mínima)
 * @property {Function} - Validación opcional del teléfono (formato correcto)
 * @property {Function} - Middleware que procesa los resultados de validación
 */
const validateRegistration = [
  body('name', 'El nombre es obligatorio').notEmpty(),
  body('email', 'Por favor, ingresa un correo válido').isEmail(),
  body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  body('phone', 'Por favor, ingresa un número de teléfono válido').optional().isMobilePhone(),
  
  /**
   * @function validationMiddleware
   * @description Procesa los resultados de las validaciones anteriores
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @param {Function} next - Función para continuar al siguiente middleware
   * @returns {void}
   */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array())
      return res.status(400).json({ errors: errors.array() });
    }
    next(); 
  }
];

/**
 * Exportación del middleware de validación de registro
 * @exports validateRegistration
 */
module.exports = {validateRegistration};
