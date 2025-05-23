/**
 * @module controllers/user/updateProfileImage
 * @description Controlador para actualizar la imagen de perfil del usuario
 * @requires models/user
 */

const User = require('../../models/user');

/**
 * @function updateProfileImage
 * @description Actualiza la imagen de perfil del usuario autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.file - Archivo de imagen subido por multer
 * @param {string} req.file.filename - Nombre del archivo guardado
 * @param {Object} req.user - Información del usuario autenticado
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Datos del usuario con la imagen actualizada
 */
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No se ha subido ninguna imagen' });
    }

    // Asumimos que deseas almacenar la imagen y guardar su ruta relativa
    // Por ejemplo: /uploads/<nombre_del_archivo>
    const imageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.status(200).json({ msg: "Imagen actualizada correctamente", user });
  } catch (error) {
    console.error("Error actualizando imagen de perfil:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

/**
 * Exportación del controlador de actualización de imagen de perfil
 * @exports updateProfileImage
 */
module.exports = { updateProfileImage };