
const express = require('express');
const connectDB = require('./config/db'); 

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const bodyParser = require('body-parser');
const app = express();

require('dotenv').config();
connectDB();

// Middleware
app.use(bodyParser.json());

// Rutas
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 

// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
