"use client";

/**
 * @module WebSocketProvider
 * @description Proveedor de contexto para la conexión WebSocket que gestiona datos de acciones en tiempo real
 * @requires react
 */

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * Contexto para la conexión WebSocket
 * @type {React.Context}
 */
const WebSocketContext = createContext(undefined);

/**
 * Componente proveedor que gestiona la conexión WebSocket para datos de acciones en tiempo real
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @returns {React.ReactElement} Proveedor de contexto WebSocket
 */
export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [stockData, setStockData] = useState([]);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 segundos

  /**
   * Establece la conexión WebSocket con el servidor
   * @function connectWebSocket
   * @description Crea una nueva conexión WebSocket y configura los manejadores de eventos
   */
  const connectWebSocket = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log("⚠️ Ya existe una conexión WebSocket abierta");
      return;
    }

    console.log("🔄 Iniciando conexión WebSocket...");
    
    // Usar directamente la URL del entorno o construir una relativa al servidor actual
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    // const wsUrl = "ws://localhost:4000";
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

    /**
     * Manejador del evento de apertura de conexión
     * @event onopen
     * @description Se ejecuta cuando la conexión WebSocket se establece correctamente
     */
    ws.current.onopen = () => {
      console.log("✅ Conexión WebSocket establecida");
      setConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    /**
     * Manejador del evento de recepción de mensajes
     * @event onmessage
     * @param {MessageEvent} event - Evento con los datos recibidos del servidor
     * @description Procesa los mensajes recibidos del servidor y actualiza el estado según el tipo de mensaje
     */
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

    /**
     * Manejador del evento de cierre de conexión
     * @event onclose
     * @param {CloseEvent} event - Evento con información sobre el cierre de la conexión
     * @description Se ejecuta cuando la conexión WebSocket se cierra e intenta reconectar
     */
    ws.current.onclose = (event) => {
      console.log("🔴 Conexión WebSocket cerrada", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      setConnected(false);
      handleReconnect();
    };

    /**
     * Manejador del evento de error en la conexión
     * @event onerror
     * @param {Event} error - Evento con información sobre el error
     * @description Se ejecuta cuando ocurre un error en la conexión WebSocket
     */
    ws.current.onerror = (error) => {
      console.error("❌ Error en WebSocket:", error);
      setConnected(false);
    };
  };

  /**
   * Gestiona la lógica de reconexión con retraso exponencial
   * @function handleReconnect
   * @description Intenta reconectar con un retraso exponencial hasta alcanzar el máximo de intentos
   */
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

  /**
   * Fuerza una reconexión manual al WebSocket
   * @function reconnect
   * @description Cierra la conexión actual y establece una nueva, reiniciando el contador de intentos
   */
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

/**
 * Hook personalizado para acceder al contexto WebSocket
 * @function useWebSocket
 * @returns {Object} Objeto con el estado de conexión, datos de acciones y funciones de control
 * @throws {Error} Si se utiliza fuera de un WebSocketProvider
 */
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket debe usarse dentro de un WebSocketProvider");
  }
  return context;
};