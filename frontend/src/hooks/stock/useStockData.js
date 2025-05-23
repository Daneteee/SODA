/**
 * @module useStockData
 * @description Hook personalizado para obtener y gestionar datos de acciones en tiempo real y datos históricos
 * @requires react
 * @requires stockApi
 * @requires WebSocketProvider
 */

import { useState, useEffect } from "react";
import { fetchStockData, fetchUserData } from "@/api/stockApi";
import { useWebSocket } from "@/context/WebSocketProvider";

/**
 * Hook personalizado para gestionar datos de una acción específica, combinando datos en tiempo real e históricos
 * @function useStockData
 * @param {string} symbol - Símbolo de la acción para la que se desean obtener datos
 * @returns {Object} Estado y funciones para gestionar los datos de la acción
 */
export function useStockData(symbol) {
  const { stockData } = useWebSocket(); // Obtén los datos del WebSocket
  const [stock, setStock] = useState(null); // Estado para los datos de la acción
  const [loading, setLoading] = useState(true); // Estado de carga
  const [userStocks, setUserStocks] = useState([]); // Estado para las acciones del usuario
  const [credit, setCredit] = useState(0); // Estado para el crédito del usuario
  const [dataLoaded, setDataLoaded] = useState({ stock: false, user: false }); // Estado para sincronizar la carga

  /**
   * Carga los datos históricos de la acción
   * @function loadStockData
   * @async
   * @param {string} interval - Intervalo de tiempo entre datos (por defecto "5m")
   * @param {string} range - Rango de tiempo para los datos históricos (por defecto "1d")
   * @description Obtiene datos históricos de la acción y actualiza el estado
   */
  const loadStockData = async (interval = "5m", range = "1d") => {
    try {
      const historyData = await fetchStockData(symbol, interval, range);
      const previousPrice = historyData[0]?.close || 0; // Obtiene el primer precio de cierre

      setStock((prev) => ({
        ...prev,
        history: historyData,
        previousPrice: previousPrice,
      }));
      setDataLoaded((prev) => ({ ...prev, stock: true })); // Marcar que los datos del stock están cargados
    } catch (error) {
      console.error("Error al obtener datos del stock:", error);
    }
  };

  /**
   * Carga los datos del usuario, incluyendo crédito y acciones en posesión
   * @function loadUserData
   * @async
   * @description Obtiene los datos del usuario desde el servidor y actualiza el estado
   */
  const loadUserData = async () => {
    try {
      const { credit, stocks } = await fetchUserData();
      setCredit(credit);
      setUserStocks(stocks);
      setDataLoaded((prev) => ({ ...prev, user: true })); // Marcar que los datos del usuario están cargados
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  };

  // useEffect para cargar los datos históricos al montar el componente o cambiar el símbolo
  useEffect(() => {
    if (!symbol) return;

    setLoading(true); // Establece loading en true antes de cargar datos
    setDataLoaded({ stock: false, user: false }); // Reinicia el estado de carga
    loadStockData();
    loadUserData();
  }, [symbol]);

  // useEffect para actualizar los datos en tiempo real desde el WebSocket
  useEffect(() => {
    if (!symbol || !stockData) return;

    const realtimeTrade = stockData.find((t) => t.symbol === symbol);
    if (realtimeTrade) {
      setStock((prevStock) => ({
        ...prevStock,
        symbol: realtimeTrade.symbol,
        price: realtimeTrade.price,
        image: realtimeTrade.company?.logo,
        company: realtimeTrade.company,
        priceChange: stock?.previousPrice
          ? ((realtimeTrade.price - stock.previousPrice) / stock.previousPrice) * 100
          : 0,
        volume: realtimeTrade.volume,
        lastUpdate: new Date(realtimeTrade.timestamp).toLocaleTimeString(),
      }));
    }
  }, [stockData, symbol]);

  // useEffect para sincronizar el estado de loading
  useEffect(() => {
    if (dataLoaded.stock && dataLoaded.user) {
      setLoading(false); // Cambia loading a false solo cuando ambos datos estén cargados
    }
  }, [dataLoaded]);

  return { stock, loading, userStocks, credit, loadStockData, loadUserData };
}