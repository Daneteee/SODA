import { TrendingUp, TrendingDown, Star, MoreHorizontal } from "lucide-react";

export default function StockHeader({ stock }: { stock: any }) {
  const priceChangeColor = stock.priceChange >= 0 ? "text-success" : "text-error";

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {stock.image ? (
            <img
              src={stock.image}
              alt={`${stock.company.name} icon`}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="text-4xl font-bold">{stock.symbol}</div>
          )}
          <button className="btn btn-ghost btn-circle">
            <Star className="h-6 w-6 text-base-content hover:text-warning" />
          </button>
        </div>
        <button className="btn btn-ghost btn-circle">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>
      <div className="text-3xl font-bold mb-2">{stock.company?.name || "Cargando"}</div>
      <div className="flex items-baseline gap-3 mb-4">
        <div className="text-3xl font-bold">{stock.price?.toFixed(2)} €</div>
        <div className={`flex items-center gap-1 font-bold ${priceChangeColor}`}>
          {stock.priceChange >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {Math.abs(stock.priceChange).toFixed(2)}% (
          {Math.abs(parseFloat((stock.price - stock.previousPrice).toFixed(2)))} €)
        </div>
      </div>
    </div>
  );
}