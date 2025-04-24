"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(undefined);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:4000");

    ws.current.onopen = () => {
      console.log("✅ Conexión WebSocket establecida");
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "trade" && Array.isArray(message.data)) {
          setStockData((prevData) => {
            const stocksMap = new Map();
            prevData.forEach((stock) => stocksMap.set(stock.symbol, stock));
            message.data.forEach((trade) => {
              const firstPriceToday = trade.firstPriceToday;
              const priceChange = firstPriceToday
                ? ((trade.price - firstPriceToday) / firstPriceToday) * 100
                : 0;
              const updatedTrade = {
                ...trade,
                previousPrice: firstPriceToday,
                priceChange,
              };
              stocksMap.set(trade.symbol, updatedTrade);
            });
            return Array.from(stocksMap.values());
          });
        }
      } catch (error) {
        console.error("Error al procesar mensaje WebSocket:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("🔴 Conexión WebSocket cerrada");
      setConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("❌ Error en WebSocket:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ connected, stockData, ws: ws.current }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket debe usarse dentro de un WebSocketProvider");
  }
  return context;
};