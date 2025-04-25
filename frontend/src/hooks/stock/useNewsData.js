import { useState, useEffect } from "react";

export function useNewsData(symbol, newsOpen) {
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const loadNewsData = async () => {
    setNewsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/market/news?symbol=${symbol}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al obtener noticias:", errorData);
      } else {
        const data = await response.json();
        // Asumimos que el backend devuelve { articles: [...] }
        setNewsItems(data.articles || data);
      }
    } catch (error) {
      console.error("Error en la carga de noticias:", error);
    }
    setNewsLoading(false);
  };

  useEffect(() => {
    if (newsOpen && symbol) {
      loadNewsData();
    }
  }, [newsOpen, symbol]);

  return { newsItems, newsLoading, loadNewsData };
}