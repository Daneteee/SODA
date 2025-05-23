/**
 * @module controllers/user/userController
 * @description Controlador para gestionar operaciones relacionadas con el perfil de usuario
 * @requires models/user
 * @requires bcryptjs
 */

const User = require("../../models/user");
const bcrypt = require("bcryptjs");

/**
 * @function getUserProfile
 * @description Obtiene el perfil completo del usuario autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.user - Información del usuario autenticado
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Datos del perfil del usuario sin la contraseña
 */
const getUserProfile = async (req, res) => {  
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    res.json(user);
  } 
  catch (err) {
    console.error("Error al obtener el perfil:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

/**
 * @function updateUserProfile
 * @description Actualiza la información del perfil del usuario autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos a actualizar
 * @param {string} [req.body.name] - Nombre del usuario
 * @param {string} [req.body.email] - Correo electrónico del usuario
 * @param {string} [req.body.phone] - Número de teléfono del usuario
 * @param {string} [req.body.profileImage] - Ruta de la imagen de perfil
 * @param {Object} req.user - Información del usuario autenticado
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Datos actualizados del usuario
 */
const updateUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }
    
    // Extraer los campos a actualizar (por ejemplo, name, email, phone, profileImage)
    const { name, email, phone, profileImage } = req.body;
    
    // Construir un objeto de actualización (solo con los campos enviados)
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (profileImage) updates.profileImage = profileImage;
    
    // Actualizar el perfil del usuario
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    res.json({ msg: "Perfil actualizado correctamente", user });
  } catch (err) {
    console.error("Error al actualizar el perfil:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

/**
 * @function getUserStocks
 * @description Obtiene las acciones (stocks) que posee el usuario autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.user - Información del usuario autenticado
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Lista de acciones del usuario
 */
const getUserStocks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }
    // Seleccionamos solo el campo 'stocks'
    const user = await User.findById(req.user.id).select("stocks");
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    res.json({ stocks: user.stocks });
  } catch (err) {
    console.error("Error al obtener las acciones del usuario:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

/**
 * @function changePassword
 * @description Cambia la contraseña del usuario autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos para el cambio de contraseña
 * @param {string} req.body.currentPassword - Contraseña actual del usuario
 * @param {string} req.body.newPassword - Nueva contraseña del usuario
 * @param {Object} req.user - Información del usuario autenticado
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Mensaje de confirmación
 */
const changePassword = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    const { currentPassword, newPassword } = req.body;

    // Verificar que los campos están completos
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "Por favor, completa todos los campos" });
    }

    // Obtener usuario
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Verificar si la contraseña actual es correcta
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "La contraseña actual es incorrecta" });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña en la base de datos
    user.password = hashedPassword;
    await user.save();

    res.json({ msg: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error al cambiar la contraseña:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

/**
 * Exportación de los controladores de usuario
 * @exports userController
 */
module.exports = { getUserProfile, updateUserProfile, getUserStocks, changePassword };
