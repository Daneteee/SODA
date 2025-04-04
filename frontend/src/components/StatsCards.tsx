"use client";

interface StatsCardsProps {
  portfolioValue: number;
  gain: number;
  gainPercent: number;
  transactionsCount: number;
  credit: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  portfolioValue,
  gain,
  gainPercent,
  transactionsCount,
  credit,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Portfolio Value */}
      <div className="stats shadow bg-primary text-primary-content overflow-hidden">
        <div className="stat">
          <div className="stat-title text-primary-content/60">Portfolio Value</div>
          <div className="stat-value text-primary-content/60">${portfolioValue.toFixed(2)}</div>
          <div className="stat-desc text-primary-content/60">Valor actualizado</div>
        </div>
      </div>

      {/* Ganancias */}
      <div className="stats shadow bg-accent text-accent-content">
        <div className="stat">
          <div className="stat-title text-accent-content/60">Ganancias</div>
          <div className="stat-value text-accent-content/60">
            {gain >= 0 ? `+$${gain.toFixed(2)}` : `-$${Math.abs(gain).toFixed(2)}`}
          </div>
          <div className="stat-desc text-accent-content/60">
            {gainPercent >= 0
              ? `↗︎ ${gainPercent.toFixed(2)}%`
              : `↘︎ ${Math.abs(gainPercent).toFixed(2)}%`}
          </div>
        </div>
      </div>

      {/* Operaciones */}
      <div className="stats shadow bg-secondary text-secondary-content">
        <div className="stat">
          <div className="stat-title text-secondary-content/60">Operaciones</div>
          <div className="stat-value text-secondary-content/60">{transactionsCount}</div>
        </div>
      </div>

      {/* Balance */}
      <div className="stats shadow bg-neutral text-neutral-content overflow-hidden">
        <div className="stat">
          <div className="stat-title text-neutral-content/60">Balance</div>
          <div className="stat-value text-neutral-content/60">${credit.toFixed(2)}</div>
          <div className="stat-desc text-neutral-content/60">Disponible</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
