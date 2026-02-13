import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, TrendingDown, Shield } from "lucide-react";

import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import metricsService, {
  MetricsSummary,
  AlertTrendItem,
  SeverityDistribution,
  DecisionDistribution,
  HighRiskAlert,
} from "../../services/metrics.service";

export function Metrics() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [trend, setTrend] = useState<AlertTrendItem[]>([]);
  const [severity, setSeverity] = useState<SeverityDistribution | null>(null);
  const [decision, setDecision] = useState<DecisionDistribution | null>(null);
  const [highRisk, setHighRisk] = useState<HighRiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      metricsService.getSummary(),
      metricsService.getAlertTrend(30),
      metricsService.getSeverityDistribution(),
      metricsService.getDecisionDistribution(),
      metricsService.getHighRisk(),
    ])
      .then(([summary, trend, severity, decision, highRisk]) => {
        setSummary(summary);
        setTrend(Array.isArray(trend) ? trend : []);
        setSeverity(severity);
        setDecision(decision);
        setHighRisk(Array.isArray(highRisk) ? highRisk : []);
      })
      .catch((e) => setError(e.message || "Failed to load metrics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-white">Loading metrics...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  /* ---------------- KPI Calculations ---------------- */

  const totalEvents = summary?.totalEvents ?? 0;
  const alertReduction = summary?.alertReductionPercentage ?? 0;
  const avgRiskScore = summary?.averageRiskScore ?? 0;
  const escalationRate = summary?.escalationRate ?? 0;

  const sortedTrend = [...trend].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const last7 = sortedTrend.slice(-7).reduce((s, d) => s + (d.raw || 0), 0);
  const prev7 = sortedTrend
    .slice(-14, -7)
    .reduce((s, d) => s + (d.raw || 0), 0);

  const volumeTrend =
    prev7 > 0 ? (((last7 - prev7) / prev7) * 100).toFixed(1) : "0.0";

  const severityArray = severity
    ? Object.entries(severity).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const decisionArray = decision
    ? Object.entries(decision).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const colorMap: Record<string, string> = {
    blue: "text-blue-400",
    green: "text-green-400",
    orange: "text-orange-400",
    red: "text-red-400",
    teal: "text-teal-400",
  };

  const kpis = [
    {
      title: "Total Events",
      value: totalEvents.toLocaleString(),
      icon: Activity,
      color: "blue",
      subtitle: "All security events",
    },
    {
      title: "Alert Reduction",
      value: `${alertReduction}%`,
      icon: TrendingDown,
      color: "green",
      subtitle: "Noise filtered",
    },
    {
      title: "Avg Risk Score",
      value: avgRiskScore,
      icon: Shield,
      color: "orange",
      subtitle: "Smart alerts",
    },
    {
      title: "Escalation Rate",
      value: `${escalationRate}%`,
      icon: AlertTriangle,
      color: "red",
      subtitle: "Require attention",
    },
    {
      title: "Volume Trend",
      value: `${Number(volumeTrend) > 0 ? "+" : ""}${volumeTrend}%`,
      icon: TrendingDown,
      color: "teal",
      subtitle: "Last 7 days",
    },
  ];

  /* ---------------- UI ---------------- */

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white">
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {kpis.map((card, i) => (
          <div
            key={i}
            className="bg-slate-900 rounded-lg p-5 flex items-center gap-4"
          >
            <card.icon className={`w-8 h-8 ${colorMap[card.color]}`} />
            <div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs text-slate-400">{card.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TREND CHART */}
      <div className="bg-slate-900 rounded-lg p-6 mb-8">
        <h2 className="text-lg mb-4">Alert Trends (30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={sortedTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="raw"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* SEVERITY & DECISION PIE */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6">
          <h2 className="text-lg mb-4">Severity Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityArray}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {severityArray.map((entry, index) => (
                  <Cell key={index} fill={
                    entry.name === "low" ? "#22c55e" :
                    entry.name === "medium" ? "#facc15" :
                    entry.name === "high" ? "#ef4444" :
                    entry.name === "critical" ? "#a21caf" : "#64748b"
                  } />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-6">
          <h2 className="text-lg mb-4">Decision Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={decisionArray}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {decisionArray.map((entry, index) => (
                  <Cell key={index} fill={
                    entry.name === "suppress" ? "#64748b" :
                    entry.name === "review" ? "#facc15" :
                    entry.name === "escalate" ? "#ef4444" : "#6366f1"
                  } />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HIGH RISK TABLE */}
      <div className="bg-slate-900 rounded-lg p-6">
        <h2 className="text-lg mb-4">High Risk Alerts</h2>

        {highRisk.length === 0 ? (
          <div className="text-slate-400">No high-risk alerts found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Risk Score</th>
                <th className="text-left p-2">Decision</th>
                <th className="text-left p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {highRisk.map((alert, idx) => (
                <tr key={idx} className="border-b border-slate-800">
                  <td className="p-2">{alert.user_id}</td>
                  <td className="p-2">{alert.risk_score}</td>
                  <td className="p-2">{alert.decision}</td>
                  <td className="p-2">
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
}
