const WebSocket = require('ws');
const mongoose = require('mongoose');
const Stock = require('../../models/stock'); 
const redis = require('redis');

// Inicializar el cliente Redis
const redisClient = redis.createClient({});

// Clave para la caché del listado de acciones
const STOCKS_CACHE_KEY = 'stocks:list';
const STOCKS_CACHE_TTL = 3600 * 24; 
const getStocksList = async () => {

  try {
    // Intentar recuperar de la caché
    const cachedStocks = await redisClient.get(STOCKS_CACHE_KEY);
    
    if (cachedStocks) {
      console.log('📀 Listado de acciones encontrado en cache');
      return JSON.parse(cachedStocks);
    }
    
    console.log('🆕 Creando cache para el listado');
    
    // Obtener de la base de datos
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
    
    // Guardar en caché
    await redisClient.set(STOCKS_CACHE_KEY, JSON.stringify(stockInfoMap), {
      EX: STOCKS_CACHE_TTL
    });
    
    return stockInfoMap;
  } catch (error) {
    console.error('Error al obtener listado de acciones:', error);
    throw error;
  }
};

// Conectar a Redis y WebSocket
const initializeWebSocket = async (server) => {
  try {
    // Conectar a Redis explícitamente
    await redisClient.connect();
    console.log('✅ Conectado a Redis');

    redisClient.on('error', (err) => console.error('❌ Error en Redis:', err));
    
    const wss = new WebSocket.Server({ server });
    
    // Obtener el listado de acciones (usando la función con caché)
    const stockInfoMap = await getStocksList();

    const finnhubSocket = new WebSocket('wss://ws.finnhub.io?token=cv7g9fhr01qpecifqecgcv7g9fhr01qpecifqed0');

    finnhubSocket.on('open', () => {
      console.log('✅ Conectado a Finnhub WebSocket');
      Object.keys(stockInfoMap).forEach(symbol => {
        finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    });

    finnhubSocket.on('message', async (data) => {
      const message = JSON.parse(data);
      
      if (message.type === 'trade' && message.data) {
        const enrichedData = message.data.map(trade => ({
          symbol: trade.s,
          price: trade.p,
          timestamp: trade.t,
          volume: trade.v,
          company: stockInfoMap[trade.s] || null
        }));
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
  } catch (error) {
    console.error('Error al inicializar WebSocket:', error);
    throw error;
  }
};


// Stock Detail con Cache (sin cambios)
const stockDetail = async (req, res) => {
  const { symbol } = req.params;
  const { interval = '1d', range = '1mo' } = req.query;
  const cacheKey = `stock:${symbol}:${interval}:${range}`;

  try {
    // Intentar recuperar de la caché
    const [cachedData, ttl] = await redisClient
    .multi()
    .get(cacheKey)
    .ttl(cacheKey)
    .exec();

    if (cachedData && ttl > 0) {
      console.log(`📀 Cache encontrada para ${cacheKey}. Caduca en ${ttl} segundos`);
      return res.json(JSON.parse(cachedData));
    }
    console.log(`🆕 Creando cache para ${cacheKey}`);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}&includePrePost=true`;

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
    const quotes = chartData.indicators.quote[0];

    if (!quotes.open || !quotes.high || !quotes.low || !quotes.close || !quotes.volume) {
      return res.status(400).json({ error: 'Faltan datos de cotización en la API' });
    }

    const historial = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString(),
      open: quotes.open[index] ?? null,
      high: quotes.high[index] ?? null,
      low: quotes.low[index] ?? null,
      close: quotes.close[index] ?? null,
      volume: quotes.volume[index] ?? null
    }));

    // Guardar en caché con tiempo de expiración variable
    await redisClient.set(cacheKey, JSON.stringify(historial), {
      EX: getCacheTTL(range)
    });

    res.json(historial);
  } catch (error) {
    console.error('Error en stockDetail:', error);
    res.status(500).json({ error: 'Error al obtener los datos de Yahoo Finance' });
  }
};

// Función para determinar TTL de caché
const getCacheTTL = (range) => {
  switch (range) {
    case '1d': return 300; 
    case '1wk': return 3600; 
    case '1mo': return 43200; 
    case '1y': return 86400; 
    default: return 3600;
  }
};


module.exports = { 
  initializeWebSocket, 
  stockDetail
};