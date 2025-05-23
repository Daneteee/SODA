/**
 * @module marketUtils
 * @description Utilidades para verificar el estado del mercado bursátil y mostrar alertas
 */

/**
 * Verifica si el mercado bursátil está cerrado en el momento actual
 * @function isMarketClosed
 * @returns {boolean} Verdadero si el mercado está cerrado, falso si está abierto
 * @description Comprueba si el mercado está cerrado basándose en el día de la semana y la hora actual
 */
export const isMarketClosed = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  // El mercado está cerrado los fines de semana
  if (day === 0 || day === 6) return true;

  const marketOpen = 15 * 60 + 30; // 15:30 
  const marketClose = 22 * 60;     // 22:00 

  return currentTime < marketOpen || currentTime >= marketClose;
};

/**
 * Componente que muestra una alerta cuando el mercado está cerrado
 * @function MarketClosedAlert
 * @returns {JSX.Element} Componente de alerta con información sobre el horario del mercado
 * @description Muestra una alerta visual con el horario de operación del mercado
 */
export const MarketClosedAlert = () => (
  <div className="alert alert-warning mb-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    <div>
      <h3 className="font-bold">Mercado Cerrado</h3>
      <div className="text-sm">El mercado está cerrado. Horario de operación: Lunes a Viernes de 15:30 a 22:00 ET</div>
    </div>
  </div>
); 