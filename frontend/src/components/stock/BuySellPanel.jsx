import { Wallet, Zap, Info } from "lucide-react";
import { isMarketClosed, MarketClosedAlert } from "@/utils/marketUtils";

export default function BuySellPanel({
  credit,
  position,
  amount,
  shares,
  activeTab,
  setActiveTab,
  handleBuy,
  handleSell,
  handleSellPercentage,
  handleAmountChange,
  handleSharesChange,
}) {
  const isButtonDisabled = () => {
    if (isMarketClosed()) return true;
    if (activeTab === "Buy") {
      return amount <= 0 || shares <= 0 || amount > credit;
    } else {
      return shares <= 0 || shares > position.shares;
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-4 md:p-6">
        <div className="tabs tabs-boxed mb-4">
          <a
            className={`tab flex-1 ${activeTab === "Buy" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("Buy")}
          >
            Comprar
          </a>
          <a
            className={`tab flex-1 ${activeTab === "Sell" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("Sell")}
          >
            Vender
          </a>
        </div>
        <div className="flex items-center text-sm mb-4">
          <Wallet className="h-4 w-4 mr-2 text-base-content/70" />
          <span className="text-base-content/70">
            {credit.toFixed(2)} € disponibles
          </span>
        </div>
        <div className="flex items-center text-sm mb-4">
          <Zap className="h-4 w-4 mr-2 text-base-content/70" />
          <span className="text-base-content/70">
            Acciones: {position.shares.toFixed(6)}
          </span>
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Cantidad (€)</span>
          </label>
          <div className="input-group">
            <input
              type="text"
              className="input input-bordered w-full text-right"
              value={amount || ""}
              onChange={handleAmountChange}
              min="0"
              disabled={isMarketClosed()}
            />
          </div>
        </div>
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Acciones</span>
          </label>
          <div className="input-group">
            <input
              type="text"
              className="input input-bordered w-full text-right"
              value={shares || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleSharesChange(e);
                }
              }}
              min="0"
              disabled={isMarketClosed()}
            />
          </div>
        </div>
        {activeTab === "Sell" && (
          <div className="flex justify-center gap-2 mb-4">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleSellPercentage(0.25)}
              disabled={isMarketClosed()}
            >
              25%
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleSellPercentage(0.5)}
              disabled={isMarketClosed()}
            >
              50%
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleSellPercentage(1)}
              disabled={isMarketClosed()}
            >
              100%
            </button>
          </div>
        )}
        {activeTab === "Buy" ? (
          <button
            className={`btn btn-primary w-full ${isButtonDisabled() ? "btn-disabled" : ""}`}
            onClick={handleBuy}
            disabled={isButtonDisabled()}
          >
            Comprar
          </button>
        ) : (
          <button
            className={`btn btn-secondary w-full ${isButtonDisabled() ? "btn-disabled" : ""}`}
            onClick={handleSell}
            disabled={isButtonDisabled()}
          >
            Vender
          </button>
        )}
        {isMarketClosed() && <MarketClosedAlert />}
        {activeTab === "Buy" && amount > credit && (
          <div className="mt-2 text-error text-sm flex items-center">
            <Info className="h-4 w-4 mr-1" />
            Saldo insuficiente
          </div>
        )}
        {activeTab === "Sell" && shares > position.shares && (
          <div className="mt-2 text-error text-sm flex items-center">
            <Info className="h-4 w-4 mr-1" />
            No tienes suficientes acciones
          </div>
        )}
      </div>
    </div>
  );
}