"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
} from "lucide-react";

interface Stock {
  id?: string;
  name: string;
  symbol: string;
  image?: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap?: number;
  last_trade_time?: string;
}

interface FinnhubTrade {
  data: {
    p: number; // price
    s: string; // symbol
    t: number; // timestamp
    v: number; // volume
  }[];
  type: string;
}

const MarketPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  // Initial fetch of stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Using your backend endpoint instead of CoinGecko
        const response = await fetch("http://localhost:4000/api/market/stocks");
        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }
        
        const apiData = await response.json();
        
        if (!apiData.success) {
          throw new Error(apiData.message || "Failed to fetch stock data");
        }
        
        // Transform the data to match our Stock interface
        const stocksData: Stock[] = apiData.data.map((stock: any) => {
          // Extract symbol from the API response
          const symbol = stock['01. symbol'] || "";
          // Create a stock object with the required fields
          return {
            symbol: symbol,
            name: getCompanyName(symbol), // Helper function to get company name from symbol
            current_price: parseFloat(stock['05. price'] || 0),
            price_change_percentage_24h: parseFloat(stock['10. change percent']?.replace('%', '') || 0),
            last_trade_time: new Date().toLocaleTimeString(),
          };
        });
        
        setStocks(stocksData);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setError((error as Error).message);
        
        // Fallback to basic stock data if API fails
        setStocks([
          { symbol: "AAPL", name: "Apple Inc.", current_price: 178.72, price_change_percentage_24h: 0.75 },
          { symbol: "MSFT", name: "Microsoft Corp.", current_price: 333.55, price_change_percentage_24h: 1.23 },
          { symbol: "GOOGL", name: "Alphabet Inc.", current_price: 139.10, price_change_percentage_24h: -0.34 },
          { symbol: "AMZN", name: "Amazon.com Inc.", current_price: 178.15, price_change_percentage_24h: 0.89 },
          { symbol: "TSLA", name: "Tesla Inc.", current_price: 246.38, price_change_percentage_24h: 2.15 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    // Connect to your backend WebSocket server
    ws.current = new WebSocket("ws://localhost:4000");

    ws.current.onopen = () => {
      console.log("WebSocket connection established");
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: FinnhubTrade = JSON.parse(event.data);
        
        // Process real-time trade data
        if (message.type === "trade" && message.data && message.data.length > 0) {
          updateStockPrices(message.data);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
      setConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Failed to connect to real-time data");
    };

    // Cleanup WebSocket connection on component unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Helper function to update stock prices with real-time data
  const updateStockPrices = (tradeData: FinnhubTrade["data"]) => {
    setStocks(prevStocks => {
      // Create a new array for immutability
      const updatedStocks = [...prevStocks];
      
      // Process each trade and update corresponding stock
      tradeData.forEach(trade => {
        const stockIndex = updatedStocks.findIndex(
          stock => stock.symbol === trade.s
        );
        
        if (stockIndex !== -1) {
          const oldPrice = updatedStocks[stockIndex].current_price;
          const newPrice = trade.p;
          
          // Calculate price change percentage since previous update
          const priceChange = ((newPrice - oldPrice) / oldPrice) * 100;
          
          updatedStocks[stockIndex] = {
            ...updatedStocks[stockIndex],
            current_price: newPrice,
            price_change_percentage_24h: priceChange,
            last_trade_time: new Date(trade.t).toLocaleTimeString(),
          };
        }
      });
      
      return updatedStocks;
    });
  };

  // Helper function to get company name from symbol
  const getCompanyName = (symbol: string): string => {
    const companies: {[key: string]: string} = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corp.',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'FB': 'Meta Platforms Inc.',
      'TSLA': 'Tesla Inc.',
      'NFLX': 'Netflix Inc.',
      'NVDA': 'NVIDIA Corp.',
      'BABA': 'Alibaba Group',
      'V': 'Visa Inc.',
      'JPM': 'JPMorgan Chase',
      'JNJ': 'Johnson & Johnson',
      'WMT': 'Walmart Inc.',
      'PG': 'Procter & Gamble',
      'DIS': 'Walt Disney Co.',
      'MA': 'Mastercard Inc.',
      'HD': 'Home Depot Inc.',
    };
    
    return companies[symbol] || symbol;
  };

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6 flex justify-center items-center min-h-screen"><RefreshCw className="animate-spin h-8 w-8 text-primary" /></div>;
  if (error) return <div className="p-6 bg-base-200 min-h-screen">Error: {error}</div>;

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Mercado en Vivo</h2>
              {connected ? (
                <span className="badge badge-success gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  Conectado
                </span>
              ) : (
                <span className="badge badge-error gap-1">Desconectado</span>
              )}
            </div>
            <div className="join">
              <input
                className="input input-bordered join-item w-64"
                placeholder="Buscar símbolo o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn join-item btn-primary">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="bg-base-200">
                  <th>Activo</th>
                  <th>Precio Actual</th>
                  <th>Cambio</th>
                  <th>Última Actualización</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-base-200 transition-colors duration-200">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-8">
                            <span>{stock.symbol.substring(0, 2)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{stock.symbol}</div>
                          <div className="text-sm opacity-50">{stock.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono font-bold">${stock.current_price.toFixed(2)}</td>
                    <td>
                      <div className={`flex items-center gap-1 font-bold ${stock.price_change_percentage_24h > 0 ? "text-success" : "text-error"}`}>
                        {stock.price_change_percentage_24h > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {stock.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    </td>
                    <td>{stock.last_trade_time || "N/A"}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-success text-white">Comprar</button>
                        <button className="btn btn-sm btn-error text-white">Vender</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPage;