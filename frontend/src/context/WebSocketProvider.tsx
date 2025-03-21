"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

interface IWebSocketContext {
  connected: boolean;
  stockData: any[];
  ws: WebSocket | null;
}

const WebSocketContext = createContext<IWebSocketContext | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [stockData, setStockData] = useState<any[]>([]);

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
            // Usamos un Map para que cada símbolo sea único
            const stocksMap = new Map<string, any>();
            // Agregamos los datos previos
            prevData.forEach((stock) => stocksMap.set(stock.symbol, stock));
            // Recorremos los nuevos datos y calculamos el porcentaje de cambio
            message.data.forEach((trade: any) => {
              const previousStock = stocksMap.get(trade.symbol);
              const previousPrice = previousStock ? previousStock.price : trade.price;
              const priceChange = previousStock ? ((trade.price - previousPrice) / previousPrice) * 100 : 0;
              const updatedTrade = { ...trade, previousPrice, priceChange };
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

export const useWebSocket = (): IWebSocketContext => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket debe usarse dentro de un WebSocketProvider");
  }
  return context;
};
