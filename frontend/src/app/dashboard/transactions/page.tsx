"use client";

import React, { useEffect, useState } from "react";
import { Activity, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import DrawerSide from "@/components/DrawerSide";

interface Transaction {
  _id: string;
  userId: string;
  stock: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  total: number;
  date: string;
}

const TransactionPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/transactions", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Error al obtener las transacciones");
        const data = await response.json();
        setTransactions(data.transactions);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener transacciones:", error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filtrar transacciones por el símbolo del activo (u otro criterio)
  const filteredTransactions = transactions.filter((tx) =>
    tx.stock.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <main className="flex-1 p-6 bg-base-200">
          {/* Tarjetas de estadísticas (puedes agregar más según necesites) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="stats shadow bg-primary text-primary-content">
              <div className="stat">
                <div className="stat-title text-primary-content/60">Transacciones Totales</div>
                <div className="stat-value text-primary-content/60">{transactions.length}</div>
                <div className="stat-desc text-primary-content/60">Últimas transacciones</div>
              </div>
            </div>
            {/* Puedes agregar más tarjetas aquí */}
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Mis Transacciones</h2>
                </div>
                <div className="join">
                  <input
                    className="input input-bordered join-item w-64"
                    placeholder="Buscar símbolo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn join-item btn-primary">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
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
                  <span>No se han encontrado transacciones.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr className="bg-base-200">
                        <th>Tipo</th>
                        <th>Activo</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Total</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr
                          key={tx._id}
                          className="hover:bg-base-200 transition-colors duration-200 "
                        >
                          <td className="capitalize">{tx.type}</td>
                          <td>{tx.stock}</td>
                          <td className="font-mono font-bold">{tx.amount}</td>
                          <td className="font-mono font-bold">${Number(tx.price).toFixed(2)}</td>
                          <td className="font-mono font-bold">${Number(tx.total).toFixed(2)}</td>
                          <td>{new Date(tx.date).toLocaleDateString()}</td>
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

export default TransactionPage;
