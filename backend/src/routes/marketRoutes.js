const express = require('express');
const router = express.Router();
const { buyStock } = require('../controllers/stock/buyController');
const protect = require('../middlewares/authMiddleware');
const { sellStock } = require('../controllers/stock/sellController');

// Ruta para comprar acciones
router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);

module.exports = router;
