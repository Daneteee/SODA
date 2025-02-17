const User = require("../models/user");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); s
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error al obtener el perfil:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

module.exports = { getUserProfile };