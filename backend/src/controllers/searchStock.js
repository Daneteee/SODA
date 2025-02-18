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
  
  module.exports = { searchSymbol };
  