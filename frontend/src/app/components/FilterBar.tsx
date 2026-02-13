import React from "react";

export interface FilterBarProps {
  filters: { label: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, selected, onSelect, className = "" }) => (
  <div className={`flex gap-2 ${className}`}>
    {filters.map(f => (
      <button
        key={f.value}
        className={`px-3 py-1 rounded ${selected === f.value ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-neutral-800"}`}
        onClick={() => onSelect(f.value)}
      >
        {f.label}
      </button>
    ))}
  </div>
);
