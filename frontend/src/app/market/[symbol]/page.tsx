"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { TrendingUp, TrendingDown, RefreshCw, Star, MoreHorizontal, Clock } from "lucide-react";

// Importamos los componentes necesarios para el gráfico
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// Registramos los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockDetail = () => {
  const { symbol } = useParams();
  const router = useRouter();
  const ws = useRef<WebSocket | null>(null);
  const [stock, setStock] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("Buy");
  const [amount, setAmount] = useState(0);
  const [shares, setShares] = useState(0);
  const [position, setPosition] = useState({
    total: 115.66,
    performance: 14.66,
    performancePercent: 14.52,
    shares: 0.616878,
    buyIn: 163.73,
    portfolio: 61.43
  });
  
  // Estado para el período de tiempo activo (por ahora solo "1D")
  const [activeTimeframe, setActiveTimeframe] = useState("1D");

  // --- Datos históricos diarios proporcionados ---
  const dailyHistory = [
    {
      date: '2025-03-18T13:30:00.000Z',
      open: 214.13999938964844,
      high: 215.0500030517578,
      low: 213.75,
      close: 214.10499572753906,
      volume: 2277470
    },
    {
      date: '2025-03-18T13:35:00.000Z',
      open: 214.11000061035156,
      high: 214.33999633789062,
      low: 213.58999633789062,
      close: 214.27499389648438,
      volume: 736238
    },
    {
      date: '2025-03-18T13:40:00.000Z',
      open: 214.22000122070312,
      high: 214.75,
      low: 213.36000061035156,
      close: 213.36000061035156,
      volume: 864386
    },
    {
      date: '2025-03-18T13:45:00.000Z',
      open: 213.34500122070312,
      high: 213.7738037109375,
      low: 212.9499969482422,
      close: 213.65499877929688,
      volume: 789667
    },
    {
      date: '2025-03-18T13:50:00.000Z',
      open: 213.64999389648438,
      high: 213.89999389648438,
      low: 213.30999755859375,
      close: 213.7991943359375,
      volume: 714857
    },
    {
      date: '2025-03-18T13:55:00.000Z',
      open: 213.80999755859375,
      high: 214.67999267578125,
      low: 213.72999572753906,
      close: 214.42999267578125,
      volume: 933091
    },
    {
      date: '2025-03-18T14:00:00.000Z',
      open: 214.4199981689453,
      high: 214.52439880371094,
      low: 213.72000122070312,
      close: 214.47000122070312,
      volume: 938233
    },
    {
      date: '2025-03-18T14:05:00.000Z',
      open: 214.49000549316406,
      high: 215.14999389648438,
      low: 214.1999969482422,
      close: 214.73500061035156,
      volume: 941677
    },
    {
      date: '2025-03-18T14:10:00.000Z',
      open: 214.72999572753906,
      high: 214.9095001220703,
      low: 213.68499755859375,
      close: 213.75999450683594,
      volume: 647749
    },
    {
      date: '2025-03-18T14:15:00.000Z',
      open: 213.77999877929688,
      high: 214.39999389648438,
      low: 213.72999572753906,
      close: 213.97999572753906,
      volume: 537378
    },
    {
      date: '2025-03-18T14:20:00.000Z',
      open: 213.97999572753906,
      high: 214.63999938964844,
      low: 213.75,
      close: 214.44000244140625,
      volume: 452204
    },
    {
      date: '2025-03-18T14:25:00.000Z',
      open: 214.47000122070312,
      high: 214.72999572753906,
      low: 214.3699951171875,
      close: 214.55140686035156,
      volume: 371032
    },
    {
      date: '2025-03-18T14:30:00.000Z',
      open: 214.5500030517578,
      high: 214.77000427246094,
      low: 214.4600067138672,
      close: 214.6781005859375,
      volume: 338934
    },
    {
      date: '2025-03-18T14:35:00.000Z',
      open: 214.68499755859375,
      high: 214.75,
      low: 214.37420654296875,
      close: 214.64999389648438,
      volume: 314691
    },
    {
      date: '2025-03-18T14:40:00.000Z',
      open: 214.66000366210938,
      high: 214.88999938964844,
      low: 214.0399932861328,
      close: 214.2100067138672,
      volume: 389544
    },
    {
      date: '2025-03-18T14:45:00.000Z',
      open: 214.2100067138672,
      high: 214.2449951171875,
      low: 213.7899932861328,
      close: 213.97999572753906,
      volume: 359960
    },
    {
      date: '2025-03-18T14:50:00.000Z',
      open: 213.97999572753906,
      high: 214.19000244140625,
      low: 213.86000061035156,
      close: 214.02499389648438,
      volume: 297881
    },
    {
      date: '2025-03-18T14:55:00.000Z',
      open: 214.02000427246094,
      high: 214.22999572753906,
      low: 213.4700927734375,
      close: 213.71499633789062,
      volume: 488576
    },
    {
      date: '2025-03-18T15:00:00.000Z',
      open: 213.70469665527344,
      high: 213.80999755859375,
      low: 213.19000244140625,
      close: 213.3300018310547,
      volume: 388580
    },
    {
      date: '2025-03-18T15:05:00.000Z',
      open: 213.3800048828125,
      high: 213.52000427246094,
      low: 213.08999633789062,
      close: 213.27999877929688,
      volume: 389509
    },
    {
      date: '2025-03-18T15:10:00.000Z',
      open: 213.2899932861328,
      high: 213.3090057373047,
      low: 212.9199981689453,
      close: 212.92999267578125,
      volume: 377028
    },
    {
      date: '2025-03-18T15:15:00.000Z',
      open: 212.9250030517578,
      high: 213.0800018310547,
      low: 212.64999389648438,
      close: 212.97000122070312,
      volume: 520753
    },
    {
      date: '2025-03-18T15:20:00.000Z',
      open: 212.99000549316406,
      high: 213.22000122070312,
      low: 212.8000030517578,
      close: 213.2010040283203,
      volume: 294476
    },
    {
      date: '2025-03-18T15:25:00.000Z',
      open: 213.2050018310547,
      high: 213.4644012451172,
      low: 213.2050018310547,
      close: 213.3300018310547,
      volume: 317410
    },
    {
      date: '2025-03-18T15:30:00.000Z',
      open: 213.25,
      high: 213.43499755859375,
      low: 213.08999633789062,
      close: 213.27000427246094,
      volume: 258827
    },
    {
      date: '2025-03-18T15:35:00.000Z',
      open: 213.25999450683594,
      high: 213.32000732421875,
      low: 213.08999633789062,
      close: 213.26019287109375,
      volume: 303973
    },
    {
      date: '2025-03-18T15:40:00.000Z',
      open: 213.3000030517578,
      high: 213.35000610351562,
      low: 212.91000366210938,
      close: 212.96499633789062,
      volume: 216841
    },
    {
      date: '2025-03-18T15:45:00.000Z',
      open: 212.9600067138672,
      high: 213.14830017089844,
      low: 212.88999938964844,
      close: 213.0800018310547,
      volume: 211841
    },
    {
      date: '2025-03-18T15:50:00.000Z',
      open: 213.07000732421875,
      high: 213.11000061035156,
      low: 212.7899932861328,
      close: 212.92999267578125,
      volume: 289033
    },
    {
      date: '2025-03-18T15:55:00.000Z',
      open: 212.92999267578125,
      high: 213.4149932861328,
      low: 212.8350067138672,
      close: 213.34500122070312,
      volume: 274373
    },
    {
      date: '2025-03-18T16:00:00.000Z',
      open: 213.31500244140625,
      high: 213.58999633789062,
      low: 213.24000549316406,
      close: 213.5,
      volume: 275509
    },
    {
      date: '2025-03-18T16:05:00.000Z',
      open: 213.49429321289062,
      high: 213.5072021484375,
      low: 213.2899932861328,
      close: 213.3800048828125,
      volume: 191234
    },
    {
      date: '2025-03-18T16:10:00.000Z',
      open: 213.3699951171875,
      high: 213.67999267578125,
      low: 213.36000061035156,
      close: 213.56500244140625,
      volume: 131326
    },
    {
      date: '2025-03-18T16:15:00.000Z',
      open: 213.77499389648438,
      high: 213.77499389648438,
      low: 213.20440673828125,
      close: 213.22000122070312,
      volume: 631654
    },
    {
      date: '2025-03-18T16:20:00.000Z',
      open: 213.22000122070312,
      high: 213.37060546875,
      low: 213.13009643554688,
      close: 213.3094940185547,
      volume: 167594
    },
    {
      date: '2025-03-18T16:25:00.000Z',
      open: 213.29739379882812,
      high: 213.32420349121094,
      low: 213.22500610351562,
      close: 213.2899932861328,
      volume: 67100
    },
    {
      date: '2025-03-18T16:27:48.000Z',
      open: 213.2899932861328,
      high: 213.2899932861328,
      low: 213.2899932861328,
      close: 213.2899932861328,
      volume: 0
    }
  ];

  // Generamos los datos del gráfico a partir del histórico diario
  const chartDataValues = {
    times: dailyHistory.map(item =>
      new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ),
    prices: dailyHistory.map(item => item.close)
  };

  // Configuración del gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(200, 200, 200, 0.1)',
        },
        ticks: {
          color: 'rgba(150, 150, 150, 0.8)',
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
      }
    }
  };

  const chartConfig = {
    labels: chartDataValues.times,
    datasets: [
      {
        label: 'Precio',
        data: chartDataValues.prices,
        borderColor: stock && stock.priceChange >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)',
        backgroundColor: stock && stock.priceChange >= 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        fill: false,
      },
    ],
  };

  useEffect(() => {
    if (!symbol) return;

    // Conectar al WebSocket
    ws.current = new WebSocket("ws://localhost:4000");

    ws.current.onopen = () => {
      console.log(`✅ Conectado al WebSocket para ${symbol}`);
      setConnected(true);
      ws.current?.send(JSON.stringify({ type: "subscribe", symbol }));
      setLoading(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "trade" && Array.isArray(message.data)) {
          const trade = message.data.find((t) => t.symbol === symbol);
          if (trade) {
            setStock((prevStock) => {
              const newStock = {
                ...prevStock,
                symbol: trade.symbol,
                price: trade.price,
                previousPrice: prevStock?.price || trade.price,
                priceChange: prevStock?.price ? ((trade.price - prevStock.price) / prevStock.price) * 100 : 0,
                volume: trade.volume,
                lastUpdate: new Date(trade.timestamp).toLocaleTimeString(),
                company: trade.company || prevStock?.company || {},
              };
              return newStock;
            });
          }
        }
      } catch (error) {
        console.error("❌ Error procesando mensaje WebSocket:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("🔴 WebSocket cerrado");
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
  }, [symbol]);

  // Funciones para manejo de inputs
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(value);
    if (stock?.price) {
      setShares(value / stock.price);
    }
  };

  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setShares(value);
    if (stock?.price) {
      setAmount(value * stock.price);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <RefreshCw className="animate-spin h-10 w-10 text-blue-500" />
    </div>
  );
  
  if (!stock) return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-base-100 p-8 rounded-lg shadow-md">
        <p className="text-red-500 font-bold">No se encontró la acción {symbol}</p>
        <button 
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={() => router.push('/market')}
        >
          Volver al mercado
        </button>
      </div>
    </div>
  );

  const priceChangeColor = stock.priceChange >= 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="bg-base-200 p-4 md:p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Columna izquierda: Gráfico y detalles */}
          <div className="w-full md:w-8/12 bg-base-100 rounded-xl shadow-md p-4 md:p-6">
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold">
                  {stock.symbol}
                </div>
                <button className="text-gray-400 hover:text-yellow-500">
                  <Star className="h-6 w-6" />
                </button>
              </div>
              <button className="text-gray-400">
                <MoreHorizontal className="h-6 w-6" />
              </button>
            </div>
            
            {/* Nombre de la empresa */}
            <div className="text-lg font-medium text-gray-700 mb-4">
              {stock.company?.name || "Interactive Broker"}
            </div>
            
            {/* Precio actual */}
            <div className="flex items-baseline gap-3 mb-4">
              <div className="text-3xl font-bold">
                {stock.price?.toFixed(2)} €
              </div>
              <div className={`flex items-center gap-1 font-bold ${priceChangeColor}`}>
                {stock.priceChange >= 0 ? 
                  <TrendingUp className="h-4 w-4" /> : 
                  <TrendingDown className="h-4 w-4" />
                }
                {Math.abs(stock.priceChange).toFixed(2)}% 
                ({Math.abs((stock.price - stock.previousPrice).toFixed(2))} €)
              </div>
            </div>
            
            {/* Selector de período */}
            <div className="flex gap-2 mb-4">
              {["1D", "1W", "1M", "6M", "1Y", "5Y"].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeTimeframe === period 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setActiveTimeframe(period)}
                >
                  {period}
                </button>
              ))}
            </div>
            
            {/* Gráfico con el histórico diario */}
            <div className="h-64 md:h-80 mt-4 mb-4">
              <Line options={chartOptions} data={chartConfig} />
            </div>
            
            {/* Hora actual */}
            <div className="flex justify-between items-center text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Actualizado: {stock.lastUpdate}</span>
              </div>
              <div>
                {connected ? (
                  <span className="flex items-center gap-1 text-green-500">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Conectado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Desconectado
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Columna derecha: Compra/Venta y Posición */}
          <div className="w-full md:w-4/12 flex flex-col gap-4">
            {/* Panel de compra/venta */}
            <div className="bg-base-100 rounded-xl shadow-md p-4 md:p-6">
              <div className="flex mb-4">
                <button
                  className={`flex-1 text-center py-2 font-medium ${
                    activeTab === "Buy" 
                      ? "text-blue-500 border-b-2 border-blue-500" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("Buy")}
                >
                  Comprar
                </button>
                <button
                  className={`flex-1 text-center py-2 font-medium ${
                    activeTab === "Sell" 
                      ? "text-blue-500 border-b-2 border-blue-500" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("Sell")}
                >
                  Vender
                </button>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                30.94 € disponibles
              </div>
              
              <div className="flex gap-2 mb-4">
                <button
                  className={`flex-1 text-center py-1 text-sm font-medium ${
                    true ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  Cantidad
                </button>
                <button
                  className={`flex-1 text-center py-1 text-sm font-medium ${
                    false ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  Acciones
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
                <input
                  type="number"
                  className="w-full p-2 bg-gray-100 rounded-lg text-right"
                  value={amount}
                  onChange={handleAmountChange}
                  min="0"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-600 mb-1">Acciones</label>
                <input
                  type="number"
                  className="w-full p-2 bg-gray-100 rounded-lg text-right"
                  value={shares.toFixed(6)}
                  onChange={handleSharesChange}
                  min="0"
                  step="0.000001"
                />
              </div>
              
              <button
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Revisar Orden
              </button>
            </div>
            
            {/* Panel de posición */}
            <div className="bg-base-100 rounded-xl shadow-md p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Posición</h2>
              
              <div className="mb-4">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold">{position.total.toFixed(2)} €</div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-500">Rendimiento</div>
                <div className={`text-lg font-bold flex items-center gap-1 ${position.performance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {position.performance >= 0 ? 
                    <TrendingUp className="h-4 w-4" /> : 
                    <TrendingDown className="h-4 w-4" />
                  }
                  {position.performance.toFixed(2)} € ({position.performancePercent.toFixed(2)}%)
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-gray-500">Acciones</div>
                  <div className="font-medium">{position.shares.toFixed(6)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Precio compra</div>
                  <div className="font-medium">{position.buyIn.toFixed(2)} €</div>
                </div>
                <div>
                  <div className="text-gray-500">% Cartera</div>
                  <div className="font-medium">{position.portfolio.toFixed(2)}%</div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <a href="#" className="text-blue-500 hover:underline">
                  Más información sobre la compra
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
