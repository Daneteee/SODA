/**
 * @module stockApi
 * @description Módulo para realizar peticiones a la API relacionadas con acciones y datos del usuario
 */

/**
 * Obtiene los datos históricos de una acción
 * @function fetchStockData
 * @async
 * @param {string} symbol - Símbolo de la acción
 * @param {string} interval - Intervalo de tiempo entre datos (por defecto '5m')
 * @param {string} range - Rango de tiempo para los datos históricos (por defecto '1d')
 * @returns {Promise<Array>} Datos históricos de la acción
 * @throws {Error} Si hay un problema al obtener los datos
 */
export const fetchStockData = async (symbol, interval = '5m', range = '1d') => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/market/${symbol}/?interval=${interval}&range=${range}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Error obteniendo datos históricos");
    }
    return res.json();
  };
  
/**
 * Obtiene los datos del usuario autenticado y sus acciones
 * @function fetchUserData
 * @async
 * @returns {Promise<Object>} Objeto con el crédito del usuario y sus acciones
 * @throws {Error} Si hay un problema al obtener los datos del usuario o sus acciones
 */
export const fetchUserData = async () => {
  const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
    method: "GET",
    credentials: "include",
  });
  if (!profileResponse.ok) {
    throw new Error("Error obteniendo datos del usuario");
  }
  const profileData = await profileResponse.json();

  // Obtenim les accions de l'usuari
  const stocksResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/stocks`, {
    method: "GET",
    credentials: "include",
  });
  if (!stocksResponse.ok) {
    throw new Error("Error obteniendo acciones del usuario");
  }
  const stocksData = await stocksResponse.json();

  return { credit: profileData.credit, stocks: stocksData.stocks || [] };
};