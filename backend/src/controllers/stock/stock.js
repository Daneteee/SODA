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

const stockDetail = async (req, res) => {
  const { symbol } = req.params; // Obtener el símbolo de la acción
  const { interval = '1d', range = '1mo' } = req.query; // Intervalo y rango de fechas

  console.log('Símbolo de la acción:', symbol);
  console.log('Intervalo:', interval);
  console.log('Rango:', range);

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}&includePrePost=true`;
    console.log('URL de la API de Yahoo Finance:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      return res.status(400).json({ error: 'Datos no disponibles o símbolo incorrecto' });
    }

    const chartData = data.chart.result[0];
    if (!chartData.timestamp || !chartData.indicators || !chartData.indicators.quote) {
      return res.status(400).json({ error: 'Estructura de datos inesperada en la API' });
    }

    const timestamps = chartData.timestamp;
    const quotes = chartData.indicators.quote[0]; // quote debería ser un array con datos

    // Verificar si `quotes` tiene los valores esperados
    if (!quotes.open || !quotes.high || !quotes.low || !quotes.close || !quotes.volume) {
      return res.status(400).json({ error: 'Faltan datos de cotización en la API' });
    }

    // Construir historial
    const historial = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString(),
      open: quotes.open[index] ?? null,
      high: quotes.high[index] ?? null,
      low: quotes.low[index] ?? null,
      close: quotes.close[index] ?? null,
      volume: quotes.volume[index] ?? null
    }));

    // Responder con los datos obtenidos
    res.json(historial);
  } catch (error) {
    console.error('Error en stockDetail:', error);
    res.status(500).json({ error: 'Error al obtener los datos de Yahoo Finance' });
  }
};

module.exports = { initializeWebSocket, stockDetail };
