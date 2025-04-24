import React from "react";
import DashboardMarketClient from "./DashboardMarketClient";
import { headers } from "next/headers";

export default async function DashboardMarketPage() {
  // 1. Obtener cookies entrantes
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";

  // 2. Parallel fetch (reenviando la cookie al perfil)
  const [marketRes, profileRes, stocksRes] = await Promise.all([
    fetch("http://localhost:4000/api/market/stocks").then((r) => {
      if (!r.ok) throw new Error("Error fetching market stocks");
      return r.json();
    }),
    fetch("http://localhost:4000/api/user/profile", {
      headers: { cookie },
    }).then((r) => {
      if (!r.ok) throw new Error("Error fetching profile");
      return r.json();
    }),
    fetch("http://localhost:4000/api/user/stocks", {
      headers: { cookie },
    }).then((r) => {
      if (!r.ok) throw new Error("Error fetching user stocks");
      return r.json();
    }),
    fetch("http://localhost:4000/api/transactions", {
      headers: { cookie },
    }).then((r) => {
      if (!r.ok) return { transactions: [] };
      return r.json();
    }),
  ]);

  // 3. Transformar y renderizar
  const apiStocks = Object.entries(marketRes).map(([symbol, info]) => ({
    symbol,
    ...info,
  }));
  const credit = profileRes.credit;
  const userStocks = stocksRes.stocks || [];

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