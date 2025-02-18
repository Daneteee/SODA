const express = require('express');
const router = express.Router();
const {getStockData, searchSymbol}  = require('../controllers/stock')
router.get('/stock/:symbol', getStockData);
router.get('/stock/symbol/:companyName', searchSymbol);
module.exports = router;