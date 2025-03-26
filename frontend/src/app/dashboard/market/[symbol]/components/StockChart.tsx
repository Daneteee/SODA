import { Line } from "react-chartjs-2";

export default function StockChart({
  chartOptions,
  chartConfig,
  activeTimeframe,
  setActiveTimeframe,
  loadStockData,
}: {
  chartOptions: any;
  chartConfig: any;
  activeTimeframe: string;
  setActiveTimeframe: (timeframe: string) => void;
  loadStockData: (interval: string, range: string) => void;
}) {
  const getInterval = (period: string): string => {
    switch (period) {
      case "1D":
        return "5m";
      case "1W":
        return "1h";
      case "1M":
        return "1d";
      case "6M":
        return "1d";
      case "1Y":
        return "1d";
      case "5Y":
        return "1wk";
      default:
        return "5m";
    }
  };

  const getRange = (period: string): string => {
    switch (period) {
      case "1D":
        return "1d";
      case "1W":
        return "5d";
      case "1M":
        return "1mo";
      case "6M":
        return "6mo";
      case "1Y":
        return "1y";
      case "5Y":
        return "5y";
      default:
        return "1d";
    }
  };

  return (
    <div>
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
      <div className="h-64 md:h-80 mt-4 mb-4">
        <Line options={chartOptions} data={chartConfig} />
      </div>
    </div>
  );
}