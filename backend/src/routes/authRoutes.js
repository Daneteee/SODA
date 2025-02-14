const express = require('express');

const router = express.Router();

const { registerUser } = require('../controllers/authController');
const { validateRegistration } = require('../middlewares/validateRegistration')

router.post('/register', validateRegistration, registerUser);

module.exports = router;
