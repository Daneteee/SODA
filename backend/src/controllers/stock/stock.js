const WebSocket = require('ws');
const mongoose = require('mongoose');
const Stock = require('../../models/stock'); // Importa tu modelo

const initializeWebSocket = async (server) => {
  const wss = new WebSocket.Server({ server });

  // Obtener todas las acciones desde MongoDB y guardarlas en un objeto para acceso rápido
  const stocks = await Stock.find({}, 'symbol name sector industry exchange country currency description website logo');
  const stockInfoMap = {};

  stocks.forEach(stock => {
    stockInfoMap[stock.symbol] = {
      name: stock.name,
      sector: stock.sector,
      industry: stock.industry,
      exchange: stock.exchange,
      country: stock.country,
      currency: stock.currency,
      description: stock.description,
      website: stock.website,
      logo: stock.logo
    };
  });

  // Conectar a Finnhub
  const finnhubSocket = new WebSocket('wss://ws.finnhub.io?token=cv7g9fhr01qpecifqecgcv7g9fhr01qpecifqed0');

  finnhubSocket.on('open', () => {
    console.log('✅ Conectado a Finnhub WebSocket');

    // Suscribirse a los símbolos guardados en MongoDB
    Object.keys(stockInfoMap).forEach(symbol => {
      finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
    });
  });

  finnhubSocket.on('message', (data) => {
    const message = JSON.parse(data);
    
    if (message.type === 'trade' && message.data) {
      const enrichedData = message.data.map(trade => {
        return {
          symbol: trade.s,
          price: trade.p,
          timestamp: trade.t,
          volume: trade.v,
          company: stockInfoMap[trade.s] || null // Agregar datos de MongoDB si existen
        };
      });

      // Enviar los datos enriquecidos a todos los clientes conectados
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'trade', data: enrichedData }));
        }
      });
    }
  });

  wss.on('connection', (ws) => {
    console.log('🟢 Nuevo cliente conectado al WebSocket');

    ws.on('close', () => {
      console.log('🔴 Cliente desconectado del WebSocket');
    });
  });

  return wss;
};

module.exports = { initializeWebSocket };
