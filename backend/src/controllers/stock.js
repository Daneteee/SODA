// Alpha Vantage API URL and API key
const WebSocket = require('ws');
const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query';
const API_KEY = "X33ZX7XZ1KT3FLZ5"; // Replace with your actual API key
const axios = require('axios');

// WebSocket connections store
let wsClients = new Set();

// Helper function to convert company name to stock symbol
const getSymbolFromName = (name) => {
  const companySymbols = {
    'Reliance Industries': 'RELIANCE.BSE',
    'Tata Capital': 'TATACAPITAL.BSE',
    'Apple': 'AAPL',
    'Google': 'GOOG',
    // Add more company-name to symbol mappings as needed
  };
  return companySymbols[name.toLowerCase()] || null;  // Return symbol or null if not found
};

// Initialize WebSocket connection with Finnhub
const initializeWebSocket = (server) => {
  // Create WebSocket server for frontend clients
  const wss = new WebSocket.Server({ server });
  
  // Connect to Finnhub WebSocket
  const finnhubSocket = new WebSocket('wss://ws.finnhub.io?token=cv7g9fhr01qpecifqecgcv7g9fhr01qpecifqed0');

  finnhubSocket.on('open', () => {
    console.log('Connected to Finnhub WebSocket');
    // Subscribe to stock symbols
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'FB', 'TSLA', 'NFLX', 'NVDA', 'BABA', 'V', 'JPM', 'JNJ', 'WMT', 'PG', 'DIS', 'MA', 'HD'];
    symbols.forEach(symbol => {
      finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
    });
  });

  finnhubSocket.on('message', (data) => {
    console.log('Data received from Finnhub:', data.toString());
    
    // Forward data to all connected frontend clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });

  // Handle new client connections
  wss.on('connection', (ws) => {
    console.log('New client connected to WebSocket server');
    wsClients.add(ws);
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket server');
      wsClients.delete(ws);
    });
  });

  return wss;
};

// Controlador para obtener el precio actual
const getStockData = async (req, res) => {
  let { symbol } = req.params; // Obtener el símbolo de la acción desde los parámetros de la URL

  // Verificar si es un nombre de empresa y convertirlo a símbolo
  if (!symbol.match(/^[A-Za-z0-9.]+$/)) {
    symbol = getSymbolFromName(symbol);
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company name or symbol.',
      });
    }
  }

  symbol = symbol.toUpperCase(); // Asegurarse de que el símbolo esté en mayúsculas

  try {
    // Realizar una solicitud a la API de Alpha Vantage para obtener el precio actual
    const response = await axios.get(ALPHA_VANTAGE_API_URL, {
      params: {
        function: 'GLOBAL_QUOTE', // Endpoint para obtener el precio actual
        symbol: symbol, // Símbolo de la acción
        apikey: API_KEY, // Tu clave API
      },
    });

    // Comprobar si la respuesta contiene datos válidos
    if (response.data['Global Quote']) {
      const stockData = response.data['Global Quote'];

      return res.status(200).json({
        success: true,
        data: {
          symbol: stockData['01. symbol'],
          open: stockData['02. open'],
          high: stockData['03. high'],
          low: stockData['04. low'],
          price: stockData['05. price'], // Precio actual de la acción
          volume: stockData['06. volume'],
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch stock price.',
      });
    }
  } catch (error) {
    console.error('Error fetching stock price:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching stock price from Alpha Vantage API.',
      error: error.message,
    });
  }
};

const searchSymbol = async (req, res) => {
  // Acceder al parámetro de la URL (companyName)
  const companyName = req.params.companyName;

  try {
    const response = await axios.get(ALPHA_VANTAGE_API_URL, {
      params: {
        function: 'SYMBOL_SEARCH',  // Endpoint para búsqueda de símbolos
        keywords: companyName,     // Nombre de la empresa para buscar
        apikey: API_KEY,           // Tu clave API
      },
    });

    if (response.data.bestMatches && response.data.bestMatches.length > 0) {
      // Responder con los símbolos encontrados
      return res.status(200).json({
        success: true,
        data: response.data.bestMatches.map((match) => ({
          name: match['2. name'],      // Nombre de la empresa
          symbol: match['1. symbol'],  // Símbolo de la acción
        })),
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No matching symbols found.',
      });
    }
  } catch (error) {
    console.error('Error buscando símbolos:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching data from Alpha Vantage API.',
      error: error.message,
    });
  }
};

const getAllStockData = async (req, res) => {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
  try {
    const promises = symbols.map(symbol => axios.get(ALPHA_VANTAGE_API_URL, {
      params: { function: 'GLOBAL_QUOTE', symbol, apikey: API_KEY },
    }));
    const responses = await Promise.all(promises);
    const data = responses.map(response => response.data['Global Quote']);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching all stock data.', error: error.message });
  }
};

module.exports = { getStockData, searchSymbol, getAllStockData, initializeWebSocket };