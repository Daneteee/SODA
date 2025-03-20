const multer = require('multer');
const path = require('path');

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // La carpeta "uploads" se ubicará en la raíz del backend
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    // Crea un nombre único para el archivo: usuarioID-timestamp.ext
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '-' + Date.now() + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;