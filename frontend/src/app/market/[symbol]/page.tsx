"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, RefreshCw, Star, MoreHorizontal, Clock, Info, Wallet, Zap } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

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
  const [userStocks, setUserStocks] = useState<any[]>([]);
  const [credit, setCredit] = useState(0);
  const [position, setPosition] = useState({
    total: 0,
    performance: 0,
    performancePercent: 0,
    shares: 0,
    buyIn: 0,
    portfolio: 0,
  });
  const [activeTimeframe, setActiveTimeframe] = useState("1D");

  // Datos para el gráfico
  const chartDataValues = {
    times: stock?.history?.map((item: any) =>
      new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ) || [],
    prices: stock?.history?.map((item: any) => item.close) || [],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        position: "right",
        grid: { color: "rgba(200, 200, 200, 0.1)" },
        ticks: { color: "rgba(150, 150, 150, 0.8)" },
      },
    },
    elements: { line: { tension: 0.4 }, point: { radius: 0 } },
  };

  const chartConfig = {
    labels: chartDataValues.times,
    datasets: [
      {
        label: "Precio",
        data: chartDataValues.prices,
        borderColor:
          stock && stock.priceChange >= 0
            ? "rgba(34, 197, 94, 1)"
            : "rgba(239, 68, 68, 1)",
        backgroundColor:
          stock && stock.priceChange >= 0
            ? "rgba(34, 197, 94, 0.5)"
            : "rgba(239, 68, 68, 0.5)",
        fill: false,
      },
    ],
  };

  const fetchStockData = async (interval: string = '5m', range: string = "1d") => {
    try {
      // Obtener datos históricos
      let link = `http://localhost:4000/api/market/${symbol}/?interval=${interval}&range=${range}`;
      console.log(link)
      const historyResponse = await fetch(link);
      if (!historyResponse.ok) throw new Error("Error obteniendo datos históricos");
      const historyData = await historyResponse.json();
      
      setStock({
        history: historyData, // Asignar datos históricos al estado del stock
      });
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos del stock:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!symbol) return;
    

    fetchStockData();

    const fetchUserData = async () => {
      try {
        const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!profileResponse.ok) throw new Error("Error obteniendo datos del usuario");
        const profileData = await profileResponse.json();
        setCredit(profileData.credit);

        const stocksResponse = await fetch("http://localhost:4000/api/user/stocks", {
          method: "GET",
          credentials: "include",
        });
        if (!stocksResponse.ok) throw new Error("Error obteniendo acciones del usuario");
        const stocksData = await stocksResponse.json();
        setUserStocks(stocksData.stocks || []);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();

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
          const trade = message.data.find((t: any) => t.symbol === symbol);
          if (trade) {
            setStock((prevStock: any) => {
              const newStock = {
                ...prevStock,
                symbol: trade.symbol,
                price: trade.price,
                previousPrice: prevStock?.price || trade.price,
                priceChange: prevStock?.price
                  ? ((trade.price - prevStock.price) / prevStock.price) * 100
                  : 0,
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

  // Calcular la posición cuando cambian los datos de usuario o stock
  useEffect(() => {
    if (!stock || !userStocks.length) return;

    const userPosition = userStocks.find((s) => s.symbol === symbol);

    if (userPosition) {
      const currentValue = userPosition.quantity * stock.price;
      const initialValue = userPosition.quantity * userPosition.purchasePrice;
      const performance = currentValue - initialValue;
      const performancePercent = initialValue > 0 ? (performance / initialValue) * 100 : 0;

      const totalPortfolioValue = userStocks.reduce((total, s) => {
        const currentStockPrice = s.symbol === symbol ? stock.price : s.purchasePrice;
        return total + (s.quantity * currentStockPrice);
      }, 0);

      const portfolioPercent = totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;

      setPosition({
        total: currentValue,
        performance: performance,
        performancePercent: performancePercent,
        shares: userPosition.quantity,
        buyIn: userPosition.purchasePrice,
        portfolio: portfolioPercent,
      });
    } else {
      setPosition({
        total: 0,
        performance: 0,
        performancePercent: 0,
        shares: 0,
        buyIn: 0,
        portfolio: 0,
      });
    }
  }, [stock, userStocks, symbol]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(value);
    if (stock?.price && !isNaN(value)) {
      setShares(value / stock.price);
    }
  };

  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setShares(value);
    if (stock?.price && !isNaN(value)) {
      setAmount(value * stock.price);
    }
  };

  const handleBuyStock = async () => {
    if (!stock || !stock.price || shares <= 0) return;

    const purchaseData = {
      symbol: stock.symbol,
      quantity: shares,
      purchasePrice: stock.price,
    };

    try {
      const response = await fetch("http://localhost:4000/api/market/buy", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al comprar acción:", errorData);
      } else {
        const result = await response.json();
        console.log("Compra realizada exitosamente:", result);

        const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
          method: "GET",
          credentials: "include",
        });
        const profileData = await profileResponse.json();
        setCredit(profileData.credit);

        const stocksResponse = await fetch("http://localhost:4000/api/user/stocks", {
          method: "GET",
          credentials: "include",
        });
        const stocksData = await stocksResponse.json();
        setUserStocks(stocksData.stocks || []);

        setAmount(0);
        setShares(0);
      }
    } catch (error) {
      console.error("Error en la compra de acciones:", error);
    }
  };

  const handleSellStock = async () => {
    if (!stock || !stock.price || shares <= 0) return;

    const sellData = {
      symbol: stock.symbol,
      quantity: shares,
      sellPrice: stock.price,
    };

    try {
      const response = await fetch("http://localhost:4000/api/market/sell", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sellData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al vender acción:", errorData);
      } else {
        const result = await response.json();
        console.log("Venta realizada exitosamente:", result);

        const profileResponse = await fetch("http://localhost:4000/api/user/profile", {
          method: "GET",
          credentials: "include",
        });
        const profileData = await profileResponse.json();
        setCredit(profileData.credit);

        const stocksResponse = await fetch("http://localhost:4000/api/user/stocks", {
          method: "GET",
          credentials: "include",
        });
        const stocksData = await stocksResponse.json();
        setUserStocks(stocksData.stocks || []);

        setAmount(0);
        setShares(0);
      }
    } catch (error) {
      console.error("Error en la venta de acciones:", error);
    }
  };
  const getInterval = (period: string): string => {
    switch (period) {
      case "1D":
        return "5m"; // 1 día, cada 5 minutos
      case "1W":
        return "1h"; // 1 semana, cada hora
      case "1M":
        return "1d"; // 1 mes, cada hora
      case "6M":
        return "1d"; // 6 meses, cada día
      case "1Y":
        return "1d"; // 1 año, cada día
      case "5Y":
        return "1wk"; // 5 años, cada día
      default:
        return "5m"; // Valor por defecto
    }
  };
  
  const getRange = (period: string): string => {
    switch (period) {
      case "1D":
        return "1d"; // 1 día
      case "1W":
        return "5d"; // 1 semana
      case "1M":
        return "1mo"; // 1 mes
      case "6M":
        return "6mo"; // 6 meses
      case "1Y":
        return "1y"; // 1 año
      case "5Y":
        return "5y"; // 5 años
      default:
        return "1d"; // Valor por defecto
    }
  };
  
  const handleSellPercentage = (percent: number) => {
    if (position.shares) {
      const sellShares = position.shares * percent;
      setShares(sellShares);
      if (stock?.price) {
        setAmount(sellShares * stock.price);
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-base-200">
        <RefreshCw className="animate-spin h-10 w-10 text-primary" />
      </div>
    );

  if (!stock)
    return (
      <div className="flex justify-center items-start h-[80vh] bg-base-200 pt-[15em]">
        <div className="card bg-base-100 p-8 shadow-xl">
          <p className="text-error font-bold">
            No se encontró la acción {symbol}
          </p>
          <button
            className="mt-4 btn btn-primary"
            onClick={() => router.push("/market")}
          >
            Volver al mercado
          </button>
        </div>
      </div>
    );

  const priceChangeColor = stock.priceChange >= 0 ? "text-success" : "text-error";

  return (
    <div className="bg-base-200 p-4 md:p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Columna izquierda: Gráfico y detalles */}
          <div className="w-full md:w-8/12 bg-base-100 rounded-xl shadow-xl p-4 md:p-6">
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold">{stock.symbol}</div>
                <button className="btn btn-ghost btn-circle">
                  <Star className="h-6 w-6 text-base-content hover:text-warning" />
                </button>
              </div>
              <button className="btn btn-ghost btn-circle">
                <MoreHorizontal className="h-6 w-6" />
              </button>
            </div>

            {/* Nombre de la empresa */}
            <div className="text-lg font-medium text-base-content/70 mb-4">
              {stock.company?.name || "Interactive Broker"}
            </div>

            {/* Precio actual */}
            <div className="flex items-baseline gap-3 mb-4">
              <div className="text-3xl font-bold">
                {stock.price?.toFixed(2)} €
              </div>
              <div
                className={`flex items-center gap-1 font-bold ${priceChangeColor}`}
              >
                {stock.priceChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(stock.priceChange).toFixed(2)}% (
                {Math.abs(parseFloat((stock.price - stock.previousPrice).toFixed(2)))} €)
              </div>
            </div>

            {/* Selector de período */}
            <div className="flex gap-2 mb-4 flex-wrap">
  {["1D", "1W", "1M", "6M", "1Y", "5Y"].map((period) => (
    <button
      key={period}
      className={`btn btn-sm ${
        activeTimeframe === period ? "btn-primary" : "btn-outline"
      }`}
      onClick={() => {
        setActiveTimeframe(period); // Cambiar el período activo
        // Llamar a la función fetchStockData con el intervalo y el rango adecuados
        const interval = getInterval(period); // Una función para mapear el periodo
        const range = getRange(period); // Una función para mapear el rango
        fetchStockData(interval, range); // Llamar a la función con los valores
      }}
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
            <div className="flex justify-between items-center text-base-content/70 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Actualizado: {stock.lastUpdate}</span>
              </div>
              <div>
                {connected ? (
                  <span className="flex items-center gap-1 text-success">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    Conectado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-error">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
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
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-4 md:p-6">
                <div className="tabs tabs-boxed mb-4">
                  <a
                    className={`tab flex-1 ${activeTab === "Buy" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("Buy")}
                  >
                    Comprar
                  </a>
                  <a
                    className={`tab flex-1 ${activeTab === "Sell" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("Sell")}
                  >
                    Vender
                  </a>
                </div>

                <div className="flex items-center text-sm mb-4">
                  <Wallet className="h-4 w-4 mr-2 text-base-content/70" />
                  <span className="text-base-content/70">{credit.toFixed(2)} € disponibles</span>
                </div>

                <div className="flex items-center text-sm mb-4">
                  <Zap className="h-4 w-4 mr-2 text-base-content/70" />
                  <span className="text-base-content/70">Acciones: {position.shares.toFixed(6)}</span>
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Cantidad (€)</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="input input-bordered w-full text-right"
                      value={amount || ""}
                      onChange={handleAmountChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text">Acciones</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="input input-bordered w-full text-right"
                      value={shares}
                      onChange={handleSharesChange}
                      min="0"
                    />
                  </div>
                </div>

                {activeTab === "Sell" && (
                  <div className="flex justify-center gap-2 mb-4">
                    <button className="btn btn-outline btn-sm" onClick={() => handleSellPercentage(0.25)}>25%</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleSellPercentage(0.5)}>50%</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleSellPercentage(1)}>100%</button>
                  </div>
                )}

                {activeTab === "Buy" ? (
                  <button
                    className={`btn btn-primary w-full ${amount <= 0 || shares <= 0 || amount > credit ? "btn-disabled" : ""}`}
                    onClick={handleBuyStock}
                  >
                    Comprar
                  </button>
                ) : (
                  <button
                    className={`btn btn-secondary w-full ${shares <= 0 || shares > position.shares ? "btn-disabled" : ""}`}
                    onClick={handleSellStock}
                  >
                    Vender
                  </button>
                )}

                {activeTab === "Buy" && amount > credit && (
                  <div className="mt-2 text-error text-sm flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Saldo insuficiente
                  </div>
                )}

                {activeTab === "Sell" && shares > position.shares && (
                  <div className="mt-2 text-error text-sm flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    No tienes suficientes acciones
                  </div>
                )}
              </div>
            </div>

            {/* Panel de posición */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-4 md:p-6">
                <h2 className="card-title mb-4">Posición</h2>

                {position.shares > 0 ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm text-base-content/70">Total</div>
                      <div className="text-2xl font-bold">
                        {position.total.toFixed(2)} €
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-base-content/70">Rendimiento</div>
                      <div
                        className={`text-lg font-bold flex items-center gap-1 ${
                          position.performance >= 0
                            ? "text-success"
                            : "text-error"
                        }`}
                      >
                        {position.performance >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {position.performance.toFixed(2)} € (
                        {position.performancePercent.toFixed(2)}%)
                      </div>
                    </div>

                    <div className="stats stats-sm shadow bg-base-200">
                      <div className="stat">
                        <div className="stat-title">Acciones</div>
                        <div className="stat-value text-base">{position.shares.toFixed(6)}</div>
                      </div>

                      <div className="stat">
                        <div className="stat-title">Precio compra</div>
                        <div className="stat-value text-base">{position.buyIn.toFixed(2)} €</div>
                      </div>

                      <div className="stat">
                        <div className="stat-title">% Cartera</div>
                        <div className="stat-value text-base">{position.portfolio.toFixed(2)}%</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <a href="#" className="btn btn-link btn-sm p-0 no-underline text-primary">
                        <Info className="h-4 w-4 mr-1" />
                        Más información sobre la posición
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="alert">
                    <Info className="h-6 w-6" />
                    <span>No tienes ninguna acción de {symbol}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;