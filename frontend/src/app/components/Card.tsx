import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div
    className={`bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);
