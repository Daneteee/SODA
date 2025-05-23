/**
 * @module useStockTransactions
 * @description Hook personalizado para gestionar transacciones de compra y venta de acciones
 * @requires react
 */

import { useState } from "react";

/**
 * Hook personalizado para gestionar transacciones de compra y venta de acciones
 * @function useStockTransactions
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.stock - Datos de la acción seleccionada
 * @param {number} options.positionShares - Cantidad de acciones que posee el usuario
 * @param {Function} options.loadUserData - Función para recargar los datos del usuario
 * @returns {Object} Estado y funciones para gestionar transacciones
 */
export function useStockTransactions({ stock, positionShares, loadUserData }) {
  const [amount, setAmount] = useState(0);
  const [shares, setShares] = useState(0);

  /**
   * Maneja el cambio en el campo de monto
   * @function handleAmountChange
   * @param {Event} e - Evento del input
   * @description Actualiza el monto y calcula automáticamente la cantidad de acciones equivalente
   */
  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    setAmount(value);
    if (stock?.price && !isNaN(value)) {
      setShares(value / stock.price);
    }
  };

  /**
   * Maneja el cambio en el campo de cantidad de acciones
   * @function handleSharesChange
   * @param {Event} e - Evento del input
   * @description Actualiza la cantidad de acciones y calcula automáticamente el monto equivalente
   */
  const handleSharesChange = (e) => {
    const value = e.target.value;
    setShares(value === '' ? 0 : parseFloat(value));
    if (stock?.price && value !== '') {
      setAmount(parseFloat(value) * stock.price);
    } else {
      setAmount(0);
    }
  };

  /**
   * Procesa la compra de acciones
   * @function handleBuyStock
   * @async
   * @description Envía una solicitud al servidor para comprar la cantidad especificada de acciones
   */
  const handleBuyStock = async () => {
    console.log("ACcion a comprar", stock);
    if (!stock || !stock.price || shares <= 0) return;
    const purchaseData = {
      symbol: stock.symbol,
      quantity: shares,
      purchasePrice: stock.price,
    };
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/market/buy", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al comprar acción:", errorData);
      } else {
        const result = await response.json();
        console.log("Compra realizada exitosamente:", result);
        await loadUserData();
        setAmount(0);
        setShares(0);
      }
    } catch (error) {
      console.error("Error en la compra de acciones:", error);
    }
  };

  /**
   * Procesa la venta de acciones
   * @function handleSellStock
   * @async
   * @description Envía una solicitud al servidor para vender la cantidad especificada de acciones
   */
  const handleSellStock = async () => {
    if (!stock || !stock.price || shares <= 0) return;
    const sellData = {
      symbol: stock.symbol,
      quantity: shares,
      sellPrice: stock.price,
    };
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/market/sell", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sellData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al vender acción:", errorData);
      } else {
        const result = await response.json();
        console.log("Venta realizada exitosamente:", result);
        // Forzar una actualización completa de los datos del usuario
        await loadUserData();
        setAmount(0);
        setShares(0);
        
        // Verificar si se vendieron todas las acciones
        const isSellAll = Math.abs(positionShares - shares) < 0.000001;
        if (isSellAll) {
          // Forzar una actualización adicional para asegurar que la UI refleje que no hay acciones
          setTimeout(() => loadUserData(), 100);
        }
      }
    } catch (error) {
      console.error("Error en la venta de acciones:", error);
    }
  };

  /**
   * Configura la venta de un porcentaje de las acciones en posesión
   * @function handleSellPercentage
   * @param {number} percent - Porcentaje de acciones a vender (0-1)
   * @description Calcula y establece la cantidad de acciones y monto equivalente según el porcentaje
   */
  const handleSellPercentage = (percent) => {
    if (positionShares) {
      const sellShares = positionShares * percent;
      setShares(sellShares);
      if (stock?.price) {
        setAmount(sellShares * stock.price);
      }
    }
  };

  return {
    amount,
    shares,
    handleAmountChange,
    handleSharesChange,
    handleBuyStock,
    handleSellStock,
    handleSellPercentage,
  };
}