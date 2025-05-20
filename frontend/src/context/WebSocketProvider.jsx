"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(undefined);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [stockData, setStockData] = useState([]);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 segundos

  const connectWebSocket = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log("⚠️ Ya existe una conexión WebSocket abierta");
      return;
    }

    console.log("🔄 Iniciando conexión WebSocket...");
    
    // Usar directamente la URL del entorno o construir una relativa al servidor actual
    // const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    const wsUrl = "ws://localhost:4000";
    console.log("📌 Valor de NEXT_PUBLIC_WEBSOCKET_URL:", wsUrl);
    let url;
    
    if (wsUrl && (wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://'))) {
      // Si la URL ya incluye el protocolo, usarla directamente
      url = wsUrl;
      console.log("🔍 Usando URL completa del .env");
    } else {
      // Si es solo una ruta, construir la URL relativa al servidor actual
      const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      console.log("🔍 Protocolo:", protocol);
      
      const host = window.location.hostname;
      console.log("🔍 Hostname:", host);
      
      const port = window.location.port ? `:${window.location.port}` : '';
      console.log("🔍 Puerto:", port);
      
      url = `${protocol}${host}${port}${wsUrl || ''}`;
      console.log("🔍 URL construida a partir de componentes");
    }

    console.log("🔗 Conectando a:", url);
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("✅ Conexión WebSocket establecida");
      setConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === "connection_status") {
    
          setConnected(message.status === "connected");
          return;
        }

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
            
            const newData = Array.from(stocksMap.values());
          
            return newData;
          });
        }
      } catch (error) {
        console.error("❌ Error al procesar mensaje WebSocket:", error);
        console.error("Mensaje que causó el error:", event.data);
      }
    };

    ws.current.onclose = (event) => {
      console.log("🔴 Conexión WebSocket cerrada", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      setConnected(false);
      handleReconnect();
    };

    ws.current.onerror = (error) => {
      console.error("❌ Error en WebSocket:", error);
      setConnected(false);
    };
  };

  const handleReconnect = () => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error("❌ Máximo número de intentos de reconexión alcanzado");
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttemptsRef.current += 1;
    const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1);
    
    console.log(`🔄 Intentando reconectar en ${delay/1000} segundos... (Intento ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
    }, delay);
  };

  useEffect(() => {
    console.log("🚀 Inicializando WebSocketProvider");
    connectWebSocket();

    return () => {
      console.log("🧹 Limpiando WebSocketProvider");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const reconnect = () => {
    console.log("🔄 Reconexión manual iniciada");
    reconnectAttemptsRef.current = 0;
    if (ws.current) {
      ws.current.close();
    }
    connectWebSocket();
  };

  return (
    <WebSocketContext.Provider value={{ connected, stockData, ws: ws.current, reconnect }}>
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