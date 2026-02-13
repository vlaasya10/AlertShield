import React, { useEffect, useState } from 'react';
import metricsService, { MetricsSummary, AlertTrendItem, SeverityDistribution, HighRiskAlert } from '../../services/metrics.service';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';

function getSeverityBgColor(severity: string) {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'bg-red-700 border-red-500 text-red-200';
    case 'high': return 'bg-orange-700 border-orange-500 text-orange-200';
    case 'medium': return 'bg-yellow-700 border-yellow-500 text-yellow-200';
    case 'low': return 'bg-green-700 border-green-500 text-green-200';
    default: return 'bg-slate-700 border-slate-500 text-slate-200';
  }
}

function getSeverityLabelFromScore(score?: number): 'critical' | 'high' | 'medium' | 'low' {
  if (typeof score !== 'number') {
    return 'low';
  }
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

export function Dashboard() {
  // Defensive state
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [trend, setTrend] = useState<AlertTrendItem[]>([]);
  const [severity, setSeverity] = useState<SeverityDistribution | null>(null);
  const [highRiskAlerts, setHighRiskAlerts] = useState<HighRiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryResp, trendResp, severityResp, highRiskResp] = await Promise.all([
          metricsService.getSummary(),
          metricsService.getAlertTrend(30),
          metricsService.getSeverityDistribution(),
          metricsService.getHighRisk()
        ]);

        if (cancelled) {
          return;
        }

        setSummary(summaryResp ?? null);
        setTrend(Array.isArray(trendResp) ? trendResp : []);
        setSeverity(severityResp ?? null);
        setHighRiskAlerts(Array.isArray(highRiskResp) ? highRiskResp : []);
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Failed to load dashboard';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // Defensive mapping for trend data
  const timeSeriesData = trend.map(item => ({
    date: item?.date ?? 'Unknown',
    rawAlerts: item?.raw ?? 0,
    smartAlerts: item?.smart ?? 0
  }));
  const severityLevels: Array<keyof SeverityDistribution> = ['low', 'medium', 'high', 'critical'];

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }
  if (!trend.length) return <div>No trend data available</div>;

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
            <p className="text-xs uppercase text-slate-400">Total Events</p>
            <p className="text-2xl font-semibold text-white">{summary.totalEvents.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
            <p className="text-xs uppercase text-slate-400">Smart Alerts</p>
            <p className="text-2xl font-semibold text-white">{summary.smartAlerts.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
            <p className="text-xs uppercase text-slate-400">Alert Reduction</p>
            <p className="text-2xl font-semibold text-white">{summary.alertReductionPercentage.toFixed(2)}%</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Alert Trends - Line Chart */}
        <div className="rounded-lg p-6 bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-6">Alert Trends (30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#e6e6ff' }} />
              <Line type="monotone" dataKey="rawAlerts" stroke="#f97316" strokeWidth={2} dot={false} name="Raw Alerts" />
              <Line type="monotone" dataKey="smartAlerts" stroke="#a855f7" strokeWidth={2} dot={false} name="Smart Alerts" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Volume - Bar Chart */}
        <div className="rounded-lg p-6 bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-6">Alert Volume Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeSeriesData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#e6e6ff' }} />
              <Bar dataKey="rawAlerts" fill="#f97316" name="Raw Alerts" />
              <Bar dataKey="smartAlerts" fill="#a855f7" name="Smart Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {severity && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {severityLevels.map(level => (
            <div key={level} className="rounded-lg bg-slate-900 border border-slate-800 p-4">
              <p className="text-xs uppercase text-slate-400">{level}</p>
              <p className="text-2xl font-semibold text-white">{severity[level]}</p>
            </div>
          ))}
        </div>
      )}

      {/* High-Risk Alerts Table */}
      <div className="rounded-lg bg-slate-900 border border-slate-800">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">High-Risk Alerts</h3>
          <p className="text-sm text-slate-400 mt-1">Critical and high severity alerts requiring attention</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Severity', 'User ID', 'Event ID', 'Risk Score', 'Decision', 'Timestamp'].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {highRiskAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-400">No high-risk alerts found.</td>
                </tr>
              ) : (
                highRiskAlerts.map(alert => {
                  const severityLabel = getSeverityLabelFromScore(alert?.risk_score);
                  const riskScore = typeof alert?.risk_score === 'number'
                    ? Math.round(alert.risk_score)
                    : null;
                  return (
                    <tr key={alert.alert_id ?? `${alert.user_id}-${alert.event_id}`} className="hover:bg-slate-800/30 transition-colors cursor-default">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getSeverityBgColor(severityLabel)}`}>
                          {severityLabel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-200">{alert.user_id ?? 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{alert.event_id ?? 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{riskScore !== null ? riskScore : 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{alert.decision ? alert.decision.toUpperCase() : 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'N/A'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
