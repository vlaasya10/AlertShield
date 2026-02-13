import React from "react";

export interface BadgeProps {
  color?: string;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ color = "bg-blue-100 text-blue-800", children, className = "" }) => (
  <span
    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${color} ${className}`}
  >
    {children}
  </span>
);
