// src/utils/chartConfig.js

export const getChartData = (stock) => {
  const times =
    stock?.history?.map((item) =>
      new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    ) || [];
  const prices = stock?.history?.map((item) => item.close) || [];
  return { times, prices };
};

export const chartOptions = {
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

export const getChartConfig = (chartData, stock) => ({
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