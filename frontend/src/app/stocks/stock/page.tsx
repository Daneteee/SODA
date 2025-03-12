"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Activity, TrendingUp, TrendingDown, Clock, RefreshCw } from "lucide-react";

interface StockDetail {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface TradeData {
  p: number; // price
  s: string; // symbol
  t: number; // timestamp
  v: number; // volume
}

const StockDetailPage = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [changePercent, setChangePercent] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const ws = useRef<WebSocket | null>(null);

  // Fetch initial stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/market/stock/${symbol}`);
        if (!response.ok) throw new Error("Failed to fetch stock data");
        
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Error fetching data");

        const stockData = data.data;
        setStock({
          symbol: stockData.symbol,
          price: parseFloat(stockData.price),
          open: parseFloat(stockData.open),
          high: parseFloat(stockData.high),
          low: parseFloat(stockData.low),
          volume: parseFloat(stockData.volume),
        });
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  // WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:4000");

    ws.current.onopen = () => {
      setConnected(true);
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === "trade" && message.data) {
          const trades = message.data.filter((t: TradeData) => t.s === symbol);
          
          trades.forEach((trade: TradeData) => {
            setStock(prev => {
              if (!prev) return null;
              
              const oldPrice = prev.price;
              const newPrice = trade.p;
              const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
              
              setChangePercent(percentChange);
              setLastUpdated(new Date(trade.t).toLocaleTimeString());

              return {
                ...prev,
                price: newPrice,
                volume: prev.volume + trade.v
              };
            });
          });
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
      console.log("WebSocket disconnected");
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [symbol]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="animate-spin h-8 w-8 text-primary" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Error: {error}
    </div>
  );

  if (!stock) return (
    <div className="min-h-screen flex items-center justify-center">
      Stock no encontrado
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-4 mb-6">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{stock.symbol}</h1>
            {connected && (
              <span className="badge badge-success gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Tiempo real
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="stats shadow bg-base-200">
              <div className="stat">
                <div className="stat-title">Precio Actual</div>
                <div className="stat-value text-primary">
                  ${stock.price.toFixed(2)}
                </div>
                <div className={`stat-desc ${changePercent >= 0 ? 'text-success' : 'text-error'}`}>
                  {changePercent >= 0 ? <TrendingUp className="inline" /> : <TrendingDown className="inline" />}
                  {changePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="stats shadow bg-base-200">
              <div className="stat">
                <div className="stat-title">Apertura</div>
                <div className="stat-value">${stock.open.toFixed(2)}</div>
              </div>
            </div>

            <div className="stats shadow bg-base-200">
              <div className="stat">
                <div className="stat-title">Volumen</div>
                <div className="stat-value">{stock.volume.toLocaleString()}</div>
              </div>
            </div>

            <div className="stats shadow bg-base-200">
              <div className="stat">
                <div className="stat-title">Máximo del día</div>
                <div className="stat-value text-success">${stock.high.toFixed(2)}</div>
              </div>
            </div>

            <div className="stats shadow bg-base-200">
              <div className="stat">
                <div className="stat-title">Mínimo del día</div>
                <div className="stat-value text-error">${stock.low.toFixed(2)}</div>
              </div>
            </div>

            <div className="stats shadow bg-base-200">
              <div className="stat">
                <div className="stat-title">Última actualización</div>
                <div className="stat-value">
                  <Clock className="inline mr-2" />
                  {lastUpdated || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;