/**
 * @module controllers/stock/stock
 * @description Controlador principal para gestionar acciones, datos en tiempo real y comunicación WebSocket
 * @requires ws
 * @requires mongoose
 * @requires models/stock
 * @requires redis
 * @requires axios
 */

const WebSocket = require('ws');
const mongoose = require('mongoose');
const Stock = require('../../models/stock'); 
const redis = require('redis');
const axios = require('axios');

// Initialize Redis client
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  socket: {
    /**
     * @function reconnectStrategy
     * @description Estrategia de reconexión para Redis con backoff exponencial
     * @param {number} retries - Número de intentos de reconexión realizados
     * @returns {number} Tiempo de espera en milisegundos antes del próximo intento
     */
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
const STOCKS_CACHE_TTL = 300; 

// Finnhub WebSocket status tracking
let finnhubSubscriptionActive = false;
let subscribedSymbols = new Set();

/**
 * @function getCacheTTL
 * @description Determina el tiempo de vida (TTL) en caché según el rango de tiempo solicitado
 * @param {string} range - Rango de tiempo ('1d', '1wk', '1mo', '1y')
 * @returns {number} Tiempo en segundos que los datos deben permanecer en caché
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
 * @function getStocksList
 * @description Obtiene la lista de acciones desde la base de datos con sistema de caché
 * @returns {Promise<Object>} Mapa de símbolos de acciones con sus datos completos
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
 * @function getStockHistoricalData
 * @description Obtiene datos históricos de una acción con sistema de caché
 * @param {string} symbol - Símbolo de la acción
 * @param {string} interval - Intervalo de tiempo entre datos ('1d', '5m', etc.)
 * @param {string} range - Rango de tiempo a consultar ('1d', '1mo', '1y', etc.)
 * @returns {Promise<Array>} Datos históricos de la acción
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
 * @function subscribeToSymbols
 * @description Suscribe el WebSocket a los símbolos de acciones para recibir datos en tiempo real
 * @param {WebSocket} socket - Conexión WebSocket con Finnhub
 * @param {Array<string>} symbols - Lista de símbolos de acciones a suscribir
 */
const subscribeToSymbols = (socket, symbols) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log(`🔔 Subscribing to ${symbols.length} symbols...`);
    
    // Clear previous subscriptions tracking
    subscribedSymbols.clear();
    
    // Subscribe to each symbol and track them
    symbols.forEach(symbol => {
      try {
        socket.send(JSON.stringify({ type: 'subscribe', symbol }));
        subscribedSymbols.add(symbol);
      } catch (error) {
        console.error(`Error subscribing to ${symbol}:`, error);
      }
    });
    
    finnhubSubscriptionActive = true;
    console.log(`✅ Subscribed to ${subscribedSymbols.size} symbols`);
  } else {
    console.error('❌ Cannot subscribe - socket not open');
    finnhubSubscriptionActive = false;
  }
};

/**
 * @function checkSubscriptions
 * @description Verifica el estado de las suscripciones y reintenta si es necesario
 * @param {WebSocket} socket - Conexión WebSocket con Finnhub
 * @param {Array<string>} symbols - Lista de símbolos de acciones a verificar
 */
const checkSubscriptions = (socket, symbols) => {
  if (socket && socket.readyState === WebSocket.OPEN && !finnhubSubscriptionActive) {
    console.log('🔄 Checking subscriptions - resubscribing to all symbols');
    subscribeToSymbols(socket, symbols);
    return true;
  }
  return false;
};

