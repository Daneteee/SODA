"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

const MarketPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd");
        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }
        const data = await response.json();
        setStocks(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Cargando datos del mercado...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Mercado en Vivo</h2>
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

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="bg-base-200">
                  <th>Activo</th>
                  <th>Precio</th>
                  <th>Cambio 24h</th>
                  <th>Cap. Mercado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-base-200 transition-colors duration-200">
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={stock.image} alt={stock.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-bold">{stock.symbol.toUpperCase()}</div>
                          <div className="text-sm opacity-50">{stock.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono font-bold">${stock.current_price.toFixed(2)}</td>
                    <td>
                      <div className={`flex items-center gap-1 font-bold ${stock.price_change_percentage_24h > 0 ? "text-success" : "text-error"}`}>
                        {stock.price_change_percentage_24h > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {stock.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    </td>
                    <td className="font-mono">${stock.market_cap.toLocaleString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-success text-success-content/70">Comprar</button>
                        <button className="btn btn-sm btn-error text-warning-content/70">Vender</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
