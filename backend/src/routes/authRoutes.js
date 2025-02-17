const express = require('express');

const router = express.Router();

const { registerUser, loginUser} = require('../controllers/authController');
const { validateRegistration } = require('../middlewares/validateRegistration')

router.post('/register', validateRegistration, registerUser);
router.post('/login', loginUser);

module.exports = router;
