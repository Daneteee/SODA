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

  // El mercado está abierto de 9:30 AM a 4:00 PM ET (13:30 a 20:00 UTC)
  // Nota: Esto es una simplificación. En realidad, hay horarios especiales para días festivos
  // y el horario de verano puede afectar esto
  return time >= 2130 && time < 2000;
};

module.exports = { isMarketOpen }; 