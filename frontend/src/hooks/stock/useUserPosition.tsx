import { useState, useEffect } from "react";

interface Position {
  total: number;
  performance: number;
  performancePercent: number;
  shares: number;
  buyIn: number;
  portfolio: number;
  price: number; // Agregar la propiedad 'price'
}

export function useUserPosition(stock: any, userStocks: any[], symbol: string) {
  const [position, setPosition] = useState<Position>({
    total: 0,
    performance: 0,
    performancePercent: 0,
    shares: 0,
    buyIn: 0,
    portfolio: 0,
    price: 0, // Inicializar 'price'
  });

  useEffect(() => {
    if (!stock || !userStocks.length) return;

    const userPosition = userStocks.find((s) => s.symbol === symbol);

    if (userPosition) {
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
      setPosition({
        total: 0,
        performance: 0,
        performancePercent: 0,
        shares: 0,
        buyIn: 0,
        portfolio: 0,
        price: 0, // Establecer 'price' en 0 si no hay posición
      });
    }
  }, [stock, userStocks, symbol]);

  return position;
}