import { Activity, AlertTriangle, Zap, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getMetrics, getTimeSeriesData, getRawAlerts, type RawAlert } from '../utils/mockData';

export function Dashboard() {
  const metrics = getMetrics();
  const timeSeriesData = getTimeSeriesData();
  const rawAlerts = getRawAlerts();

  // Get high-risk alerts (critical and high severity, recent first)
  const highRiskAlerts = rawAlerts
    .filter(alert => alert.severity === 'critical' || alert.severity === 'high')
    .slice(0, 15);

  const kpiCards = [
    {
      title: 'Total Events',
      value: metrics.totalEvents.toLocaleString(),
      icon: Activity,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Raw Alerts',
      value: metrics.totalRawAlerts.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Smart Alerts',
      value: metrics.totalSmartAlerts.toLocaleString(),
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-700/10',
    },
    {
      title: 'Alert Reduction',
      value: `${metrics.alertReduction}%`,
      icon: TrendingDown,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ];

  const getSeverityColor = (severity: RawAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-purple-400';
    }
  };

  const getSeverityBgColor = (severity: RawAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'low': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-lg p-6 bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-sm text-slate-400">{card.title}</div>
            </div>
          );
        })}
      </div>

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
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
              />
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
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#e6e6ff' }} />
              <Bar dataKey="rawAlerts" fill="#f97316" name="Raw Alerts" />
              <Bar dataKey="smartAlerts" fill="#a855f7" name="Smart Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
                {['Severity', 'User ID', 'Event Type', 'Device', 'Location', 'Rule', 'Timestamp'].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {highRiskAlerts.map(alert => (
                <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors cursor-default">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getSeverityBgColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-200">{alert.userId}</td>
                  <td className="px-6 py-4 text-sm text-slate-200">{alert.eventType}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{alert.device}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{alert.location}</td>
                  <td className="px-6 py-4 text-sm font-mono text-xs text-slate-400">{alert.ruleTriggered}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{alert.timestamp.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
