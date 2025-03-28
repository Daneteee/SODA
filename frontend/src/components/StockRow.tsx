import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface Stock {
  symbol: string;
  name?: string;
  price?: number;
  priceChange?: number;
  company?: { logo?: string };
}

interface StockRowProps {
  stock: Stock;
  renderStockLogo: (stock: Stock) => React.ReactNode;
}

const StockRow: React.FC<StockRowProps> = ({ stock, renderStockLogo }) => {
  const router = useRouter();

  return (
    <tr
      className="hover:bg-base-200 transition-colors duration-200 cursor-pointer"
      onClick={() => router.push(`/dashboard/market/${stock.symbol}`)}
    >
      <td>
        <div className="flex items-center gap-3">
          {renderStockLogo(stock)}
          <div>
            <div className="font-bold">{stock.name || stock.symbol}</div>
            <div className="text-sm opacity-50">{stock.symbol}</div>
          </div>
        </div>
      </td>
      <td className="font-mono font-bold">
        {stock.price !== undefined ? `$${stock.price.toFixed(2)}` : "N/A"}
      </td>
      <td>
        <div
          className={`flex items-center gap-1 font-bold ${
            stock.priceChange !== undefined && stock.priceChange >= 0
              ? "text-success"
              : "text-error"
          }`}
        >
          {stock.priceChange !== undefined && stock.priceChange >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {stock.priceChange !== undefined ? stock.priceChange.toFixed(2) : "N/A"}%
        </div>
      </td>
      <td>
        <button className="btn btn-sm btn-success text-white mr-2">Comprar</button>
        <button className="btn btn-sm btn-error text-white">Vender</button>
      </td>
    </tr>
  );
};

export default StockRow;
