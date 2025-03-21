"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Stock } from "@/types/stock";
import { Search, TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";

const MarketPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const router = useRouter();

  // Inicializar WebSocket
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:4000");

    ws.current.onopen = () => {
      console.log("✅ Conexión WebSocket establecida");
      setConnected(true);
      setLoading(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'trade' && Array.isArray(message.data)) {
          updateStockData(message.data);
        }
      } catch (error) {
        console.error("Error al procesar mensaje:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("🔴 Conexión WebSocket cerrada");
      setConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("❌ Error en WebSocket:", error);
      setError("Error al conectar con datos en tiempo real");
      setLoading(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Actualizar datos de acciones con información en tiempo real
  const updateStockData = (tradeData: any[]) => {
    setStocks((prevStocks) => {
      const updatedStocks = [...prevStocks];

      tradeData.forEach((trade) => {
        const stockIndex = updatedStocks.findIndex((s) => s.symbol === trade.symbol);

        if (stockIndex !== -1) {
          // Actualizar acción existente
          const currentStock = updatedStocks[stockIndex];
          const previousPrice = currentStock.price;
          const priceChange = previousPrice ? ((trade.price - previousPrice) / previousPrice) * 100 : 0;

          updatedStocks[stockIndex] = {
            ...currentStock,
            previousPrice,
            price: trade.price,
            priceChange,
            volume: trade.volume,
            lastUpdate: new Date(trade.timestamp).toLocaleTimeString(),
            conditions: trade.conditions || [],
            company: trade.company || currentStock.company, // Mantener info de MongoDB
          };
        } else {
          // Añadir nueva acción
          const newStock: Stock = {
            symbol: trade.symbol,
            name: trade.company?.name || trade.symbol, // Si tiene nombre, úsalo
            price: trade.price || 0,
            previousPrice: null,
            priceChange: 0,
            volume: trade.volume || 0,
            lastUpdate: new Date(trade.timestamp).toLocaleTimeString(),
            conditions: trade.conditions || [],
            company: trade.company || null,
          };

          updatedStocks.push(newStock);
        }
      });
      return updatedStocks;
    });
  };

  // Filtrar acciones según búsqueda
  const filteredStocks = stocks.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Función para renderizar el logo o avatar
  const renderStockLogo = (stock: Stock) => {
    // Si hay logo disponible, mostrar la imagen
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
                // Si hay error de carga, mostrar avatar con iniciales
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.onerror = null;
              }}
            />
          </div>
        </div>
      );
    }

    // Si no hay logo disponible, mostrar avatar con iniciales
    return (
      <div className="avatar placeholder">
        <div className="bg-neutral text-neutral-content rounded-full w-8">
          <span>{stock.symbol.substring(0, 2)}</span>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin h-10 w-10 text-primary" />
          <p className="text-lg">Conectando a datos de mercado en vivo...</p>
        </div>
      </div>
    );

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

          {stocks.length === 0 ? (
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
                      <td className="font-mono font-bold">${stock.price.toFixed(2)}</td>
                      <td>
                        <div className={`flex items-center gap-1 font-bold ${stock.priceChange >= 0 ? "text-success" : "text-error"}`}>
                          {stock.priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {stock.priceChange.toFixed(2)}%
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