export const isMarketClosed = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  // El mercado está cerrado los fines de semana
  if (day === 0 || day === 6) return true;
  // Horario del mercado: 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
  const marketOpen = 14 * 60 + 30; // 14:30 UTC
  const marketClose = 21 * 60;     // 21:00 UTC

  return currentTime < marketOpen || currentTime >= marketClose;
};

export const MarketClosedAlert = () => (
  <div className="alert alert-warning mb-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    <div>
      <h3 className="font-bold">Mercado Cerrado</h3>
      <div className="text-sm">El mercado está cerrado. Horario de operación: Lunes a Viernes de 9:30 AM a 4:00 PM ET (14:30 a 21:00 UTC)</div>
    </div>
  </div>
); 