const User = require('../../models/user');

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

module.exports = { updateProfileImage };