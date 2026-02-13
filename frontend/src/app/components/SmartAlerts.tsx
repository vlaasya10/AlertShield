import React, { useEffect, useState } from "react";
import { SmartAlertsTable } from "./SmartAlertsTable";
import alertsService from "../../services/alerts.service";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";

export const SmartAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    alertsService.getAlerts({ decision: "escalate" })
      .then((resp: any) => setAlerts(resp.data))
      .catch((err: any) => setError(err?.message || "Failed to load alerts"))
      .finally(() => setLoading(false));
  }, []);

  // Map backend data to SmartAlertRow for the table
  let mappedAlerts: import("./SmartAlertsTable").SmartAlertRow[] = alerts.map((a: any) => ({
    _id: a._id,
    severity: a.severity || (typeof a.risk_score === "number" ? (a.risk_score > 70 ? "High" : a.risk_score > 40 ? "Medium" : "Low") : "-"),
    user_id: a.user_id || "-",
    event_type: a.event_type || a.type || a.decision || "-",
    device: a.device || "-",
    location: a.location || "-",
    rule_triggered: a.rule_triggered || a.explanation || a.description || "-",
    timestamp: a.timestamp,
    recommendation: a.recommendation || "-",
  }));

  // Filter by decision type
  if (filter !== "all") {
    mappedAlerts = mappedAlerts.filter(a => a.event_type.toLowerCase() === filter);
  }
  // Search by user_id, device, location, rule_triggered
  if (search.trim()) {
    const s = search.trim().toLowerCase();
    mappedAlerts = mappedAlerts.filter(a =>
      a.user_id.toLowerCase().includes(s) ||
      a.device.toLowerCase().includes(s) ||
      a.location.toLowerCase().includes(s) ||
      a.rule_triggered.toLowerCase().includes(s)
    );
  }

  const filterOptions = [
    { label: "All Decisions", value: "all" },
    { label: "Review", value: "review" },
    { label: "Suppress", value: "suppress" },
    { label: "Escalate", value: "escalate" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by user, device, location, rule..." className="md:w-80" />
          <FilterBar filters={filterOptions} selected={filter} onSelect={setFilter} />
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-0">
          {loading ? (
            <div className="p-8 text-center">Loading alerts...</div>
          ) : error ? (
            <div className="p-8 text-red-500">Error: {error}</div>
          ) : mappedAlerts.length === 0 ? (
            <div className="p-8 text-slate-400">No Escalated Alerts Found</div>
          ) : (
            <SmartAlertsTable data={mappedAlerts} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
};
