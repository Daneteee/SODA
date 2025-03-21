const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require('../middlewares/authMiddleware');
const { getUserProfile, getUserStocks, updateUserProfile, changePassword } = require('../controllers/user/userController');
const { updateProfileImage } = require('../controllers/user/updateProfileImage');
const upload = require('../config/uploadConfig');

// Rutas del usuario
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/profile-image', authMiddleware, upload.single('profileImage'), updateProfileImage);
router.put('/change-password', authMiddleware, changePassword);
router.get('/stocks', authMiddleware, getUserStocks);

// Rutas para créditos
const { addCredit, withdrawCredit } = require('../controllers/user/creditController');

router.post('/addCredit', authMiddleware, addCredit);
router.post('/withdrawCredit', authMiddleware, withdrawCredit);

module.exports = router;
