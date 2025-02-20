"use client"
import React, { useState } from 'react';
import { Search, LayoutDashboard, Users, FileText, Settings, LogOut, TrendingUp, TrendingDown, Activity, PieChart, Wallet, History } from 'lucide-react';

const DashboardLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const stocks = [
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: +1.25, volume: '45.2M', market_cap: '2.85T', trend: [65, 70, 68, 74, 72, 75, 78] },
    { id: 2, symbol: 'MSFT', name: 'Microsoft', price: 402.15, change: -0.54, volume: '22.1M', market_cap: '2.98T', trend: [80, 78, 82, 79, 85, 83, 82] },
    { id: 3, symbol: 'GOOGL', name: 'Alphabet Inc.', price: 143.96, change: +2.31, volume: '18.5M', market_cap: '1.82T', trend: [45, 42, 50, 47, 53, 49, 55] },
    { id: 4, symbol: 'AMZN', name: 'Amazon', price: 172.45, change: -1.12, volume: '30.7M', market_cap: '1.79T', trend: [60, 65, 62, 59, 63, 60, 58] },
    { id: 5, symbol: 'NVDA', name: 'NVIDIA', price: 726.13, change: +5.43, volume: '42.3M', market_cap: '1.79T', trend: [90, 88, 95, 92, 98, 96, 100] },
  ];

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="drawer lg:drawer-open ">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <main className="flex-1 p-6 bg-base-200">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="stats shadow bg-primary text-primary-content">
              <div className="stat">
                <div className="stat-title text-primary-content/60">Portfolio Value</div>
                <div className="stat-value text-primary-content/60">$89,432</div>
                <div className="stat-desc text-primary-content/60">↗︎ 45% más que el mes pasado</div>
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
                <div className="stat-value text-secondary-content/60">23</div>
                <div className="stat-desc text-secondary-content/60">↘︎ 4 pendientes</div>
              </div>
            </div>

            <div className="stats shadow bg-neutral text-neutral-content">
              <div className="stat">
                <div className="stat-title text-neutral-content/60">Balance</div>
                <div className="stat-value text-neutral-content/60">$12,180</div>
                <div className="stat-desc text-neutral-content/60">Disponible para trading</div>
              </div>
            </div>
          </div>

          {/* Search and Market Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Mercado en Vivo</h2>
                </div>
                <div className="join">
                  <div>
                    <div>
                      <input 
                        className="input input-bordered join-item w-64" 
                        placeholder="Buscar símbolo o empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="indicator">
                    <button className="btn join-item btn-primary"><Search className="h-5 w-5"/></button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Activo</th>
                      <th>Precio</th>
                      <th>Cambio 24h</th>
                      <th>Volumen</th>
                      <th>Cap. Mercado</th>
                      <th>Tendencia</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.map((stock) => (
                      <tr key={stock.id} className="hover:bg-base-200 transition-colors duration-200">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-8">
                                <span className="text-xs">{stock.symbol[0]}</span>
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
                          <div className={`flex items-center gap-1 font-bold ${stock.change > 0 ? 'text-success' : 'text-error'}`}>
                            {stock.change > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {stock.change > 0 ? '+' : ''}{stock.change}%
                          </div>
                        </td>
                        <td className="font-mono">{stock.volume}</td>
                        <td className="font-mono">{stock.market_cap}</td>
                        <td>
                          <div className="flex gap-1">
                            {stock.trend.map((value, index) => (
                              <div
                                key={index}
                                className={`h-8 w-1 rounded-full ${value > stock.trend[index - 1] ? 'bg-success' : 'bg-error'}`}
                                style={{
                                  height: `${value/2}%`
                                }}
                              />
                            ))}
                          </div>
                        </td>
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
            </div>
          </div>
        </main>
      </div>
      
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <aside className="bg-base-100 w-80 border-r border-base-200 flex flex-col h-full">
          <div className="p-4 bg-primary text-primary-content">
            <div className="flex items-center gap-4">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-12">
                  <span>MX</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">MaxTrade Pro</h2>
                <p className="text-sm opacity-80">Trading Platform</p>
              </div>
            </div>
          </div>
          
          <ul className="menu p-4 gap-2 flex-1">
            <li>
              <a className="active">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </a>
            </li>
            <li>
              <a className="hover:bg-base-200">
                <PieChart className="h-5 w-5" />
                Portfolio
              </a>
            </li>
            <li>
              <a className="hover:bg-base-200">
                <Wallet className="h-5 w-5" />
                Wallet
              </a>
            </li>
            <li>
              <a className="hover:bg-base-200">
                <History className="h-5 w-5" />
                Historial
              </a>
            </li>
            <li>
              <a className="hover:bg-base-200">
                <Settings className="h-5 w-5" />
                Configuración
              </a>
            </li>
          </ul>

          <div className="p-4 mt-auto">
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <h3 className="card-title text-sm">Plan Premium</h3>
                <p className="text-xs">Tu plan expira en 15 días</p>
                <button className="btn btn-primary btn-sm mt-2">Renovar Plan</button>
              </div>
            </div>
            
            <button className="btn btn-error btn-block mt-4">
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardLayout;