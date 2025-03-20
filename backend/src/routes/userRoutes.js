const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require('../middlewares/authMiddleware');
const { getUserProfile, getUserStocks, updateUserProfile } = require('../controllers/user/userController');
const { updateProfileImage } = require('../controllers/user/updateProfileImage');
const upload = require('../config/uploadConfig');

// Ruta para obtener el perfil del usuario autenticado
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/profile-image', authMiddleware, upload.single('profileImage'), updateProfileImage);

// Ruta para obtener las acciones del usuario autenticado
router.get('/stocks', authMiddleware, getUserStocks);

module.exports = router;
