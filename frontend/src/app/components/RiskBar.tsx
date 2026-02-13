import React from "react";

interface RiskBarProps {
  risk: number; // 0-100
  className?: string;
}

export const RiskBar: React.FC<RiskBarProps> = ({ risk, className = "" }) => {
  let color = "bg-green-500";
  if (risk > 70) color = "bg-red-500";
  else if (risk > 40) color = "bg-yellow-500";

  return (
    <div className={`w-full h-2 rounded bg-gray-200 ${className}`}>
      <div
        className={`h-2 rounded ${color}`}
        style={{ width: `${risk}%` }}
      />
    </div>
  );
};
