"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import PositionPanel from "@/components/stock/PositionPanel";
import NewsPanel from "@/components/stock/NewsPanel";
import BuySellPanel from "@/components/stock/BuySellPanel";
import StockHeader from "@/components/stock/StockHeader";
import StockChart from "@/components/stock/StockChart";
import { getChartData, chartOptions, getChartConfig } from "@/utils/chartConfig";
import { useStockData } from "@/hooks/stock/useStockData";
import { useNewsData } from "@/hooks/stock/useNewsData";
import { useUserPosition } from "@/hooks/stock/useUserPosition";
import { useStockTransactions } from "@/hooks/stock/useStockTransactions";
import { useWebSocket } from "@/context/WebSocketProvider";
import { isMarketClosed, MarketClosedAlert } from "@/utils/marketUtils";

export default function StockDetailPage() {
  const { symbol: paramSymbol } = useParams();
  const symbol = typeof paramSymbol === "string" ? paramSymbol : "";

  // Acceso a datos del WebSocket
  const { stockData: wsStockData } = useWebSocket();

  // Recuperar los datos del sessionStorage de una sola vez
  let sessionStockInfo = null;
  if (typeof window !== "undefined") {
    try {
      const storedStockData = sessionStorage.getItem("selectedStock");
      if (storedStockData) {
        const parsedData = JSON.parse(storedStockData);
        // Solo usamos si corresponde al stock actual
        if (parsedData.symbol === symbol) {
          sessionStockInfo = parsedData;
        }
      }
    } catch (error) {
      console.error("Error al recuperar datos del sessionStorage:", error);
    }
  }

  // Encontrar los datos en tiempo real del WebSocket
  const wsStock = wsStockData.find((s) => s.symbol === symbol);

  // Hook existente para obtener datos del stock
  const { stock: apiStock, loading, userStocks, credit, loadStockData, loadUserData } = useStockData(symbol);

  // Combinar y adaptar todas las fuentes de datos para que coincidan con la estructura esperada por StockHeader
  const combinedStock = {
    symbol: symbol,
    // Datos base de la API
    ...apiStock,

    // Adaptación para el componente StockHeader
    image: sessionStockInfo?.logo || apiStock?.image,
    company: {
      name: sessionStockInfo?.name || apiStock?.company?.name || symbol,
    },

    // Datos en tiempo real del WebSocket (principalmente el precio)
    price: wsStock?.price 
      ?? sessionStockInfo?.lastYahooPrice 
      ?? sessionStockInfo?.price 
      ?? apiStock?.lastYahooPrice 
      ?? apiStock?.price,

    // Resto de datos del sessionStorage que puedan ser útiles
    description: sessionStockInfo?.description,
    sector: sessionStockInfo?.sector,
    country: sessionStockInfo?.country,
    exchange: sessionStockInfo?.exchange,
    website: sessionStockInfo?.website,
    currency: sessionStockInfo?.currency,
  };

  const position = useUserPosition(combinedStock, userStocks, symbol);
  const {
    amount,
    shares,
    handleAmountChange,
    handleSharesChange,
    handleBuyStock,
    handleSellStock,
    handleSellPercentage,
  } = useStockTransactions({
    stock: combinedStock,
    credit,
    positionShares: position.shares,
    loadUserData,
  });

  const [newsOpen, setNewsOpen] = useState(false);
  const { newsItems, newsLoading } = useNewsData(symbol, newsOpen);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Buy");
  const [activeTimeframe, setActiveTimeframe] = useState("1D");

  // Construir datos y configuración del gráfico
  const chartDataValues = getChartData(combinedStock);
  const chartConfig = getChartConfig(chartDataValues, combinedStock);

  // Calcular el porcentaje de cambio dinámicamente según el timeframe
  const history = combinedStock.history || [];
  const basePrice = history.length > 0 ? history[0].close : undefined;
  const currentPrice = combinedStock.price;
  const priceChange = basePrice
    ? ((currentPrice - basePrice) / basePrice) * 100
    : 0;

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-base-200">
        <RefreshCw className="animate-spin h-10 w-10 text-primary" />
      </div>
    );

  if (!combinedStock || Object.keys(combinedStock).length === 0)
    return (
      <div className="flex justify-center items-start h-[80vh] bg-base-200 pt-[15em]">
        <div className="card bg-base-100 p-8 shadow-xl">
          <p className="text-error font-bold">No se encontró la acción {symbol}</p>
          <button
            className="mt-4 btn btn-primary"
            onClick={() => router.push("/dashboard/market")}
          >
            Volver al mercado
          </button>
        </div>
      </div>
    );

  const priceChangeColor =
    combinedStock.priceChange >= 0 || combinedStock.price > combinedStock.previousPrice
      ? "text-success"
      : "text-error";

  return (
    <div className="bg-base-200 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {isMarketClosed() && <MarketClosedAlert />}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Columna izquierda: Gráfico y detalles */}
          <div className="w-full md:w-8/12 bg-base-100 rounded-xl shadow-xl p-4 md:p-6">
            {/* Encabezado - usando los datos adaptados */}
            <StockHeader
              stock={combinedStock}
              priceChangeColor={priceChange >= 0 ? "text-success" : "text-error"}
              priceChange={priceChange}
              activeTimeframe={activeTimeframe}
              setActiveTimeframe={setActiveTimeframe}
              loadStockData={loadStockData}
            />

            {/* Gráfico */}
            <StockChart chartConfig={chartConfig} chartOptions={chartOptions} />

            {/* Información adicional si está disponible */}
            {combinedStock.description && (
              <div className="mt-4 p-3 bg-base-200 rounded-lg">
                <h3 className="font-semibold mb-2">Acerca de {combinedStock.company?.name || symbol}</h3>
                <p className="text-sm">{combinedStock.description}</p>
              </div>
            )}

            {/* Información adicional del sector/país si está disponible */}
            {(combinedStock.sector || combinedStock.country) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {combinedStock.sector && (
                  <div className="badge badge-outline">{combinedStock.sector}</div>
                )}
                {combinedStock.country && (
                  <div className="badge badge-outline">{combinedStock.country}</div>
                )}
                {combinedStock.exchange && (
                  <div className="badge badge-outline">{combinedStock.exchange}</div>
                )}
              </div>
            )}

            {/* Sitio web si está disponible */}
            {combinedStock.website && (
              <div className="mt-3">
                <a
                  href={combinedStock.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-sm"
                >
                  Sitio web oficial
                </a>
              </div>
            )}
          </div>

          {/* Columna derecha: Compra/Venta, Posición y Noticias */}
          <div className="overflow-y-auto h-[70vh] w-full md:w-4/12 flex flex-col gap-4 rounded-xl">
            {/* Panel de compra/venta con datos combinados */}
            <BuySellPanel
              credit={credit}
              position={position}
              amount={amount}
              shares={shares}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleBuy={handleBuyStock}
              handleSell={handleSellStock}
              handleSellPercentage={handleSellPercentage}
              handleAmountChange={handleAmountChange}
              handleSharesChange={handleSharesChange}
            />

            {/* Panel de posición */}
            <PositionPanel position={position} symbol={symbol} />

            {/* Panel de noticias con nombre de empresa mejorado */}
            <NewsPanel
              stockSymbol={symbol}
              newsOpen={newsOpen}
              setNewsOpen={setNewsOpen}
              newsLoading={newsLoading}
              newsItems={newsItems}
              companyName={combinedStock.company?.name || symbol}
            />
          </div>
        </div>
      </div>
    </div>
  );
}