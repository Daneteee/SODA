const express = require('express');
const router = express.Router();
const { buyStock } = require('../controllers/stock/buyController');
const protect = require('../middlewares/authMiddleware');
const { sellStock } = require('../controllers/stock/sellController');
const { stockDetail, getNews, getAllStocks} = require('../controllers/stock/stock');
const { getMarketStatus } = require('../controllers/stock/marketStatusController');

// Ruta para verificar el estado del mercado
router.get('/status', getMarketStatus);

// Ruta para comprar acciones
router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/stocks', getAllStocks);
router.get('/news', getNews);
router.get('/:symbol', stockDetail);

module.exports = router;
