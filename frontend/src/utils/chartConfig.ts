// src/utils/chartConfig.ts
import { ChartOptions } from "chart.js";

export const getChartData = (stock: any) => {
  const times = stock?.history?.map((item: any) =>
    new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  ) || [];
  const prices = stock?.history?.map((item: any) => item.close) || [];
  return { times, prices };
};

export const chartOptions: ChartOptions = {
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

export const getChartConfig = (chartData: { times: string[]; prices: number[] }, stock: any) => ({
  labels: chartData.times,
  datasets: [
    {
      label: "Precio",
      data: chartData.prices,
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
});
