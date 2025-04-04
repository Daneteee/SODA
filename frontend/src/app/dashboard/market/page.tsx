"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { useWebSocket } from "@/context/WebSocketProvider";
import StatsCards from "@/components/StatsCards";

// Definición de la interfaz de Stock
interface Stock {
  symbol: string;
  name?: string;
  sector?: string;
  exchange?: string;
  country?: string;
  currency?: string;
  website?: string;
  logo?: string;
  firstPriceToday?: number; // Precio de apertura
  // Datos actualizados vía WS
  price?: number; // Precio actual
}

const DashboardMarketPage = () => {
  const { connected, stockData: wsStockData } = useWebSocket();
  const [apiStocks, setApiStocks] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  

  const [credit, setCredit] = useState<number>(0);
  const [userStocks, setUserStocks] = useState<any[]>([]);
  const [transactionsCount, setTransactionsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);



  // Obtener datos iniciales desde la API /market/stocks
  useEffect(() => {
    const fetchMarketStocks = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/market/stocks");
        if (!response.ok) throw new Error("Error fetching market stocks");
        const data = await response.json();
        // Convertir el objeto en arreglo
        const stocksArray: Stock[] = Object.keys(data).map((symbol) => ({
          symbol,
          ...data[symbol],
        }));
        setApiStocks(stocksArray);
      } catch (error) {
        console.error("Error fetching market stocks:", error);
      }
    };

    const fetchUserData = async () => {
      try {
        // Obtener perfil (crédito)
        const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!profileResponse.ok) throw new Error("Error obteniendo datos del usuario");
        const profileData = await profileResponse.json();
        setCredit(profileData.credit);

        // Obtener acciones del usuario
        const stocksResponse = await fetch("http://localhost:4000/api/user/stocks", {
          method: "GET",
          credentials: "include",
        });
        if (!stocksResponse.ok) throw new Error("Error obteniendo acciones del usuario");
        const stocksData = await stocksResponse.json();
        setUserStocks(stocksData.stocks || []);

        // Obtener transacciones (opcional, para contar operaciones)
        const transactionsResponse = await fetch("http://localhost:4000/api/transactions", {
          method: "GET",
          credentials: "include",
        });
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactionsCount(transactionsData.transactions.length);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setLoading(false);
      }
    };

    fetchUserData();
    fetchMarketStocks();
  }, []);

  // Función para cargar datos del usuario (credit, userStocks y transacciones)
  useEffect(() => {
    
  }, []);

  // Combinar la información de la API con los datos del WS
  const mergedStocks: Stock[] = apiStocks.map((stock) => {
    const wsStock = wsStockData.find((s: Stock) => s.symbol === stock.symbol);
    return {
      ...stock,
      // Si hay datos del WS, usarlos; de lo contrario, usar el precio de apertura de la API
      price: wsStock?.price ?? stock.firstPriceToday,
    };
  });

  // Función que dado un símbolo, busca en los datos del WS el precio actual
  const getRealtimePrice = (symbol: string): number | null => {
    const realtime = wsStockData.find((s: Stock) => s.symbol === symbol);
    return realtime && realtime.price ? realtime.price : null;
  };

  // Filtrar acciones según el término de búsqueda
  const filteredStocks: Stock[] = mergedStocks.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular el valor actual total de las acciones del usuario usando el precio en tiempo real
  const totalStockValue = userStocks.reduce((acc, stock) => {
    const currentPrice = getRealtimePrice(stock.symbol) ?? stock.purchasePrice ?? 0;
    return acc + currentPrice * (stock.quantity ?? 0);
  }, 0);

  // Portfolio Value = crédito + valor actual total de acciones
  const portfolioValue = credit + totalStockValue;

  // Calcular el valor inicial total (precio de compra × cantidad)
  const totalInitialStockValue = userStocks.reduce((acc, stock) => {
    return acc + (stock.purchasePrice ?? 0) * (stock.quantity ?? 0);
  }, 0);

  // Ganancia o pérdida total en las acciones
  const gain = totalStockValue - totalInitialStockValue;
  const gainPercent = totalInitialStockValue > 0 ? (gain / totalInitialStockValue) * 100 : 0;

  // Función para renderizar el logo de la acción
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
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
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
    <main className="flex-1 p-6 bg-base-200">
      <StatsCards
        portfolioValue={portfolioValue}
        gain={gain}
        gainPercent={gainPercent}
        transactionsCount={transactionsCount}
        credit={credit}
      />

      {/* Sección "Mercado en Vivo" */}
      <div className="card bg-base-100 shadow-xl ">
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
            // Contenedor con overflow vertical para la tabla
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
                    // Calcular el cambio relativo al opening price (firstPriceToday)
                    let changePercentage = 0;
                    if (stock.firstPriceToday && stock.price) {
                      changePercentage =
                        ((stock.price - stock.firstPriceToday) /
                          stock.firstPriceToday) *
                        100;
                    }
                    const isPositive = changePercentage >= 0;

                    return (
                      <tr
                        key={stock.symbol}
                        className="hover:bg-base-200 transition-colors duration-200 cursor-pointer"
                        onClick={() => router.push(`/dashboard/market/${stock.symbol}`)}
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
                          {stock.price !== undefined ? `$${stock.price.toFixed(2)}` : "N/A"}
                        </td>
                        <td>
                          <div className={`flex items-center gap-1 font-bold ${isPositive ? "text-success" : "text-error"}`}>
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {stock.firstPriceToday
                              ? `${changePercentage.toFixed(2)}%`
                              : "N/A"}
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-success text-white mr-2">
                            Comprar
                          </button>
                          <button className="btn btn-sm btn-error text-white">
                            Vender
                          </button>
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

export default DashboardMarketPage;
