"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import Image from "next/image";
import { getInterval, getRange } from "@/utils/chartUtils";

export default function StockHeader({
  stock,
  priceChangeColor,
  activeTimeframe,
  setActiveTimeframe,
  loadStockData,
}) {
  const [isFav, setIsFav] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 1) On mount, load current favs and set initial state
  useEffect(() => {
    async function fetchFavs() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const { favs } = await res.json();
        // Verificar si el símbolo está en favoritos (ahora favs es un array de objetos)
        setIsFav(favs.some(fav => 
          typeof fav === 'string' 
            ? fav === stock.symbol 
            : fav.symbol === stock.symbol
        ));
      } catch (err) {
        console.error(err);
      }
    }
    fetchFavs();
  }, [stock.symbol]);

  // 2) Toggle the favorite on click
  const handleToggle = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites/${stock.symbol}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Toggle failed");
      const { favs } = await res.json();
      // Verificar si el símbolo está en favoritos (ahora favs es un array de objetos)
      setIsFav(favs.some(fav => 
        typeof fav === 'string' 
          ? fav === stock.symbol 
          : fav.symbol === stock.symbol
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {stock.image && !imageError ? (
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={stock.image}
                alt={`${stock.company?.name || stock.symbol} icon`}
                fill
                sizes="40px"
                className="object-cover"
                onError={() => setImageError(true)}
                priority
              />
            </div>
          ) : (
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-lg font-bold">{stock.symbol.substring(0, 2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* 3) Star button with filled/unfilled state */}
        <button
          onClick={() => stock.symbol && handleToggle()}
          disabled={!stock.symbol}
          className="btn btn-ghost btn-circle"
        >
          <Star
            className={`h-6 w-6 ${
              isFav
                ? "text-warning fill-current" // filled yellow
                : "text-base-content stroke-current" // outline
            }`}
          />
        </button>
      </div>

      {/* Company name */}
      <div className="text-3xl font-bold mb-2">
        {stock.company?.name || stock.symbol || "Cargando"}
      </div>

      {/* Price and change */}
      <div className="flex items-baseline gap-3 mb-4">
        <div className="text-3xl font-bold">
          {stock.price?.toFixed(2)} €
        </div>
        <div className={`flex items-center gap-1 font-bold ${priceChangeColor}`}>
          {stock.priceChange >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {(
            isFinite(stock.priceChange) && !isNaN(stock.priceChange)
              ? Math.abs(stock.priceChange)
              : stock.previousPrice && stock.price
                ? Math.abs(((stock.price - stock.previousPrice) / stock.previousPrice) * 100)
                : 0
          ).toFixed(2)}% (
          {Math.abs(
            parseFloat((stock.price - stock.previousPrice).toFixed(2))
          )}{" "}
          €)
        </div>
      </div>

      {/* Timeframe selector */}
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