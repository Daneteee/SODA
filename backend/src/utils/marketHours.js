const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 100 + minute;

  // El mercado está cerrado los fines de semana
  if (day === 0 || day === 6) {
    return false;
  }

  // El mercado está abierto de 15:30 AM a 22:00 PM
  return time >= 1530 && time < 2200;
};

module.exports = { isMarketOpen }; 