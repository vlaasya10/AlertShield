import React, { useEffect, useMemo, useState } from "react";
import alertsService from "../../services/alerts.service";

type DecisionFilter = "all" | "review" | "suppress" | "escalate";

interface AlertRow {
  _id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  user_id: string;
  event_type: string;
  device: string;
  location: string;
  rule_triggered: string;
  timestamp: string;
}

export const RawAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DecisionFilter>("all");

  useEffect(() => {
    setLoading(true);
    alertsService
      .getAlerts({ page: 1, limit: 200 })
      .then((resp: any) => setAlerts(resp?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  // Severity logic from risk_score
  const getSeverity = (score: number): AlertRow["severity"] => {
    if (score >= 85) return "CRITICAL";
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  };

  const mappedAlerts: AlertRow[] = useMemo(() => {
    let data = alerts.map((a: any) => ({
      _id: a._id,
      severity: getSeverity(a.risk_score ?? 0),
      user_id: a.user_id ?? "-",
      event_type: a.rule_triggered ?? "Login Event",
      device: a.metadata?.device?.os
        ? `${a.metadata.device.os} ${a.metadata.device.type ?? ""}`
        : "-",
      location: a.metadata?.location?.city
        ? `${a.metadata.location.city}, ${a.metadata.location.country}`
        : "-",
      rule_triggered: a.rule_triggered ?? "-",
      timestamp: a.timestamp,
      decision: a.decision,
    }));

    if (filter !== "all") {
      data = data.filter((a: any) => a.decision === filter);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.user_id.toLowerCase().includes(s) ||
          a.device.toLowerCase().includes(s) ||
          a.location.toLowerCase().includes(s) ||
          a.rule_triggered.toLowerCase().includes(s),
      );
    }

    return data;
  }, [alerts, filter, search]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 px-8 py-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-6">Raw Alerts</h1>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by user, device, location, rule..."
          className="bg-[#1e293b] border border-slate-700 px-4 py-2 rounded-md w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {["all", "review", "suppress", "escalate"].map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d as DecisionFilter)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === d
                ? "bg-indigo-600 text-white"
                : "bg-[#1e293b] text-slate-300 hover:bg-slate-700"
            }`}
          >
            {d === "all"
              ? "All Decisions"
              : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111827] rounded-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">
            Loading alerts...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#1f2937] text-slate-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Severity</th>
                <th className="px-6 py-4 text-left">User ID</th>
                <th className="px-6 py-4 text-left">Event Type</th>
                <th className="px-6 py-4 text-left">Device</th>
                <th className="px-6 py-4 text-left">Location</th>
                <th className="px-6 py-4 text-left">Rule Triggered</th>
                <th className="px-6 py-4 text-left">Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {mappedAlerts.map((alert) => (
                <tr
                  key={alert._id}
                  className="border-t border-slate-800 hover:bg-[#1e293b] transition"
                >
                  <td className="px-6 py-4">
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td className="px-6 py-4 font-medium">{alert.user_id}</td>
                  <td className="px-6 py-4">{alert.event_type}</td>
                  <td className="px-6 py-4">{alert.device}</td>
                  <td className="px-6 py-4">{alert.location}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {alert.rule_triggered}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  const styles: Record<string, string> = {
    LOW: "bg-blue-900 text-blue-400",
    MEDIUM: "bg-yellow-900 text-yellow-400",
    HIGH: "bg-orange-900 text-orange-400",
    CRITICAL: "bg-red-900 text-red-400",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[severity]}`}
    >
      {severity}
    </span>
  );
};
