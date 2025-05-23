/**
 * @module controllers/user/authController
 * @description Controlador para gestionar la autenticación de usuarios (registro, inicio y cierre de sesión)
 * @requires express-validator
 * @requires bcryptjs
 * @requires models/user
 * @requires jsonwebtoken
 */

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../../models/user'); 
const jwt = require('jsonwebtoken');

/**
 * @function registerUser
 * @description Registra un nuevo usuario en el sistema
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos del usuario a registrar
 * @param {string} req.body.name - Nombre del usuario
 * @param {string} req.body.email - Correo electrónico del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @param {string} req.body.phone - Número de teléfono del usuario
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Token JWT y mensaje de confirmación
 */
const registerUser = async (req, res) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phone } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Usuario ya registrado' });
    }

    // Generar el hash de la contraseña
    const salt = await bcrypt.genSalt(10);  
    const hashedPassword = await bcrypt.hash(password, salt);  

    // Crear el usuario incluyendo el campo profileImage con el valor por defecto
    user = new User({
      name,
      email,
      password: hashedPassword, 
      phone,
      profileImage: "/uploads/default.jpg"
    });

    await user.save();

    // Generar un token JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("Payload del token:", payload);

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      
      // Configurar cookie para cross-origin
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        sameSite: 'none', // Permite cookies cross-site
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
      });
      
      res.json({ 
        msg: 'Usuario registrado',
        token // Mantén también la respuesta JSON por compatibilidad
      });
    });

  } 
  catch (err) {
    console.error(err.message);
    res.status(500).send('ola');
  }
};

/**
 * @function loginUser
 * @description Autentica a un usuario en el sistema
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Credenciales del usuario
 * @param {string} req.body.email - Correo electrónico del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Token JWT y mensaje de confirmación
 */
const loginUser = async (req, res) => {
  console.log('llega al login')
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      
      // Configurar cookie para cross-origin
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        sameSite: 'none', // Permite cookies cross-site
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
        domain: '.tudominio.com' // Si tienes subdominio común
      });
      
      res.json({ 
        msg: 'Usuario registrado',
        token // Mantén también la respuesta JSON por compatibilidad
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

/**
 * @function logoutUser
 * @description Cierra la sesión de un usuario eliminando la cookie de autenticación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Mensaje de confirmación
 */
const logoutUser = async (req, res) => {
  res.clearCookie('authToken');
  res.json({ msg: 'Cierre de sesión exitoso' });
};
/**
 * Exportación de los controladores de autenticación
 * @exports authController
 */
module.exports = {
  registerUser, loginUser, logoutUser
};
