// Tarjeta de estadísticas
import React from "react";

const StatsCard = ({ title, value, description, className }) => (
  <div className={`stats shadow ${className}`}>
    <div className="stat">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {description && <div className="stat-desc">{description}</div>}
    </div>
  </div>
);

export default StatsCard;