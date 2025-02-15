const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('name', 'El nombre es obligatorio').notEmpty(),
  body('email', 'Por favor, ingresa un correo válido').isEmail(),
  body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  body('phone', 'Por favor, ingresa un número de teléfono válido').optional().isMobilePhone(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array())
      return res.status(400).json({ errors: errors.array() });
    }
    next(); 
  }
];

module.exports = {validateRegistration};
