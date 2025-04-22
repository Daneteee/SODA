"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useWebSocket } from "@/context/WebSocketProvider";
import StatsCards from "@/components/StatsCards";
import type { Stock } from "./page";

interface UserStock {
  symbol: string;
  purchasePrice: number;
  quantity: number;
}

interface Props {
  initialApiStocks: Stock[];
  initialCredit: number;
  initialUserStocks: UserStock[];
}

const DashboardMarketClient: React.FC<Props> = ({
  initialApiStocks,
  initialCredit,
  initialUserStocks,
}) => {
  const { connected, stockData: wsStockData } = useWebSocket();
  const router = useRouter();

  // Estados locales
  const [apiStocks] = useState<Stock[]>(initialApiStocks);
  const [credit] = useState<number>(initialCredit);
  const [userStocks] = useState<UserStock[]>(initialUserStocks);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Combinar con datos WS
  const mergedStocks = apiStocks.map((stock) => {
    const wsStock = wsStockData.find((s) => s.symbol === stock.symbol);
    return {
      ...stock,
      price: wsStock?.price ?? stock.firstPriceToday,
    };
  });

  const getRealtimePrice = (symbol: string): number => {
    const ws = wsStockData.find((s) => s.symbol === symbol);
    return ws?.price ?? 0;
  };

  // Filtrar
  const filteredStocks = mergedStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Cálculos de usuario
  const totalStockValue = userStocks.reduce((acc, stk) => {
    const price = getRealtimePrice(stk.symbol) || stk.purchasePrice;
    return acc + price * stk.quantity;
  }, 0);
  const totalInitialValue = userStocks.reduce(
    (acc, stk) => acc + stk.purchasePrice * stk.quantity,
    0
  );
  const gain = totalStockValue - totalInitialValue;
  const gainPercent = totalInitialValue > 0 ? (gain / totalInitialValue) * 100 : 0;
  const portfolioValue = credit + totalStockValue;

  // Render del logo
  const renderStockLogo = (stock: Stock) => {
    if (stock.logo) {
      return (
        <div className="avatar">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={stock.logo}
              alt={`${stock.symbol} logo`}
              width={32}
              height={32}
              className="object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
                t.onerror = null;
              }}
            />
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

  return (
    <main className="flex-1 p-6 bg-base-200">
      <StatsCards
        portfolioValue={portfolioValue}
        gain={gain}
        gainPercent={gainPercent}
        transactionsCount={0 /* ya lo muestra el server */}
        credit={credit}
      />

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Mercado en Vivo</h2>
              {connected ? (
                <span className="badge badge-accent badge-outline gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  Conectado
                </span>
              ) : (
                <span className="badge badge-error gap-1">Desconectado</span>
              )}
            </div>
            <div className="join">
              <input
                className="input input-bordered join-item w-64"
                placeholder="Buscar símbolo o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn join-item btn-primary">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {filteredStocks.length === 0 ? (
            <div className="alert alert-info">
              <span>No se encontraron acciones.</span>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[450px]">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th>Activo</th>
                    <th>Precio Actual</th>
                    <th>Cambio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => {
                    const change = stock.firstPriceToday
                      ? ((stock.price! - stock.firstPriceToday) /
                          stock.firstPriceToday) *
                        100
                      : 0;
                    const isPositive = change >= 0;

                    return (
                        <tr
                            key={stock.symbol}
                            className="hover:bg-base-200 transition-colors duration-200 cursor-pointer"
                            onClick={() => {
                            if (typeof window !== "undefined") {
                                sessionStorage.setItem("selectedStock", JSON.stringify(stock));
                            }
                            router.push(`/dashboard/market/${stock.symbol}`);
                            }}
                        >
                        <td>
                          <div className="flex items-center gap-3">
                            {renderStockLogo(stock)}
                            <div>
                              <div className="font-bold">{stock.name || stock.symbol}</div>
                              <div className="text-sm opacity-50">{stock.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono font-bold">
                          {stock.price !== undefined ? `$${stock.price}` : "N/A"}
                        </td>
                        <td>
                          <div className={`flex items-center gap-1 font-bold ${
                            isPositive ? "text-success" : "text-error"
                          }`}>
                            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {stock.firstPriceToday ? `${change.toFixed(2)}%` : "N/A"}
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-success text-white mr-2">Comprar</button>
                          <button className="btn btn-sm btn-error text-white">Vender</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default DashboardMarketClient;
