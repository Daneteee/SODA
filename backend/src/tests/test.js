 
const axios = require('axios');

const SYMBOL = 'AAPL'; // Cambia por la acción que quieras
const URL = `https://query1.finance.yahoo.com/v8/finance/chart/${SYMBOL}?interval=5m&range=1d`;

axios.get(URL)
  .then(response => {
    const data = response.data.chart.result[0];

    if (!data || !data.timestamp) {
      console.error('No se encontraron datos');
      return;
    }

    const timestamps = data.timestamp;
    const quotes = data.indicators.quote[0];

    const historial = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString(), // Formato completo con hora
      open: quotes.open[index],
      high: quotes.high[index],
      low: quotes.low[index],
      close: quotes.close[index],
      volume: quotes.volume[index]
    }));

    console.log(historial);
  })
  .catch(error => console.error('Error:', error));
  