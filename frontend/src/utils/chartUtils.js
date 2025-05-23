export const getInterval = (period) => {
  /**
   * Obtiene el intervalo de tiempo para los datos históricos
   * @function getInterval
   * @param {string} period - Período de tiempo para los datos históricos
   * @returns {string} Intervalo de tiempo para los datos históricos
   */
  switch (period) {
    case "1D":
      return "5m";
    case "1W":
      return "1h";
    case "1M":
      return "1d";
    case "6M":
      return "1d";
    case "1Y":
      return "1d";
    case "5Y":
      return "1wk";
    default:
      return "5m";
  }
};

export const getRange = (period) => {
  /**
   * Obtiene el rango de tiempo para los datos históricos
   * @function getRange
   * @param {string} period - Período de tiempo para los datos históricos
   * @returns {string} Rango de tiempo para los datos históricos
   */
  switch (period) {
    case "1D":
      return "1d";
    case "1W":
      return "5d";
    case "1M":
      return "1mo";
    case "6M":
      return "6mo";
    case "1Y":
      return "1y";
    case "5Y":
      return "5y";
    default:
      return "1d";
  }
};