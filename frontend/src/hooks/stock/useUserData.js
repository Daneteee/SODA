import { useState, useEffect } from "react";

export const useUserData = () => {
  const [credit, setCredit] = useState(0);
  const [userStocks, setUserStocks] = useState([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileResponse = await fetch(process.env.NEXT_PUBLIC_API_URL + "/user/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!profileResponse.ok) throw new Error("Error obteniendo datos del usuario");
        const profileData = await profileResponse.json();
        setCredit(profileData.credit);

        const stocksResponse = await fetch(process.env.NEXT_PUBLIC_API_URL + "/user/stocks", {
          method: "GET",
          credentials: "include",
        });
        if (!stocksResponse.ok) throw new Error("Error obteniendo acciones del usuario");
        const stocksData = await stocksResponse.json();
        setUserStocks(stocksData.stocks || []);

        const transactionsResponse = await fetch(process.env.NEXT_PUBLIC_API_URL + "/transactions", {
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
  }, []);

  return { credit, userStocks, transactionsCount, loading };
};