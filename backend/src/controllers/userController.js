const User = require("../models/user");

// const getUserProfile = async (req, res) => {
//   try {
//     console.log("a")
//     // Verificar si el ID del usuario está disponible
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ msg: "No autorizado" });
//     }

//     // Buscar usuario en la base de datos
//     const user = await User.findById(req.user.id).select("-password");

//     if (!user) {
//       return res.status(404).json({ msg: "Usuario no encontrado" });
//     }

//     res.json(user);
//   } catch (err) {
//     console.error("Error al obtener el perfil:", err);
//     res.status(500).json({ msg: "Error del servidor" });
//   }
// };

const getUserProfile = async (req, res) => {  
  try {
    if (!req.user || !req.user || !req.user.id) {
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
module.exports = { getUserProfile };
