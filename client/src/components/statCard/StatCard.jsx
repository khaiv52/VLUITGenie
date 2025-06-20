import React from "react";
import "./statCard.css";

function StatCard({ icon, value, label }) {
  return (
    <div className="flex-grow basis-[300px] max-w-full">
      <div className="w-full h-full stat-card">
        <div className="icon" style={{ color: "var(--icon-color)" }}>
          {icon}
        </div>
        <dl>
          <dd style={{ color: "var(--text-color)" }}>{label}</dd>
          <dt style={{ color: "var(--text-color)" }}>{value}</dt>
        </dl>
      </div>
    </div>
  );
}

export default StatCard;
