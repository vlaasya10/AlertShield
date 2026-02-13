import React from "react";

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

export function Table<T extends { [key: string]: any }>({
  columns,
  data,
  loading = false,
  emptyText = "No data found.",
  className = "",
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-neutral-800">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={`px-4 py-2 font-semibold ${col.className || ""}`}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-8">Loading...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-8">{emptyText}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-100 dark:hover:bg-neutral-800">
                {columns.map((col) => (
                  <td key={String(col.key)} className={`px-4 py-2 ${col.className || ""}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