/**
 * @function initializeWebSocket
 * @description Inicializa la conexión WebSocket para datos de acciones en tiempo real
 * @param {http.Server} server - Servidor HTTP para adjuntar el servidor WebSocket
 * @returns {WebSocket.Server} Servidor WebSocket inicializado
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
    let pingInterval;
    let subscriptionCheckInterval;
    
    // Función para conectar con Finnhub WebSocket
    const connectToFinnhub = () => {
      // Limpiar cualquier intento de reconexión previo
      if (reconnectInterval) {
        clearTimeout(reconnectInterval);
        reconnectInterval = null;
      }
      
      // Limpiar intervalos existentes
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
      
      if (subscriptionCheckInterval) {
        clearInterval(subscriptionCheckInterval);
        subscriptionCheckInterval = null;
      }

      console.log('🔄 Intentando conectar a Finnhub WebSocket...');
      finnhubSocket = new WebSocket(`wss://ws.finnhub.io?token=${finnhubApiKey}`);
      finnhubSubscriptionActive = false;

      // Establecer un timeout por si la conexión no se establece rápidamente
      const connectionTimeout = setTimeout(() => {
        console.error('⚠️ Timeout conectando a Finnhub WebSocket');
        if (finnhubSocket && finnhubSocket.readyState !== WebSocket.OPEN) {
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
        subscribeToSymbols(finnhubSocket, symbols);
        
        // Set up a ping every 30 seconds to keep the connection alive
        pingInterval = setInterval(() => {
          if (finnhubSocket && finnhubSocket.readyState === WebSocket.OPEN) {
            try {
              finnhubSocket.send(JSON.stringify({ type: 'ping' }));
              console.log('📡 Sent ping to Finnhub');
            } catch (error) {
              console.error('Error sending ping:', error);
              // If ping fails, force reconnection
              if (finnhubSocket) {
                finnhubSocket.terminate();
                scheduleReconnect();
              }
            }
          }
        }, 30000); // 30 seconds
        
        // Check subscriptions every 2 minutes
        subscriptionCheckInterval = setInterval(() => {
          checkSubscriptions(finnhubSocket, symbols);
        }, 120000); // 2 minutes
      });

      finnhubSocket.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          
          if (message.type === 'trade' && message.data) {
            // Reset reconnection logic since we're receiving data
            finnhubSubscriptionActive = true;
            
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
          } else if (message.type === 'pong') {
            console.log('📡 Received pong from Finnhub');
          }
        } catch (error) {
          console.error('Error processing Finnhub message:', error);
        }
      });

      finnhubSocket.on('error', (error) => {
        console.error('❌ Finnhub WebSocket error:', error);
        clearTimeout(connectionTimeout); // Limpiar el timeout si ocurre un error
        finnhubSubscriptionActive = false;
        scheduleReconnect();
      });

      finnhubSocket.on('close', (code, reason) => {
        console.warn(`🔴 Finnhub WebSocket closed: ${code} - ${reason}`);
        clearTimeout(connectionTimeout); // Limpiar el timeout si la conexión se cierra
        finnhubSubscriptionActive = false;
        
        // Clear intervals on close
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        
        if (subscriptionCheckInterval) {
          clearInterval(subscriptionCheckInterval);
          subscriptionCheckInterval = null;
        }
        
        scheduleReconnect();
      });
    };

    /**
     * Función auxiliar para programar reconexiones con backoff exponencial
     */
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
          if (finnhubSocket) {
            // Ensure any existing socket is properly closed before reconnecting
            if (finnhubSocket.readyState === WebSocket.OPEN || 
                finnhubSocket.readyState === WebSocket.CONNECTING) {
              finnhubSocket.terminate();
            }
          }
          connectToFinnhub();
        }, delay);
      }
    };

    // Initial connection
    connectToFinnhub();
    
    // Set up a heartbeat to check connection status every 5 minutes
    const heartbeatInterval = setInterval(() => {
      if (finnhubSocket && finnhubSocket.readyState === WebSocket.OPEN) {
        if (!finnhubSubscriptionActive) {
          console.log('❤️‍🩹 Heartbeat detected inactive subscriptions - resubscribing');
          subscribeToSymbols(finnhubSocket, symbols);
        } else {
          console.log('❤️ Heartbeat - Finnhub connection is active');
        }
      } else {
        console.log('💔 Heartbeat - Finnhub connection is not active');
        scheduleReconnect();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
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
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      if (subscriptionCheckInterval) {
        clearInterval(subscriptionCheckInterval);
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    });
    
    return wss;
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    throw error;
  }
};

/**
 * @function stockDetail
 * @description Endpoint de API para obtener datos históricos de una acción específica
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de la URL
 * @param {string} req.params.symbol - Símbolo de la acción
 * @param {Object} req.query - Parámetros de consulta
 * @param {string} req.query.interval - Intervalo de tiempo entre datos
 * @param {string} req.query.range - Rango de tiempo a consultar
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Array} Datos históricos de la acción
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
 * @function getAllStocks
 * @description Endpoint de API para obtener información de todas las acciones disponibles
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Mapa de símbolos de acciones con sus datos completos
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
 * @function getNews
 * @description Endpoint de API para obtener noticias relacionadas con una acción
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.query - Parámetros de consulta
 * @param {string} req.query.symbol - Símbolo de la acción
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Artículos de noticias relacionados con la acción
 */
const getNews = async (req, res) => {
  const { symbol } = req.query;
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

/**
 * @function flushCache
 * @description Función utilitaria para limpiar la caché (desarrollo/pruebas)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Mensaje de confirmación
 */
const flushCache = async (req, res) => {
  try {
    await redisClient.flushAll();
    res.status(200).json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error flushing cache:', error);
    res.status(500).json({ error: 'Error flushing cache' });
  }
};

/**
 * Exportación de los controladores de acciones
 * @exports stockController
 */
module.exports = { 
  initializeWebSocket,
  stockDetail,
  getAllStocks,
  getNews,
  flushCache
};
