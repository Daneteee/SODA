const express = require('express');
const router = express.Router();
const {getUserProfile} = require('../controllers/userController');
const authMiddleware = require("../middlewares/authMiddleware");
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;