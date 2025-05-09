import React from "react";
import DashboardMarketClient from "./DashboardMarketClient";
import { headers } from "next/headers";

export default async function DashboardMarketPage() {
  // 1. Obtener cookies entrantes
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";

  // 2. Parallel fetch (reenviando la cookie al perfil)
  const [marketRes, profileRes, stocksRes] = await Promise.all([
    fetch(process.env.NEXT_PUBLIC_API_URL + "/market/stocks").then((r) => {
      if (!r.ok) throw new Error("Error fetching market stocks");
      return r.json();
    }),
    fetch(process.env.NEXT_PUBLIC_API_URL + "/user/profile", {
      headers: { cookie },
    }).then((r) => {
      if (!r.ok) throw new Error("Error fetching profile");
      return r.json();
    }),
    fetch(process.env.NEXT_PUBLIC_API_URL + "/user/stocks", {
      headers: { cookie },
    }).then((r) => {
      if (!r.ok) throw new Error("Error fetching user stocks");
      return r.json();
    }),
    fetch(process.env.NEXT_PUBLIC_API_URL + "/transactions", {
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