// Alpha Vantage API URL and API key
const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query';
const API_KEY = "X33ZX7XZ1KT3FLZ5"; // Replace with your actual API key
const axios = require('axios');

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
module.exports = { getStockData, searchSymbol };