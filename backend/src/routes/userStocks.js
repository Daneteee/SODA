const express = require('express');
const User = require('./models/User'); // Asegúrate de que la ruta sea correcta
const router = express.Router();

// Ruta para obtener las acciones compradas por un usuario
router.get('/get-stocks/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('stocks');  // Busca al usuario y selecciona solo el campo 'stocks'
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user.stocks); // Envía el array de acciones compradas
  } catch (error) {
    console.error('Error al obtener acciones:', error);
    res.status(500).json({ message: 'Error al obtener las acciones' });
  }
});

module.exports = router;
