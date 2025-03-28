"use client"
import React, { useState } from "react";
import { useWebSocket } from "@/context/WebSocketProvider";
import StatsCard from "@/components/StatsCard";
import StockRow from "@/components/StockRow";
import { useUserData } from "@/hooks/useUserData";

const DashboardMarketPage = () => {
  const { stockData } = useWebSocket();
  const { credit, userStocks, transactionsCount } = useUserData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStocks = stockData.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderStockLogo = (stock: { symbol: string; company?: { logo?: string } }) => {
    if (stock.company?.logo) {
      return (
        <div className="avatar">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src={stock.company.logo} alt={`${stock.symbol} logo`} />
          </div>
        </div>
      );
    }
    return (
      <div className="avatar placeholder">
        <div className="bg-neutral text-neutral-content rounded-full w-8">
          <span>{stock.symbol.substring(0, 2)}</span>
        </div>
      </div>
    );
  };

  const totalStockValue = userStocks.reduce((acc, stock: { price?: number; purchasePrice?: number; quantity?: number }) => {
    const currentPrice = stock.price ?? stock.purchasePrice ?? 0;
    return acc + currentPrice * (stock.quantity ?? 0);
  }, 0);

  const portfolioValue = credit + totalStockValue;
  const totalInitialStockValue = userStocks.reduce((acc, stock: { purchasePrice?: number; quantity?: number }) => {
    return acc + (stock.purchasePrice ?? 0) * (stock.quantity ?? 0);
  }, 0);
  const gain = totalStockValue - totalInitialStockValue;
  const gainPercent = totalInitialStockValue > 0 ? (gain / totalInitialStockValue) * 100 : 0;

  return (
    <main className="flex-1 p-6 bg-base-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Portfolio Value" value={`$${portfolioValue.toFixed(2)}`} description="Valor actualizado" />
        <StatsCard title="Ganancias" value={gain >= 0 ? `+$${gain.toFixed(2)}` : `-$${Math.abs(gain).toFixed(2)}`} description={gainPercent >= 0 ? `↗︎ ${gainPercent.toFixed(2)}%` : `↘︎ ${Math.abs(gainPercent).toFixed(2)}%`} />
        <StatsCard title="Operaciones" value={transactionsCount} />
        <StatsCard title="Balance" value={`$${credit.toFixed(2)}`} />
      </div>

      <div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <input
      className="input input-bordered"
      placeholder="Buscar símbolo o empresa..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    {/* Contenedor con barra de desplazamiento */}
    <div className="overflow-y-auto max-h-96">
      <table className="table table-zebra">
        <tbody>
          {filteredStocks.map((stock) => (
            <StockRow key={stock.symbol} stock={stock} renderStockLogo={renderStockLogo} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
    </main>
  );
};

export default DashboardMarketPage;