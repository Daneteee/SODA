"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
} from "lucide-react";
import DrawerSide from "@/components/DrawerSide";
import { useWebSocket } from "@/context/WebSocketProvider";

// Definición de la interfaz para las acciones del usuario
interface Stock {
  symbol: string;
  name?: string;
  // Datos para mostrar precio en WS
  price?: number;
  priceChange?: number;
  company?: { logo?: string };
  // Datos del usuario
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
}

const DashboardPortfolio = () => {
  const { connected, stockData } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Estados para datos del usuario (API)
  const [credit, setCredit] = useState(0);
  const [userStocks, setUserStocks] = useState<Stock[]>([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario: perfil, acciones y transacciones
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileRes = await fetch("http://localhost:4000/api/user/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!profileRes.ok) throw new Error("Error obteniendo perfil");
        const profileData = await profileRes.json();
        setCredit(profileData.credit);

        const stocksRes = await fetch("http://localhost:4000/api/user/stocks", {
          method: "GET",
          credentials: "include",
        });
        if (!stocksRes.ok) throw new Error("Error obteniendo acciones");
        const stocksData = await stocksRes.json();
        setUserStocks(stocksData.stocks || []);

        const transactionsRes = await fetch("http://localhost:4000/api/transactions", {
          method: "GET",
          credentials: "include",
        });
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setTransactionsCount(transactionsData.transactions.length);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Función para obtener el precio en tiempo real de una acción (vía WS)
  const getRealtimePrice = (symbol: string): number | null => {
    const realtime = stockData.find((s: Stock) => s.symbol === symbol);
    return realtime && realtime.price ? realtime.price : null;
  };

  // Calcular el valor actual total de las acciones del usuario (usando precio real si existe)
  const totalStockValue = userStocks.reduce((acc, stock) => {
    const currentPrice = getRealtimePrice(stock.symbol) ?? stock.purchasePrice ?? 0;
    return acc + currentPrice * (stock.quantity ?? 0);
  }, 0);

  // Portfolio Value = crédito + valor actual de las acciones
  const portfolioValue = credit + totalStockValue;

  // Calcular el valor inicial total (precio de compra * cantidad)
  const totalInitialStockValue = userStocks.reduce((acc, stock) => {
    return acc + (stock.purchasePrice ?? 0) * (stock.quantity ?? 0);
  }, 0);

  // Ganancia (o pérdida) total y su porcentaje
  const gain = totalStockValue - totalInitialStockValue;
  const gainPercent =
    totalInitialStockValue > 0 ? (gain / totalInitialStockValue) * 100 : 0;

  // Filtrar acciones del usuario según búsqueda (para la tabla de portafolio)
  const filteredUserStocks: Stock[] = userStocks.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Función para renderizar el logo o avatar de la acción
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

  // Función para calcular el cambio (%) para cada acción:
  // Se toma el precio en tiempo real (o el de compra si no hay) y se compara con el precio de compra.
  const getChangePercent = (stock: Stock): number | null => {
    if (!stock.purchasePrice) return null;
    const currentPrice = getRealtimePrice(stock.symbol) ?? stock.purchasePrice;
    return ((currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-base-200">
        <RefreshCw className="animate-spin h-10 w-10 text-primary" />
      </div>
    );

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <main className="flex-1 p-6 bg-base-200">
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Portfolio Value */}
            <div className="stats shadow bg-primary text-primary-content overflow-hidden">
              <div className="stat">
                <div className="stat-title text-primary-content/60">
                  Portfolio Value
                </div>
                <div className="stat-value text-primary-content/60">
                  ${portfolioValue.toFixed(2)}
                </div>
                <div className="stat-desc text-primary-content/60">
                  Valor actualizado
                </div>
              </div>
            </div>
            {/* Ganancias */}
            <div className="stats shadow bg-accent text-accent-content">
              <div className="stat">
                <div className="stat-title text-accent-content/60">
                  Ganancias
                </div>
                <div className="stat-value text-accent-content/60">
                  {gain >= 0
                    ? `+$${gain.toFixed(2)}`
                    : `-$${Math.abs(gain).toFixed(2)}`}
                </div>
                <div className="stat-desc text-accent-content/60">
                  {gainPercent >= 0
                    ? `↗︎ ${gainPercent.toFixed(2)}%`
                    : `↘︎ ${Math.abs(gainPercent).toFixed(2)}%`}
                </div>
              </div>
            </div>
            {/* Operaciones */}
            <div className="stats shadow bg-secondary text-secondary-content">
              <div className="stat">
                <div className="stat-title text-secondary-content/60">
                  Operaciones
                </div>
                <div className="stat-value text-secondary-content/60">
                  {transactionsCount}
                </div>
              </div>
            </div>
            {/* Balance */}
            <div className="stats shadow bg-neutral text-neutral-content overflow-hidden">
              <div className="stat">
                <div className="stat-title text-neutral-content/60">
                  Balance
                </div>
                <div className="stat-value text-neutral-content/60">
                  ${credit.toFixed(2)}
                </div>
                <div className="stat-desc text-neutral-content/60">
                  Disponible para trading
                </div>
              </div>
            </div>
          </div>

          {/* Sección del portafolio del usuario */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Mi Portafolio</h2>
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

              {filteredUserStocks.length === 0 ? (
                <div className="alert">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-info h-6 w-6 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>No tienes acciones en tu portafolio.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr className="bg-base-200">
                        <th>Activo</th>
                        <th>Cantidad</th>
                        <th>Precio Compra</th>
                        <th>Precio Actual</th>
                        <th>Cambio</th>
                        <th>Fecha de Compra</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUserStocks.map((stock) => {
                        const realtimePrice = getRealtimePrice(stock.symbol) ?? stock.purchasePrice ?? 0;
                        const changePercent = stock.purchasePrice
                          ? ((realtimePrice - stock.purchasePrice) / stock.purchasePrice) * 100
                          : 0;
                        return (
                          <tr
                            key={stock.symbol}
                            className="hover:bg-base-200 transition-colors duration-200 cursor-pointer"
                            onClick={() => router.push(`/dashboard/market/${stock.symbol}`)}
                          >
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                  <div className="bg-neutral text-neutral-content rounded-full w-8">
                                    <span>{stock.symbol.substring(0, 2)}</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold">{stock.name || stock.symbol}</div>
                                  <div className="text-sm opacity-50">{stock.symbol}</div>
                                </div>
                              </div>
                            </td>
                            <td className="font-mono font-bold">{stock.quantity}</td>
                            <td className="font-mono font-bold">
                              ${Number(stock.purchasePrice).toFixed(2)}
                            </td>
                            <td className="font-mono font-bold">
                              ${realtimePrice.toFixed(2)}
                            </td>
                            <td className="font-mono font-bold">
                              <div
                                className={`flex items-center gap-1 ${
                                  changePercent >= 0 ? "text-success" : "text-error"
                                }`}
                              >
                                {changePercent >= 0 ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                                {changePercent.toFixed(2)}%
                              </div>
                            </td>
                            <td>
                              {stock.purchaseDate ? new Date(stock.purchaseDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button className="btn btn-sm btn-success text-white mr-2">
                                  Comprar
                                </button>
                                <button className="btn btn-sm btn-error text-white">
                                  Vender
                                </button>
                              </div>
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
      </div>

      {/* Sidebar (Drawer) */}
      <DrawerSide />
    </div>
  );
};

export default DashboardPortfolio;
