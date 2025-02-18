const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); 
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phone } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Usuario ya registrado' });
    }

    // Generar el hash de la contraseña
    const salt = await bcrypt.genSalt(10);  
    const hashedPassword = await bcrypt.hash(password, salt);  
    user = new User({
      name,
      email,
      password: hashedPassword, 
      phone,
    });

    await user.save();

    // Generar un token JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("Payload del token:", payload);

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.status(200).json({ msg: 'Usuario registrado', token });
    });

  } 
  catch (err) {
    console.error(err.message);
    res.status(500).send('ola');
  }
};

const loginUser = async (req, res) => {
  console.log('llega al login')
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  registerUser, loginUser
};
