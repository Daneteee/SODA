const User = require("../../models/user");

// Función para obtener el perfil del usuario autenticado
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

// Función para obtener las acciones (stocks) del usuario autenticado
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

module.exports = { getUserProfile, updateUserProfile, getUserStocks };
