import { useState } from "react";

interface UseStockTransactionsProps {
  stock: any;
  credit: number;
  positionShares: number;
  loadUserData: () => Promise<void>;
}

export function useStockTransactions({
  stock,
  positionShares,
  loadUserData,
}: UseStockTransactionsProps) {
  const [amount, setAmount] = useState(0);
  const [shares, setShares] = useState(0);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(value);
    if (stock?.price && !isNaN(value)) {
      setShares(value / stock.price);
    }
  };

  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setShares(value);
    if (stock?.price && !isNaN(value)) {
      setAmount(value * stock.price);
    }
  };

  const handleBuyStock = async () => {
    if (!stock || !stock.price || shares <= 0) return;
    const purchaseData = {
      symbol: stock.symbol,
      quantity: shares,
      purchasePrice: stock.price,
    };
    try {
      const response = await fetch("http://localhost:4000/api/market/buy", {
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
      const response = await fetch("http://localhost:4000/api/market/sell", {
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
        await loadUserData();
        setAmount(0);
        setShares(0);
      }
    } catch (error) {
      console.error("Error en la venta de acciones:", error);
    }
  };

  const handleSellPercentage = (percent: number) => {
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