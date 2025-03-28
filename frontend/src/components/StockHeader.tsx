import { TrendingUp, TrendingDown, Star, MoreHorizontal } from "lucide-react";
import { getInterval, getRange } from "@/utils/chartUtils";

interface StockHeaderProps {
  stock: {
    image?: string;
    symbol: string;
    company?: {
      name: string;
    };
    price?: number;
    priceChange: number;
    previousPrice: number;
  };
  priceChangeColor: string;
  activeTimeframe: string;
  setActiveTimeframe: (period: string) => void;
  loadStockData: (interval: string, range: string) => void;
}

export default function StockHeader({
  stock,
  priceChangeColor,
  activeTimeframe,
  setActiveTimeframe,
  loadStockData,
}: StockHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {stock.image ? (
            <img
              src={stock.image}
              alt={`${stock.company?.name} icon`}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="text-4xl font-bold">{stock.symbol}</div>
          )}
        </div>
        <button className="btn btn-ghost btn-circle">
            <Star className="h-6 w-6 text-base-content hover:text-warning" />
        </button>
      </div>
      {/* Nombre de la empresa */}
      <div className="text-3xl font-bold mb-2">{stock.company?.name || "Cargando"}</div>
      {/* Precio actual */}
      <div className="flex items-baseline gap-3 mb-4">
        <div className="text-3xl font-bold">{stock.price?.toFixed(2)} €</div>
        <div className={`flex items-center gap-1 font-bold ${priceChangeColor}`}>
          {stock.priceChange >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {Math.abs(stock.priceChange).toFixed(2)}% (
          {Math.abs(parseFloat((stock.price! - stock.previousPrice).toFixed(2)))} €)
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
              setActiveTimeframe(period);
              const interval = getInterval(period);
              const range = getRange(period);
              loadStockData(interval, range);
            }}
          >
            {period}
          </button>
        ))}
      </div>
    </>
  );
}