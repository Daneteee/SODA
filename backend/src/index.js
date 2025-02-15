const express = require('express');
const connectDB = require('./config/db'); 
const cors = require('cors'); // <-- Importar cors

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const bodyParser = require('body-parser');

const app = express();
require('dotenv').config();
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // <-- Permitir solicitudes desde el frontend
app.use(bodyParser.json());

// Rutas
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 

// Iniciar servidor
app.listen(4000, () => {
  console.log('Servidor corriendo en http://localhost:4000');
});
