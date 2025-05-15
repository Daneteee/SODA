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
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
let wsServer;

// Inicializar websocket y manejar reconexión si es necesario
const setupWebSocket = async () => {
  try {
    wsServer = await initializeWebSocket(server);
    console.log('✅ WebSocket server initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing WebSocket:', error);
    console.log('🔄 Will retry WebSocket initialization in 30 seconds...');
    setTimeout(setupWebSocket, 30000);
  }
};

// Iniciar WebSocket
setupWebSocket();

// Iniciar servidor
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Manejar el cierre gracioso del servidor
const gracefulShutdown = () => {
  console.log('🛑 Iniciando cierre gracioso del servidor...');
  
  // Cerrar el servidor HTTP primero
  server.close(() => {
    console.log('✅ Servidor HTTP cerrado.');
    
    // Salir del proceso después de cerrar todo
    process.exit(0);
  });
  
  // Si el cierre tarda más de 10 segundos, forzar salida
  setTimeout(() => {
    console.error('⏱️ Tiempo de cierre excedido, forzando salida...');
    process.exit(1);
  }, 10000);
};

// Escuchar señales de terminación
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  gracefulShutdown();
});

console.log("MONGO_URI:", process.env.MONGO_URI);