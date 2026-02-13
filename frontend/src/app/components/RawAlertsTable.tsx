import React, { useMemo } from "react";
import { Table } from "./Table";
import { Badge } from "./Badge";
import { RiskBar } from "./RiskBar";
import { LoadingSkeleton } from "./LoadingSkeleton";

export interface AlertRow {
  _id: string;
  severity: string;
  user_id: string;
  event_type: string;
  device: string;
  location: string;
  rule_triggered: string;
  timestamp: string;
}

export interface RawAlertsTableProps {
  data: AlertRow[];
  loading?: boolean;
}

export const RawAlertsTable: React.FC<RawAlertsTableProps> = ({ data, loading }) => {
  const columns = useMemo<import("./Table").TableColumn<AlertRow>[]>(
    () => [
      { key: "severity", label: "Severity", render: (row) => <Badge color={row.severity === "High" ? "bg-red-100 text-red-800" : row.severity === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-black-100 text-white-800"}>{row.severity}</Badge> },
      { key: "user_id", label: "User ID" },
      { key: "event_type", label: "Event Type" },
      { key: "device", label: "Device" },
      { key: "location", label: "Location" },
      { key: "rule_triggered", label: "Rule Triggered" },
      { key: "timestamp", label: "Timestamp", render: (row) => new Date(row.timestamp).toLocaleString() },
    ],
    []
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-0">
      <Table columns={columns} data={data} loading={loading} />
    </div>
  );
};
