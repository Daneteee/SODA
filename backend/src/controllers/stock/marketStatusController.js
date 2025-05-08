const { isMarketOpen } = require('../../utils/marketHours');

const getMarketStatus = async (req, res) => {
  try {
    const marketOpen = isMarketOpen();
    res.json({ isOpen: marketOpen });
  } catch (error) {
    console.error('Error al verificar estado del mercado:', error);
    res.status(500).json({ error: 'Error al verificar estado del mercado' });
  }
};

module.exports = { getMarketStatus }; 