const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const token = req.cookies.jwtToken; 
  if (!token) return res.status(401).json({ msg: "No autorizado" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded.user; 
    next(); 
  } catch (err) {
    return res.status(401).json({ msg: "Token inválido" });
  }
};

module.exports = authMiddleware;
