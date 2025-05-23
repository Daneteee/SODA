/**
 * @module useUserPosition
 * @description Hook personalizado para calcular la posición del usuario en una acción específica
 * @requires react
 */

import { useState, useEffect } from "react";

/**
 * Hook personalizado para calcular la posición del usuario en una acción específica
 * @function useUserPosition
 * @param {Object} stock - Datos actuales de la acción
 * @param {Array} userStocks - Lista de acciones que posee el usuario
 * @param {string} symbol - Símbolo de la acción a analizar
 * @returns {Object} Posición del usuario con valores calculados
 */
export function useUserPosition(stock, userStocks, symbol) {
  const [position, setPosition] = useState({
    total: 0,
    performance: 0,
    performancePercent: 0,
    shares: 0,
    buyIn: 0,
    portfolio: 0,
    price: 0, // Inicializar 'price'
  });

  /**
   * Efecto que calcula la posición del usuario cuando cambian los datos
   * @effect
   * @description Calcula el valor actual, rendimiento, porcentaje del portafolio y otros datos de la posición
   */
  useEffect(() => {
    // Si no hay stock o si userStocks no está definido, reiniciar la posición
    if (!stock || !userStocks) {
      setPosition({
        total: 0,
        performance: 0,
        performancePercent: 0,
        shares: 0,
        buyIn: 0,
        portfolio: 0,
        price: stock?.price || 0,
      });
      return;
    }

    // Si userStocks es un array vacío, significa que el usuario no tiene acciones
    if (userStocks.length === 0) {
      setPosition({
        total: 0,
        performance: 0,
        performancePercent: 0,
        shares: 0,
        buyIn: 0,
        portfolio: 0,
        price: stock?.price || 0,
      });
      return;
    }

    const userPosition = userStocks.find((s) => s.symbol === symbol);

    if (userPosition && userPosition.quantity > 0) {
      const currentValue = userPosition.quantity * stock.price;
      const initialValue = userPosition.quantity * userPosition.purchasePrice;
      const performance = currentValue - initialValue;
      const performancePercent =
        initialValue > 0 ? (performance / initialValue) * 100 : 0;

      const totalPortfolioValue = userStocks.reduce((total, s) => {
        const currentStockPrice =
          s.symbol === symbol ? stock.price : s.purchasePrice;
        return total + s.quantity * currentStockPrice;
      }, 0);

      const portfolioPercent =
        totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;

      setPosition({
        total: currentValue,
        performance,
        performancePercent,
        shares: userPosition.quantity,
        buyIn: userPosition.purchasePrice,
        portfolio: portfolioPercent,
        price: stock.price, // Asignar el precio actual del stock
      });
    } else {
      // Si no hay posición o la cantidad es 0, mostrar que no hay acciones
      setPosition({
        total: 0,
        performance: 0,
        performancePercent: 0,
        shares: 0,
        buyIn: 0,
        portfolio: 0,
        price: stock?.price || 0, // Mantener el precio actual del stock
      });
    }
  }, [stock?.price, userStocks, symbol]);

  return position;
}