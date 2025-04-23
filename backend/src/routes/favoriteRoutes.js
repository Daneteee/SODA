const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  toggleFavorite,
  getFavorites
} = require('../controllers/user/favoriteController');

// GET current user's favs
router.get('/', authMiddleware, getFavorites);

// PATCH to toggle a symbol on/off favorites
router.patch('/:symbol', authMiddleware, toggleFavorite);

module.exports = router;
