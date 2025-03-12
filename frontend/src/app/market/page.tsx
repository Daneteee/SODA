"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FinnhubTrade, Stock } from "@/types/stock";

import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Clock,
} from "lucide-react";

const MarketPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  
  // Map para almacenar nombre de empresa por símbolo
  const companyNames: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'FB': 'Meta Platforms Inc.',
    'TSLA': 'Tesla Inc.',
    'NFLX': 'Netflix Inc.',
    'NVDA': 'NVIDIA Corporation',
    'BABA': 'Alibaba Group',
    'V': 'Visa Inc.',
    'JPM': 'JPMorgan Chase & Co.',
    'JNJ': 'Johnson & Johnson',
    'WMT': 'Walmart Inc.',
    'PG': 'Procter & Gamble Co.',
    'DIS': 'Walt Disney Co.',
    'MA': 'Mastercard Inc.',
    'HD': 'Home Depot Inc.'
  };

  // Traducción de códigos de condición
  const conditionCodes: Record<string, string> = {
    '1': 'Regular',
    '2': 'Acquisition',
    '3': 'Closing',
    '4': 'Crossed',
    '5': 'Opening',
    '7': 'Late',
    '8': 'Form-T',
    '9': 'Extended Hours',
    '11': 'Sold Last',
    '12': 'Official Close',
    '15': 'Prior Reference',
  };

  // Inicializar WebSocket
  useEffect(() => {
    // Conectar al servidor WebSocket
    ws.current = new WebSocket("ws://localhost:4000");

    ws.current.onopen = () => {
      console.log("Conexión WebSocket establecida");
      setConnected(true);
      setLoading(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: FinnhubTrade = JSON.parse(event.data);
        
        // Procesar datos de transacciones en tiempo real
        if (message.type === "trade" && message.data && message.data.length > 0) {
          updateStockData(message);
        }
      } catch (error) {
        console.error("Error procesando mensaje WebSocket:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("Conexión WebSocket cerrada");
      setConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("Error WebSocket:", error);
      setError("Error al conectar con datos en tiempo real");
      setLoading(false);
    };

    // Limpiar conexión WebSocket al desmontar
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Actualizar datos de acciones con información en tiempo real
  const updateStockData = (tradeInfo: FinnhubTrade) => {
    const tradeData = tradeInfo.data;
    
    setStocks(prevStocks => {
      const updatedStocks = [...prevStocks];
      
      tradeData.forEach(trade => {
        const stockIndex = updatedStocks.findIndex(s => s.symbol === trade.s);
        
        if (stockIndex !== -1) {
          // Actualizar acción existente
          const currentStock = updatedStocks[stockIndex];
          const previousPrice = currentStock.price;
          const priceChange = ((trade.p - previousPrice) / previousPrice) * 100;
          
          updatedStocks[stockIndex] = {
            ...currentStock,
            previousPrice,
            price: trade.p,
            priceChange,
            volume: trade.v,
            lastUpdate: new Date(trade.t).toLocaleTimeString(),
            conditions: trade.c
          };
        } else {
          // Añadir nueva acción
          const newStock: Stock = {
            symbol: trade.s,
            name: companyNames[trade.s] || trade.s,
            price: trade.p,
            previousPrice: null,
            priceChange: 0,
            volume: trade.v,
            lastUpdate: new Date(trade.t).toLocaleTimeString(),
            conditions: trade.c
          };
          
          updatedStocks.push(newStock);
        }
      });
      
      return updatedStocks;
    });
  };

  // Función para traducir códigos de condición
  const getConditionName = (code: string): string => {
    return conditionCodes[code] || `Código ${code}`;
  };

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
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

          {stocks.length === 0 && !loading ? (
            <div className="alert alert-info">
              <span>Esperando datos de transacciones. Los datos aparecerán aquí cuando se reciban.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-base-200">
                    <th>Activo</th>
                    <th>Precio Actual</th>
                    <th>Cambio</th>
                    <th>Volumen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-base-200 transition-colors duration-200">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-8">
                              <span>{stock.symbol.substring(0, 2)}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{stock.symbol}</div>
                            <div className="text-sm opacity-50">{stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono font-bold">${stock.price.toFixed(2)}</td>
                      <td>
                        {stock.previousPrice !== null ? (
                          <div className={`flex items-center gap-1 font-bold ${stock.priceChange >= 0 ? "text-success" : "text-error"}`}>
                            {stock.priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {stock.priceChange.toFixed(2)}%
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td>{stock.volume}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-success text-white">Comprar</button>
                          <button className="btn btn-sm btn-error text-white">Vender</button>
                        </div>
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