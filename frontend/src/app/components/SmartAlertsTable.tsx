import React, { useMemo } from "react";
import { Table } from "./Table";
import { Badge } from "./Badge";
import { RiskBar } from "./RiskBar";
import { LoadingSkeleton } from "./LoadingSkeleton";

export interface SmartAlertRow {
  _id: string;
  severity: string;
  user_id: string;
  event_type: string;
  device: string;
  location: string;
  rule_triggered: string;
  timestamp: string;
  recommendation: string;
}

export interface SmartAlertsTableProps {
  data: SmartAlertRow[];
  loading?: boolean;
}

export const SmartAlertsTable: React.FC<SmartAlertsTableProps> = ({ data, loading }) => {
  const columns = useMemo<import("./Table").TableColumn<SmartAlertRow>[]>(
    () => [
      { key: "severity", label: "Severity", render: (row) => <Badge color={row.severity === "High" ? "bg-red-100 text-red-800" : row.severity === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>{row.severity}</Badge> },
      { key: "user_id", label: "User ID" },
      { key: "event_type", label: "Event Type" },
      { key: "device", label: "Device" },
      { key: "location", label: "Location" },
      { key: "rule_triggered", label: "Rule Triggered" },
      { key: "timestamp", label: "Timestamp", render: (row) => new Date(row.timestamp).toLocaleString() },
      { key: "recommendation", label: "Recommendation" },
    ],
    []
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-0">
      <Table columns={columns} data={data} loading={loading} />
    </div>
  );
};
