"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Stock } from "@/types/stock";
import { Search, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useWebSocket } from "@/context/WebSocketProvider"; 

const MarketPage = () => {
  const { connected, stockData } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Filtrar acciones según búsqueda
  const filteredStocks: Stock[] = stockData.filter((stock: Stock) =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Función para renderizar el logo o avatar
  const renderStockLogo = (stock: Stock) => {
    if (stock.company?.logo) {
      return (
        <div className="avatar">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image 
              src={stock.company.logo} 
              alt={`${stock.symbol} logo`} 
              width={32} 
              height={32}
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.onerror = null;
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
    <div className="p-6 bg-base-200 min-h-screen">
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
              <span>Esperando datos de transacciones...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-base-200">
                    <th>Activo</th>
                    <th>Precio Actual</th>
                    <th>Cambio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-base-200 transition-colors duration-200 cursor-pointer"
                      onClick={() => router.push(`/market/${stock.symbol}`)}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          {renderStockLogo(stock)}
                          <div>
                            <div className="font-bold">{stock.name}</div>
                            <div className="text-sm opacity-50">{stock.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono font-bold">
                        {stock.price !== undefined ? `$${stock.price.toFixed(2)}` : "N/A"}
                      </td>
                      <td>
                        <div className={`flex items-center gap-1 font-bold ${stock.priceChange !== undefined && stock.priceChange >= 0 ? "text-success" : "text-error"}`}>
                          {stock.priceChange !== undefined && stock.priceChange >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {stock.priceChange !== undefined ? stock.priceChange.toFixed(2) : "N/A"}%
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-success text-white mr-2">Comprar</button>
                        <button className="btn btn-sm btn-error text-white">Vender</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
