import { TrendingUp, TrendingDown, Info } from "lucide-react";

interface Position {
  total: number;
  performance: number;
  performancePercent: number;
  shares: number;
  buyIn: number;
  portfolio: number;
}

interface PositionPanelProps {
  position: Position;
  symbol: string;
}

export default function PositionPanel({ position, symbol }: PositionPanelProps) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-4 md:p-6">
        <h2 className="card-title mb-4">Posición</h2>
        {position.shares > 0 ? (
          <>
            <div className="mb-4">
              <div className="text-sm text-base-content/70">Total</div>
              <div className="text-2xl font-bold">
                {position.total.toFixed(2)} €
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-base-content/70">Rendimiento</div>
              <div
                className={`text-lg font-bold flex items-center gap-1 ${
                  position.performance >= 0 ? "text-success" : "text-error"
                }`}
              >
                {position.performance >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {position.performance.toFixed(2)} € (
                {position.performancePercent.toFixed(2)}%)
              </div>
            </div>
            <div className="stats stats-sm shadow bg-base-200">
              <div className="stat">
                <div className="stat-title">Acciones</div>
                <div className="stat-value text-base">
                  {position.shares.toFixed(6)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Precio compra</div>
                <div className="stat-value text-base">
                  {position.buyIn.toFixed(2)} €
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">% Cartera</div>
                <div className="stat-value text-base">
                  {position.portfolio.toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="#"
                className="btn btn-link btn-sm p-0 no-underline text-primary"
              >
                <Info className="h-4 w-4 mr-1" />
                Más información sobre la posición
              </a>
            </div>
          </>
        ) : (
          <div className="alert">
            <Info className="h-6 w-6" />
            <span>No tienes ninguna acción de {symbol}</span>
          </div>
        )}
      </div>
    </div>
  );
}