import React from "react";
import DashboardMarketClient from "./DashboardMarketClient";
import { headers } from "next/headers";

// Definición de la interfaz Stock sin la propiedad "price" de WS
export interface Stock {
  symbol: string;
  name?: string;
  sector?: string;
  exchange?: string;
  country?: string;
  currency?: string;
  website?: string;
  logo?: string;
  firstPriceToday?: number;
}
interface Profile { credit: number; }
interface UserStocksResponse { stocks: { symbol: string; purchasePrice: number; quantity: number }[]; }

export default async function DashboardMarketPage() {
  // 1. Obtener cookies entrantes
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";

  // 2. Parallel fetch (reenviando la cookie al perfil)
  const [marketRes, profileRes, stocksRes] = await Promise.all([
    fetch("http://localhost:4000/api/market/stocks").then(r => {
      if (!r.ok) throw new Error("Error fetching market stocks");
      return r.json();
    }),
    fetch("http://localhost:4000/api/user/profile", {
      headers: { cookie },
    }).then(r => {
      if (!r.ok) throw new Error("Error fetching profile");
      return r.json();
    }),
    fetch("http://localhost:4000/api/user/stocks", {
      headers: { cookie },
    }).then(r => {
      if (!r.ok) throw new Error("Error fetching user stocks");
      return r.json();
    }),
    fetch("http://localhost:4000/api/transactions", {
      headers: { cookie },
    }).then(r => {
      if (!r.ok) return { transactions: [] };
      return r.json();
    }),
  ]);

  // 3. Transformar y renderizar (igual que antes)
  const apiStocks: Stock[] = Object.entries(marketRes).map(
    ([symbol, info]) => ({ symbol, ...(info as Partial<Stock>) })
  );
  const credit = (profileRes as Profile).credit;
  const userStocks = (stocksRes as UserStocksResponse).stocks || [];

  return (
    <>
      <DashboardMarketClient
        initialApiStocks={apiStocks}
        initialCredit={credit}
        initialUserStocks={userStocks}
      />
    </>
  );
}