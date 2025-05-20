import { useState } from "react";

export function useStockTransactions({ stock, positionShares, loadUserData }) {
  const [amount, setAmount] = useState(0);
  const [shares, setShares] = useState(0);

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    setAmount(value);
    if (stock?.price && !isNaN(value)) {
      setShares(value / stock.price);
    }
  };

  const handleSharesChange = (e) => {
    const value = e.target.value;
    setShares(value === '' ? 0 : parseFloat(value));
    if (stock?.price && value !== '') {
      setAmount(parseFloat(value) * stock.price);
    } else {
      setAmount(0);
    }
  };

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