"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const StockDetail = () => {
  const { symbol } = useParams();
  interface Stock {
    symbol: string;
    name: string;
    price: number;
    volume: number;
    open: number;
    high: number;
    low: number;
  }

  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    fetch(`/api/market/stock/${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStock(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symbol]);

  if (loading) return <p>Cargando...</p>;
  if (!stock) return <p>No se encontró la acción</p>;

  // Datos para el gráfico
  const chartData = {
    labels: ["Open", "High", "Low", "Close"],
    datasets: [
      {
        label: `Histórico ${stock.symbol}`,
        data: [stock.open, stock.high, stock.low, stock.price],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{stock.symbol} - {stock.name}</h1>
      <p className="text-lg">Precio actual: ${stock.price}</p>
      <p className="text-sm text-gray-500">Volumen: {stock.volume}</p>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Histórico</h2>
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default StockDetail;
