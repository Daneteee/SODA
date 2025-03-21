"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, Activity
} from 'lucide-react';
import { useRouter } from "next/navigation";
import DrawerSide from "@/components/DrawerSide";

const DashboardLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [credit, setCredit] = useState(0);
  const [userStocks, setUserStocks] = useState<any[]>([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Obtener datos del usuario: perfil, acciones y transacciones
  useEffect(() => {
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

        // Obtener acciones (stocks)
        const stocksResponse = await fetch("http://localhost:4000/api/user/stocks", {
          method: "GET",
          credentials: "include",
        });
        if (!stocksResponse.ok) throw new Error("Error obteniendo acciones del usuario");
        const stocksData = await stocksResponse.json();
        setUserStocks(stocksData.stocks || []);

        // Obtener transacciones para contar operaciones
        const transactionsResponse = await fetch("http://localhost:4000/api/transactions", {
          method: "GET",
          credentials: "include",
        });
        if (!transactionsResponse.ok) throw new Error("Error obteniendo transacciones");
        const transactionsData = await transactionsResponse.json();
        setTransactionsCount(transactionsData.transactions.length);

        setLoading(false);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Calcular el valor total de las acciones
  const totalStockValue = userStocks.reduce((acc, stock) => {
    // Se asume que stock.currentPrice existe. Si no, se usa stock.purchasePrice como valor aproximado.
    const currentPrice = stock.currentPrice || stock.purchasePrice;
    return acc + currentPrice * stock.quantity;
  }, 0);

  // Valor del portafolio = crédito + valor total de las acciones
  const portfolioValue = credit + totalStockValue;

  // Filtrar acciones según búsqueda
  const filteredStocks = userStocks.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="drawer lg:drawer-open ">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <main className="flex-1 p-6 bg-base-200">
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Portfolio Value: muestra el crédito + valor actual de las acciones */}
            <div className="stats shadow bg-primary text-primary-content overflow-hidden">
              <div className="stat">
                <div className="stat-title text-primary-content/60">Portfolio Value</div>
                <div className="stat-value text-primary-content/60">${portfolioValue.toFixed(2)}</div>
                <div className="stat-desc text-primary-content/60">Valor actualizado</div>
              </div>
            </div>
            
            <div className="stats shadow bg-accent text-accent-content">
              <div className="stat">
                <div className="stat-title text-accent-content/60">Ganancias Día</div>
                <div className="stat-value text-accent-content/60">+$1,324</div>
                <div className="stat-desc text-accent-content/60">↗︎ 6.2% hoy</div>
              </div>
            </div>

            <div className="stats shadow bg-secondary text-secondary-content">
              <div className="stat">
                <div className="stat-title text-secondary-content/60">Operaciones</div>
                <div className="stat-value text-secondary-content/60">{transactionsCount}</div>
                <div className="stat-desc text-secondary-content/60">↘︎ 4 pendientes</div>
              </div>
            </div>

            <div className="stats shadow bg-neutral text-neutral-content overflow-hidden">
              <div className="stat">
                <div className="stat-title text-neutral-content/60">Balance</div>
                <div className="stat-value text-neutral-content/60">${credit.toFixed(2)}</div>
                <div className="stat-desc text-neutral-content/60">Disponible para trading</div>
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

              {userStocks.length === 0 ? (
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
                        <th>Fecha de Compra</th>
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
                          <td className="font-mono font-bold">${Number(stock.purchasePrice).toFixed(2)}</td>
                          <td>{new Date(stock.purchaseDate).toLocaleDateString()}</td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-sm btn-success text-success-content/70">
                                Comprar
                              </button>
                              <button className="btn btn-sm btn-error text-warning-content/70">
                                Vender
                              </button>
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
        </main>
      </div>
      
      {/* Sidebar (Drawer) */}
      <DrawerSide />
    </div>
  );
};

export default DashboardLayout;
