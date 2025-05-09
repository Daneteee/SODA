const WebSocket = require('ws');
const mongoose = require('mongoose');
const Stock = require('../../models/stock'); 
const redis = require('redis');
const axios = require('axios');

// Initialize Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
// Environment variables
const finnhubApiKey = process.env.FINNHUB_API_KEY;

// Cache constants
const STOCKS_CACHE_KEY = 'stocks:list';
const STOCKS_CACHE_TTL = 3600 * 24; // 24 hours

/**
 * Cache TTL helper function
 */
const getCacheTTL = (range) => {
  switch (range) {
    case '1d': return 300;     // 5 minutes
    case '1wk': return 3600;   // 1 hour
    case '1mo': return 43200;  // 12 hours
    case '1y': return 86400;   // 24 hours
    default: return 3600;      // Default: 1 hour
  }
};

/**
 * Get stock list from database with caching
 */
const getStocksList = async () => {
  // flush
  // await redisClient.flushAll();
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
        const lastYahooPrice = historicalData.length > 0 ? historicalData[historicalData.length - 1].close : null;
        
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
          firstPriceToday: firstPrice,
          lastYahooPrice: lastYahooPrice
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

/**
 * Get historical data for a stock
 */
const getStockHistoricalData = async (symbol, interval = '1d', range = '1mo') => {
  const cacheKey = `stock:${symbol}:${interval}:${range}`;

  try {
    // Try to retrieve from cache
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      console.log(`📀 Cache found for ${cacheKey}`);
      return JSON.parse(cachedData);
    }
    
    console.log(`🆕 Creating cache for ${cacheKey}`);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}&includePrePost=true`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Data not available or incorrect symbol');
    }

    const chartData = data.chart.result[0];
    if (!chartData.timestamp || !chartData.indicators || !chartData.indicators.quote) {
      throw new Error('Unexpected data structure from API');
    }

    const timestamps = chartData.timestamp;
    const quotes = chartData.indicators.quote[0];

    if (!quotes.open || !quotes.high || !quotes.low || !quotes.close || !quotes.volume) {
      throw new Error('Missing quote data from API');
    }

    const history = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString(),
      open: quotes.open[index] ?? null,
      high: quotes.high[index] ?? null,
      low: quotes.low[index] ?? null,
      close: quotes.close[index] ?? null,
      volume: quotes.volume[index] ?? null
    }));

    // Save to cache with variable expiration time
    await redisClient.set(cacheKey, JSON.stringify(history), {
      EX: getCacheTTL(range)
    });

    return history;
  } catch (error) {
    console.error(`Error in getStockHistoricalData for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Initialize WebSocket connection for real-time stock data ONLY
 * This no longer sends company data, just price updates
 */
const initializeWebSocket = async (server) => {
  try {
    // Connect to Redis explicitly
    await redisClient.connect();
    console.log('✅ Connected to Redis');

    redisClient.on('error', (err) => console.error('❌ Redis error:', err));
    
    const wss = new WebSocket.Server({ server });
    
    // Get stock list for symbols only - we just need to know what to subscribe to
    const stocksData = await getStocksList();
    const symbols = Object.keys(stocksData);

    const finnhubSocket = new WebSocket(`wss://ws.finnhub.io?token=${finnhubApiKey}`);

    finnhubSocket.on('open', () => {
      console.log('✅ Connected to Finnhub WebSocket');
      // Subscribe to all symbols
      symbols.forEach(symbol => {
        finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    });

    finnhubSocket.on('message', async (data) => {
      const message = JSON.parse(data);
    
      if (message.type === 'trade' && message.data) {
        // Send only the trade data, without enriching it with company info
        const tradeData = message.data.map(trade => ({
          symbol: trade.s,
          price: trade.p,
          timestamp: trade.t,
          volume: trade.v
        }));
        
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'trade', data: tradeData }));
          }
        });
      }
    });
    
    wss.on('connection', (ws) => {
      console.log('🟢 New client connected to WebSocket');

      ws.on('close', () => {
        console.log('🔴 Client disconnected from WebSocket');
      });
    });
    
    return wss;
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    throw error;
  }
};

/**
 * API endpoint to get stock detail/historical data
 */
const stockDetail = async (req, res) => {
  const { symbol } = req.params;
  const { interval = '1d', range = '1mo' } = req.query;

  try {
    const history = await getStockHistoricalData(symbol, interval, range);
    res.json(history);
  } catch (error) {
    console.error('Error in stockDetail:', error);
    res.status(500).json({ error: 'Error getting data from Yahoo Finance' });
  }
};

/**
 * API endpoint to get all stocks information
 */
const getAllStocks = async (req, res) => {
  try {
    const stocks = await getStocksList();
    res.json(stocks);
  } catch (error) {
    console.error('Error in getAllStocks:', error);
    res.status(500).json({ error: 'Error retrieving stocks list' });
  }
};



/**
 * API endpoint to get stock news
 */
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

  // Improved query to find relevant news directly
  const link = `https://newsapi.org/v2/everything?q=${symbol}+financial&from=${firstDay}&to=${lastDay}&sortBy=popularity&pageSize=10&apiKey=${apiKey}`;
  
  try {
    const response = await axios.get(link, { timeout: 10000 }); // 10 second timeout
    const relevantNews = response.data.articles;

    // Return object with articles property
    res.status(200).json({ articles: relevantNews });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).send('Error fetching news');
  }
};

// Cache flush utility function (for development/testing)
const flushCache = async (req, res) => {
  try {
    await redisClient.flushAll();
    res.status(200).json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error flushing cache:', error);
    res.status(500).json({ error: 'Error flushing cache' });
  }
};

module.exports = { 
  initializeWebSocket,
  stockDetail,
  getAllStocks,
  getNews,
  flushCache
};