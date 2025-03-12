const express = require('express');
const router = express.Router();
const { getStockData, searchSymbol, getAllStockData } = require('../controllers/stock');

router.get('/stock/:symbol', getStockData);
router.get('/stock/symbol/:companyName', searchSymbol);
router.get('/stocks', getAllStockData); // New endpoint to get all stocks data

module.exports = router;