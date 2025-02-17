const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
  // 1️⃣ Obtener el token desde el header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No autorizado, token requerido");
    return res.status(401).json({ msg: "No autorizado, token requerido" });
  }

  // 2️⃣ Extraer el token sin "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // 3️⃣ Verificar el token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded; // Añadir el usuario al request
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(401).json({ msg: "Token no válido" });
  }
};

module.exports = authMiddleware;