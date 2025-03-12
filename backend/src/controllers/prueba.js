const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = require('http').createServer(app);

// Crear un servidor WebSocket para el frontend
const wss = new WebSocket.Server({ server });

// Conectar a Finnhub WebSocket
const finnhubSocket = new WebSocket('wss://ws.finnhub.io?token=cv7g9fhr01qpecifqecgcv7g9fhr01qpecifqed0');

finnhubSocket.on('open', () => {
  console.log('Conectado a Finnhub WebSocket');
  // Suscribirse a sÃ­mbolos de acciones
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'AAPL' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'MSFT' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'GOOGL' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'AMZN' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'FB' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'TSLA' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'NFLX' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'NVDA' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'BABA' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'V' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'JPM' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'JNJ' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'WMT' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'PG' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'DIS' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'MA' }));
finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: 'HD' }));
});

finnhubSocket.on('message', (data) => {
  console.log('Datos recibidos de Finnhub:', data.toString());

  // Reenviar datos a todos los clientes frontend conectados
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data.toString());
    }
  });
});

// Servir el frontend (Next.js)
app.use(express.static('public'));

server.listen(4500, () => {
  console.log('Servidor escuchando en http://localhost:4500');
});