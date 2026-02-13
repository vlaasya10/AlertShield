import React from "react";

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-neutral-700 rounded ${className}`} />
);
