const express = require('express');
const connectDB = require('./src/config/db'); 
const cors = require('cors'); // <-- Importar cors
const cookieParser = require('cookie-parser');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const marketRoutes = require('./src/routes/marketRoutes');
const bodyParser = require('body-parser');
const { initializeWebSocket } = require('./src/controllers/stock/stock'); // Import WebSocket initializer

const app = express();
require('dotenv').config();
connectDB();
app.use(cookieParser()); 

// Middleware
app.use(cors({ 
  origin: 'http://localhost:3000', 
  credentials: true 
})); // <-- Permitir solicitudes desde el frontend
app.use(bodyParser.json());

// Rutas
app.use('/api/auth', authRoutes); 
app.use('/api/user', userRoutes); 
app.use('/api/market', marketRoutes);

// Servir archivos estáticos para el frontend
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Crear el servidor HTTP
const server = require('http').createServer(app);

// Inicializar WebSocket
initializeWebSocket(server);

// Iniciar servidor (ahora usamos 'server' en lugar de 'app')
server.listen(4000, () => {
  console.log('Servidor corriendo en http://localhost:4000');
});

console.log("MONGO_URI:", process.env.MONGO_URI);