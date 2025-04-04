const WebSocket = require('ws');
const mongoose = require('mongoose');
const Stock = require('../../models/stock'); 
const redis = require('redis');
const axios = require('axios');
// Inicializar el cliente Redis
const redisClient = redis.createClient({});
// Importar env
const finnhubApiKey = process.env.FINNHUB_API_KEY;
// Clave para la caché del listado de acciones
const STOCKS_CACHE_KEY = 'stocks:list';
const STOCKS_CACHE_TTL = 3600 * 24; 

// Conectar a Redis y WebSocket
const initializeWebSocket = async (server) => {
  try {
    // Conectar a Redis explícitamente
    await redisClient.connect();
    console.log('✅ Conectado a Redis');

    redisClient.on('error', (err) => console.error('❌ Error en Redis:', err));
    // hola dan
    const wss = new WebSocket.Server({ server });
    
    // Obtener el listado de acciones (usando la función con caché)
    const stockInfoMap = await getStocksList();

    const finnhubSocket = new WebSocket(`wss://ws.finnhub.io?token=${finnhubApiKey}`);

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
          company: stockInfoMap[trade.s] || null,
          firstPriceToday: stockInfoMap[trade.s]?.firstPriceToday  // Incluye el primer precio del día
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

const getStockHistoricalData = async (symbol, interval = '1d', range = '1mo') => {
  const cacheKey = `stock:${symbol}:${interval}:${range}`;

  try {
    // Intentar recuperar de la caché
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      console.log(`📀 Cache encontrada para ${cacheKey}`);
      return JSON.parse(cachedData);
    }
    
    // console.log(`🆕 Creando cache para ${cacheKey}`);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}&includePrePost=true`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Datos no disponibles o símbolo incorrecto');
    }

    const chartData = data.chart.result[0];
    if (!chartData.timestamp || !chartData.indicators || !chartData.indicators.quote) {
      throw new Error('Estructura de datos inesperada en la API');
    }

    const timestamps = chartData.timestamp;
    const quotes = chartData.indicators.quote[0];

    if (!quotes.open || !quotes.high || !quotes.low || !quotes.close || !quotes.volume) {
      throw new Error('Faltan datos de cotización en la API');
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

    return historial;
  } catch (error) {
    console.error(`Error en getStockHistoricalData para ${symbol}:`, error);
    throw error;
  }
};

// Modificación de getStocksList para incluir el primer precio del día
const getStocksList = async () => {
  // flush
  await redisClient.flushAll();
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

    // Obtener datos históricos para cada acción (solo necesitamos el primer precio del día)
    for (const stock of stocks) {
      try {
        const historicalData = await getStockHistoricalData(stock.symbol, '5m', '1d');
        if (stock.symbol === 'AMZN'){
          console.log(`📈 Obteniendo datos históricos para ${stock.symbol}`);
          console.log('historicalData', historicalData[0].close);
        }
        const firstPrice = historicalData.length > 0 ? historicalData[0].close : null;
        
        stockInfoMap[stock.symbol] = { 
          name: stock.name,
          sector: stock.sector,
          industry: stock.industry,
          exchange: stock.exchange,
          country: stock.country,
          currency: stock.currency,
          description: stock.description,
          website: stock.website,
          logo: stock.logo,
          firstPriceToday: firstPrice
        };
      } catch (error) {
        console.error(`Error obteniendo datos para ${stock.symbol}:`, error);
        stockInfoMap[stock.symbol] = { 
          ...stock.toObject(),
          firstPriceToday: null
        };
      }
    }
    
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

// Modificación de stockDetail para usar la nueva función
const stockDetail = async (req, res) => {
  const { symbol } = req.params;
  const { interval = '1d', range = '1mo' } = req.query;

  try {
    const historial = await getStockHistoricalData(symbol, interval, range);
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

const getNews = async (req, res) => {
  const { symbol } = req.query;
  const apiKey = '1522002a63ee4ce58b110b2753308adf';
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];
  console.log('llega');

  // Mejorando la consulta para buscar directamente noticias relevantes
  const link = `https://newsapi.org/v2/everything?q=${symbol}+financial&from=${firstDay}&to=${lastDay}&sortBy=popularity&pageSize=10&apiKey=${apiKey}`;
  console.log(link);

  try {
    const response = await axios.get(link, { timeout: 10000 }); // Timeout de 10 segundos
    const noticiasRelevantes = response.data.articles;

    // Devolver un objeto con la propiedad articles
    res.status(200).json({ articles: noticiasRelevantes });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching news');
  }
};




module.exports = { 
  initializeWebSocket, 
  stockDetail,
  getNews,
};