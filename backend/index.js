const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
require('dotenv').config();

// Importar rutas
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const marketRoutes = require('./src/routes/marketRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

// Importar WebSocket
const { initializeWebSocket } = require('./src/controllers/stock/stock');

const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/chats', chatRoutes);

// Archivos estáticos
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Crear servidor HTTP y WebSocket
const server = http.createServer(app);
initializeWebSocket(server);

// Iniciar servidor
server.listen(4000, () => {
  console.log('Servidor corriendo en http://localhost:4000');
});

console.log("MONGO_URI:", process.env.MONGO_URI);