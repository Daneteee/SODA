/**
 * @module useNewsData
 * @description Hook personalizado para obtener y gestionar noticias relacionadas con acciones
 * @requires react
 */

import { useState, useEffect } from "react";

/**
 * Hook personalizado para cargar noticias relacionadas con una acción específica
 * @function useNewsData
 * @param {string} symbol - Símbolo de la acción para la que se desean obtener noticias
 * @param {boolean} newsOpen - Indica si el panel de noticias está abierto
 * @returns {Object} Estado y funciones para gestionar las noticias
 */
export function useNewsData(symbol, newsOpen) {
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  /**
   * Carga las noticias relacionadas con el símbolo de acción especificado
   * @function loadNewsData
   * @async
   * @description Realiza una petición al servidor para obtener noticias relacionadas con la acción
   */
  const loadNewsData = async () => {
    setNewsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/market/news?symbol=${symbol}`,
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