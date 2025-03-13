"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { Stock } from "@/types/stock";

const StockDetail = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    fetch(`http://localhost:4000/api/market/stock/${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStock({
            ...data.data,
            price: Number(data.data.price) || 0, // Convertir a número
            previousPrice: Number(data.data.previousPrice) || null, // Convertir a número o null
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symbol]);

  if (loading) return <p className="text-white">Cargando...</p>;
  if (!stock) return <p className="text-red-500">No se encontró la acción</p>;

  // Validar que price sea un número antes de formatearlo
  const price = typeof stock.price === "number" ? stock.price.toFixed(2) : "0.00";
  const previousPrice =
    stock.previousPrice && typeof stock.previousPrice === "number"
      ? stock.previousPrice.toFixed(2)
      : "N/A";

  // Variación del precio respecto al anterior
  const priceDifference =
    stock.previousPrice && typeof stock.previousPrice === "number"
      ? stock.price - stock.previousPrice
      : 0;
  const priceChangeColor = priceDifference >= 0 ? "text-green-500" : "text-red-500";

  // Convertir timestamp a fecha legible
  const formattedDate = stock.lastUpdate
    ? new Date(stock.lastUpdate).toLocaleString("es-ES")
    : "Fecha desconocida";

  return (
    <div className="bg-neutral text-white p-6 rounded-xl shadow-lg w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{stock.name}</h1>
        <span className="text-gray-400 text-sm">{stock.symbol}</span>
      </div>

      {/* Price & Change */}
      <div className="mt-2">
        <h2 className="text-3xl font-semibold">{price} €</h2>
        <span className={`text-sm ${priceChangeColor}`}>
          {priceDifference.toFixed(2)} € ({stock.priceChange.toFixed(2)}%)
        </span>
      </div>

      {/* Última actualización */}
      <p className="text-gray-400 text-sm mt-1">Última actualización: {formattedDate}</p>

      {/* Condiciones del mercado */}
      {stock.conditions.length > 0 && (
        <div className="mt-2 text-gray-300 text-sm">
          <strong>Condiciones del mercado:</strong> {stock.conditions.join(", ")}
        </div>
      )}
    </div>
  );
};

export default StockDetail;
