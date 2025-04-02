"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw} from "lucide-react";
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


export default function StockDetailPage() {
  const { symbol: paramSymbol } = useParams();
  const symbol = typeof paramSymbol === "string" ? paramSymbol : "";
  const { stock, loading, userStocks, credit, loadStockData, loadUserData } = useStockData(symbol);
  const position = useUserPosition(stock, userStocks, symbol);
  const { amount, shares, handleAmountChange, handleSharesChange, handleBuyStock, handleSellStock, handleSellPercentage } = useStockTransactions({ stock, credit, positionShares: position.shares, loadUserData });
  const [newsOpen, setNewsOpen] = useState(false);
  const { newsItems, newsLoading } = useNewsData(symbol, newsOpen);
  const router = useRouter();
  

  const [activeTab, setActiveTab] = useState("Buy");
  const [activeTimeframe, setActiveTimeframe] = useState("1D");

  // Construir datos y configuración del gráfico
  const chartDataValues = getChartData(stock);
  const chartConfig = getChartConfig(chartDataValues, stock);
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
          <p className="text-error font-bold">No se encontró la acción {symbol}</p>
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
    <div className="bg-base-200 p-4 md:p-6 ">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Columna izquierda: Gráfico y detalles */}
          <div className=" w-full md:w-8/12 bg-base-100 rounded-xl shadow-xl p-4 md:p-6">
            {/* Encabezado */}
            <StockHeader stock={stock} priceChangeColor={priceChangeColor} activeTimeframe={activeTimeframe} setActiveTimeframe={setActiveTimeframe} loadStockData={loadStockData} />
            {/* Gráfico */}
            <StockChart chartConfig={chartConfig} chartOptions={chartOptions}/>
          </div>
          {/* Columna derecha: Compra/Venta, Posición y Noticias */}
          <div className="overflow-y-auto h-[70vh] w-full md:w-4/12 flex flex-col gap-4 rounded-xl">
            {/* Panel de compra/venta */}
            
            <BuySellPanel credit={credit} position={position} amount={amount} shares={shares} activeTab={activeTab} setActiveTab={setActiveTab} handleBuy={handleBuyStock} handleSell={handleSellStock} handleSellPercentage={handleSellPercentage} handleAmountChange={handleAmountChange} handleSharesChange={handleSharesChange} />
            {/* Panel de posición */}
            <PositionPanel position={position} symbol={symbol} />
            {/* Panel de noticias en menú desplegable */}
            <NewsPanel stockSymbol={symbol} newsOpen={newsOpen} setNewsOpen={setNewsOpen} newsLoading={newsLoading} newsItems={newsItems} />
          </div>
        </div>
      </div>
    </div>
  );
}