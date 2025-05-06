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
  Star,
} from "lucide-react";
import { useWebSocket } from "@/context/WebSocketProvider";
import StatsCards from "@/components/StatsCards";

export default function DashboardPortfolio() {
  const router = useRouter();
  const { stockData } = useWebSocket();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [credit, setCredit] = useState(0);
  const [userStocks, setUserStocks] = useState([]);
  const [favSymbols, setFavSymbols] = useState([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingFavs, setLoadingFavs] = useState(true);

  // Fetch profile, stocks, tx count, and favs
  useEffect(() => {
    async function fetchData() {
      try {
        // Profile
        const p = await fetch("http://localhost:4000/api/user/profile", { credentials: "include" });
        if (!p.ok) throw new Error();
        const { credit } = await p.json();
        setCredit(credit);

        // Owned stocks
        const s = await fetch("http://localhost:4000/api/user/stocks", { credentials: "include" });
        if (!s.ok) throw new Error();
        const { stocks } = await s.json();
        setUserStocks(stocks || []);

        // Transactions
        const t = await fetch("http://localhost:4000/api/transactions", { credentials: "include" });
        if (t.ok) {
          const { transactions } = await t.json();
          setTransactionsCount(transactions.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }

      try {
        // Favorites
        const f = await fetch("http://localhost:4000/api/favorites", { credentials: "include" });
        if (f.ok) {
          const { favs } = await f.json();
          setFavSymbols(favs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingFavs(false);
      }
    }

    fetchData();
  }, []);

  // Helpers
  const getRealtime = (symbol) =>
    stockData.find((s) => s.symbol === symbol) || {};

  const renderLogo = (symbol, logo) => {
    if (logo) {
      return (
        <div className="avatar">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image src={logo} width={32} height={32} alt={symbol} />
          </div>
        </div>
      );
    }
    return (
      <div className="avatar placeholder">
        <div className="bg-neutral text-neutral-content rounded-full w-8">
          <span>{symbol.slice(0, 2)}</span>
        </div>
      </div>
    );
  };

  // Build arrays
  const favoriteStocks = favSymbols.map((symbol) => {
    const { price, priceChange, logo } = getRealtime(symbol);
    return { symbol, price, priceChange, company: { logo } };
  });

  const filteredUserStocks = userStocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  // Summary numbers
  const totalStockValue = userStocks.reduce((sum, s) => {
    const rt = getRealtime(s.symbol).price ?? s.purchasePrice ?? 0;
    return sum + rt * (s.quantity ?? 0);
  }, 0);
  const totalInitialValue = userStocks.reduce(
    (sum, s) => sum + (s.purchasePrice ?? 0) * (s.quantity ?? 0),
    0
  );
  const gain = totalStockValue - totalInitialValue;
  const gainPercent = totalInitialValue > 0 ? (gain / totalInitialValue) * 100 : 0;
  const portfolioValue = credit + totalStockValue;

  return (
    <main className="p-6 bg-base-200 flex-1">
      <StatsCards
        portfolioValue={portfolioValue}
        gain={gain}
        gainPercent={gainPercent}
        transactionsCount={transactionsCount}
        credit={credit}
      />

      {/* Full Portfolio */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
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
            <div className="alert">No tienes acciones en tu portafolio.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-base-200">
                    <th>Activo</th>
                    <th>Cantidad</th>
                    <th>Precio Ud.</th>
                    <th>Invertido</th>
                    <th>Precio Actual</th>
                    <th>Cambio %</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUserStocks.map((s) => {
                    const rt = getRealtime(s.symbol).price ?? s.purchasePrice ?? 0;
                    const changePct =
                      s.purchasePrice != null
                        ? ((rt - s.purchasePrice) / s.purchasePrice) * 100
                        : 0;
                    return (
                      <tr
                        key={s.symbol}
                        className="hover:bg-base-200 cursor-pointer"
                        onClick={() => router.push(`/dashboard/market/${s.symbol}`)}
                      >
                        <td className="flex items-center gap-3">
                          {renderLogo(s.symbol, s.company?.logo)}
                          <div>
                            <div className="font-bold">{s.name || s.symbol}</div>
                            <div className="text-sm opacity-50">{s.symbol}</div>
                          </div>
                        </td>
                        <td className="font-mono">{s.quantity}</td>
                        <td className="font-mono">${(s.purchasePrice ?? 0).toFixed(2)}</td>
                        <td className="font-mono">${((s.purchasePrice ?? 0) * (s.quantity ?? 0)).toFixed(2)}</td>
                        <td className="font-mono">${rt.toFixed(2)}</td>
                        <td className={`font-mono ${changePct >= 0 ? "text-success" : "text-error"}`}>
                          {changePct >= 0 ? <TrendingUp className="inline h-4 w-4" /> : <TrendingDown className="inline h-4 w-4" />}
                          {changePct.toFixed(2)}%
                        </td>
                        <td>{s.purchaseDate ? new Date(s.purchaseDate).toLocaleDateString() : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Favorites */}
      {favoriteStocks.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-6 w-6 text-warning" />
              <h2 className="text-2xl font-bold">Acciones Favoritas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-base-200">
                    <th>Activo</th>
                    <th>Precio Actual</th>
                    <th>Cambio %</th>
                  </tr>
                </thead>
                <tbody>
                  {favoriteStocks.map((s) => (
                    <tr
                      key={s.symbol}
                      className="hover:bg-base-200 cursor-pointer"
                      onClick={() => router.push(`/dashboard/market/${s.symbol}`)}
                    >
                      <td className="flex items-center gap-3">
                        {renderLogo(s.symbol, s.company?.logo)}
                        <div>
                          <div className="font-bold">{s.name || s.symbol}</div>
                          <div className="text-sm opacity-50">{s.symbol}</div>
                        </div>
                      </td>
                      <td className="font-mono">${(s.price ?? 0).toFixed(2)}</td>
                      <td className={`font-mono ${s.priceChange >= 0 ? "text-success" : "text-error"}`}>
                        {s.priceChange != null ? (
                          <>
                            {s.priceChange >= 0 ? <TrendingUp className="inline h-4 w-4" /> : <TrendingDown className="inline h-4 w-4" />}
                            {s.priceChange.toFixed(2)}%
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}