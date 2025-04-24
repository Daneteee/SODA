import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StockChart({ chartOptions, chartConfig }) {
  return (
    <div className="h-64 md:h-80 mt-4 mb-4">
      <Line options={chartOptions} data={chartConfig} />
    </div>
  );
}