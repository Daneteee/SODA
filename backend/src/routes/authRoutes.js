const express = require('express');

const router = express.Router();

const { registerUser, loginUser, logoutUser } = require('../controllers/user/authController');
const { validateRegistration } = require('../middlewares/validateRegistration')

router.post('/register', validateRegistration, registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
module.exports = router;
