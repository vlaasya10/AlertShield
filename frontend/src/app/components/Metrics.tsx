import {
  Activity,
  AlertTriangle,
  Zap,
  TrendingDown,
  Users,
  Clock,
  Shield,
  CheckCircle,
} from 'lucide-react';
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
} from 'recharts';
import {
  getMetrics,
  getTimeSeriesData,
  getRawAlerts,
  getSmartAlerts,
} from '../utils/mockData';

export function Metrics() {
  const metrics = getMetrics();
  const timeSeriesData = getTimeSeriesData();
  const rawAlerts = getRawAlerts();
  const smartAlerts = getSmartAlerts();

  const severityDistribution = [
    {
      name: 'Critical',
      value: rawAlerts.filter((a) => a.severity === 'critical').length,
      color: '#ef4444',
    },
    {
      name: 'High',
      value: rawAlerts.filter((a) => a.severity === 'high').length,
      color: '#f97316',
    },
    {
      name: 'Medium',
      value: rawAlerts.filter((a) => a.severity === 'medium').length,
      color: '#eab308',
    },
    {
      name: 'Low',
      value: rawAlerts.filter((a) => a.severity === 'low').length,
      color: '#3b82f6',
    },
  ];

  const decisionDistribution = [
    {
      name: 'Escalated',
      value: smartAlerts.filter((a) => a.decision === 'Escalated').length,
      color: '#ef4444',
    },
    {
      name: 'Suppressed',
      value: smartAlerts.filter((a) => a.decision === 'Suppressed').length,
      color: '#22c55e',
    },
  ];

  const uniqueUsers = new Set(rawAlerts.map((a) => a.userId)).size;
  const avgRiskScore = (
    smartAlerts.reduce((sum, a) => sum + a.riskScore, 0) / smartAlerts.length
  ).toFixed(1);

  const last7Days = timeSeriesData.slice(-7).reduce((sum, d) => sum + (d.rawAlerts || 0), 0);
const prev7Days = timeSeriesData.slice(-14, -7).reduce((sum, d) => sum + (d.rawAlerts || 0), 0);

// Safe calculation of volume trend
const volumeTrend = prev7Days
  ? (((last7Days - prev7Days) / prev7Days) * 100).toFixed(1)
  : '0.0';

  const kpiCards = [
    {
      title: 'Total Events',
      value: metrics.totalEvents.toLocaleString(),
      icon: Activity,
      color: 'blue',
      subtitle: 'All security events',
    },
    {
      title: 'Alert Reduction',
      value: `${metrics.alertReduction}%`,
      icon: TrendingDown,
      color: 'green',
      subtitle: 'Noise filtered',
    },
    {
      title: 'Monitored Users',
      value: uniqueUsers.toLocaleString(),
      icon: Users,
      color: 'purple',
      subtitle: 'Unique accounts',
    },
    {
      title: 'Avg Risk Score',
      value: avgRiskScore,
      icon: Shield,
      color: 'orange',
      subtitle: 'Smart alerts only',
    },
    {
      title: 'Escalation Rate',
      value: `${(
        (smartAlerts.filter((a) => a.decision === 'Escalated').length /
          smartAlerts.length) *
        100
      ).toFixed(1)}%`,
      icon: AlertTriangle,
      color: 'red',
      subtitle: 'Require attention',
    },
    {
      title: 'Auto-Suppressed',
      value: `${(
        (smartAlerts.filter((a) => a.decision === 'Suppressed').length /
          smartAlerts.length) *
        100
      ).toFixed(1)}%`,
      icon: CheckCircle,
      color: 'green',
      subtitle: 'False positives',
    },
    {
  title: 'Volume Trend',
  value: `${Number(volumeTrend) > 0 ? '+' : ''}${volumeTrend}%`,
  icon: TrendingDown,
  color: Number(volumeTrend) > 0 ? 'red' : 'green',
  subtitle: '7-day change',
},
    {
      title: 'Processing Time',
      value: '<100ms',
      icon: Clock,
      color: 'blue',
      subtitle: 'Avg latency',
    },
  ];

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Metrics & Analytics</h2>
        <p className="text-slate-400">
          Comprehensive security operations metrics and performance indicators
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:bg-slate-800/30 transition"
            >
              <div className="flex items-center mb-3">
                <div
                  className={`p-2.5 rounded-lg`}
                  style={{ backgroundColor: `${card.color}-500/10` }}
                >
                  <Icon className={`w-5 h-5 text-${card.color}-400`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-sm font-medium text-slate-300 mb-0.5">{card.title}</div>
              <div className="text-xs text-slate-500">{card.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Alert Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Alert Volume Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSmart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="rawAlerts"
                stroke="#f97316"
                fillOpacity={1}
                fill="url(#colorRaw)"
                name="Raw Alerts"
              />
              <Area
                type="monotone"
                dataKey="smartAlerts"
                stroke="#a855f7"
                fillOpacity={1}
                fill="url(#colorSmart)"
                name="Smart Alerts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value.toLocaleString()}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
