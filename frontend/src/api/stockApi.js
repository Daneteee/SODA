// Obtenim l'històric d'una acció
export const fetchStockData = async (symbol, interval = '5m', range = '1d') => {
    const url = `http://localhost:4000/api/market/${symbol}/?interval=${interval}&range=${range}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Error obteniendo datos históricos");
    }
    return res.json();
  };
  
// Obtenim les dades de l'usuari autenticat i les seves accions
export const fetchUserData = async () => {
  const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
    method: "GET",
    credentials: "include",
  });
  if (!profileResponse.ok) {
    throw new Error("Error obteniendo datos del usuario");
  }
  const profileData = await profileResponse.json();

  // Obtenim les accions de l'usuari
  const stocksResponse = await fetch("http://localhost:4000/api/user/stocks", {
    method: "GET",
    credentials: "include",
  });
  if (!stocksResponse.ok) {
    throw new Error("Error obteniendo acciones del usuario");
  }
  const stocksData = await stocksResponse.json();

  return { credit: profileData.credit, stocks: stocksData.stocks || [] };
};