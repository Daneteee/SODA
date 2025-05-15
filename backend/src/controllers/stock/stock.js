const WebSocket = require('ws');
const mongoose = require('mongoose');
const Stock = require('../../models/stock'); 
const redis = require('redis');
const axios = require('axios');

// Initialize Redis client
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  socket: {
    reconnectStrategy: (retries) => {
      // Reconectar con backoff exponencial
      const delay = Math.min(1000 * 2 ** retries, 30000); // max delay 30 seconds
      console.log(`🔄 Redis reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    }
  }
});

// Manejar eventos de Redis
redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
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
    // Connect to Redis explicitly with retry
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
    } catch (redisError) {
      console.error('❌ Initial Redis connection failed, will retry automatically:', redisError);
      // La estrategia de reconexión debería manejar esto automáticamente
    }
    
    const wss = new WebSocket.Server({ 
      server,
      path: '/websocket'  
    });
    
    // Get stock list for symbols only - we just need to know what to subscribe to
    const stocksData = await getStocksList();
    const symbols = Object.keys(stocksData);

    let finnhubSocket;
    let reconnectInterval;
    
    const connectToFinnhub = () => {
      // Limpiar cualquier intento de reconexión previo
      if (reconnectInterval) {
        clearTimeout(reconnectInterval);
        reconnectInterval = null;
      }

      console.log('🔄 Intentando conectar a Finnhub WebSocket...');
      finnhubSocket = new WebSocket(`wss://ws.finnhub.io?token=${finnhubApiKey}`);

      // Establecer un timeout por si la conexión no se establece rápidamente
      const connectionTimeout = setTimeout(() => {
        console.error('⚠️ Timeout conectando a Finnhub WebSocket');
        if (finnhubSocket.readyState !== WebSocket.OPEN) {
          finnhubSocket.terminate();
          scheduleReconnect();
        }
      }, 10000); // 10 segundos para establecer la conexión

      finnhubSocket.on('open', () => {
        console.log('✅ Connected to Finnhub WebSocket');
        // Limpiar el timeout ya que la conexión fue exitosa
        clearTimeout(connectionTimeout);
        
        // Limpiar cualquier intento de reconexión pendiente
        if (reconnectInterval) {
          clearTimeout(reconnectInterval);
          reconnectInterval = null;
        }
        
        // Subscribe to all symbols
        symbols.forEach(symbol => {
          try {
            finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
          } catch (error) {
            console.error(`Error subscribing to ${symbol}:`, error);
          }
        });
      });

      finnhubSocket.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
        
          if (message.type === 'trade' && message.data) {
            // Send only the trade data, without enriching it with company info
            const tradeData = message.data.map(trade => ({
              symbol: trade.s,
              price: trade.p,
              timestamp: trade.t,
              volume: trade.v
            }));
            
            // Send to all connected clients with error handling
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                try {
                  client.send(JSON.stringify({ type: 'trade', data: tradeData }));
                } catch (error) {
                  console.error('Error sending message to client:', error);
                }
              }
            });
          }
        } catch (error) {
          console.error('Error processing Finnhub message:', error);
        }
      });

      finnhubSocket.on('error', (error) => {
        console.error('❌ Finnhub WebSocket error:', error);
        clearTimeout(connectionTimeout); // Limpiar el timeout si ocurre un error
        scheduleReconnect();
      });

      finnhubSocket.on('close', (code, reason) => {
        console.warn(`🔴 Finnhub WebSocket closed: ${code} - ${reason}`);
        clearTimeout(connectionTimeout); // Limpiar el timeout si la conexión se cierra
        scheduleReconnect();
      });
    };

    // Función auxiliar para programar reconexiones
    const scheduleReconnect = () => {
      if (!reconnectInterval) {
        // Determinar el retraso basado en la hora actual
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 60 + minute;
        
        // Market hours aproximados para Finnhub (15:00 - 22:00)
        const marketOpen = 15 * 60; // 15:00
        const marketClose = 22 * 60; // 22:00
        
        let delay = 5000; // 5 segundos por defecto
        
        // Si estamos fuera del horario de mercado, usamos una estrategia diferente
        if (currentTime < marketOpen || currentTime >= marketClose) {
          // Durante las horas nocturnas (22:00 - 15:00), hacer intentos menos frecuentes
          // Verificar cada 5 minutos
          delay = 5 * 60 * 1000; // 5 minutos
          
          // Si estamos cerca de la apertura del mercado (14:50 - 15:10), intentar más frecuentemente
          if (currentTime >= marketOpen - 10 && currentTime < marketOpen + 10) {
            delay = 30 * 1000; // 30 segundos
          }
          
          console.log(`🔄 Fuera de horario de mercado. Programando reconexión en ${delay/1000} segundos...`);
        } else {
          console.log(`🔄 Programando reconexión en ${delay/1000} segundos...`);
        }
        
        reconnectInterval = setTimeout(() => {
          connectToFinnhub();
        }, delay);
      }
    };

    // Initial connection
    connectToFinnhub();
    
    wss.on('connection', (ws) => {
      console.log('🟢 New client connected to WebSocket');

      ws.on('error', (error) => {
        console.error('Client WebSocket error:', error);
      });

      ws.on('close', () => {
        console.log('🔴 Client disconnected from WebSocket');
      });
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('🔄 Shutting down WebSocket connections...');
      if (finnhubSocket && finnhubSocket.readyState === WebSocket.OPEN) {
        finnhubSocket.close();
      }
      wss.close();
      if (reconnectInterval) {
        clearTimeout(reconnectInterval);
      }
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