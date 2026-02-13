import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import { getSmartAlerts, type SmartAlert } from '../utils/mockData';

type SortField = 'timestamp' | 'userId' | 'riskScore' | 'decision';
type SortDirection = 'asc' | 'desc';

export function SmartAlerts() {
  const smartAlerts = getSmartAlerts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState<'all' | 'Escalated' | 'Suppressed'>('all');
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'riskScore' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = smartAlerts;

    if (searchTerm) {
      filtered = smartAlerts.filter(
        (alert) =>
          alert.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.explanation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDecision !== 'all') {
      filtered = filtered.filter((alert) => alert.decision === filterDecision);
    }

    const sorted = [...filtered].sort((a, b) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;

      switch (sortField) {
        case 'timestamp':
          aVal = a.timestamp.getTime();
          bVal = b.timestamp.getTime();
          break;
        case 'riskScore':
          aVal = a.riskScore;
          bVal = b.riskScore;
          break;
        default:
          aVal = a[sortField];
          bVal = b[sortField];
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [smartAlerts, searchTerm, filterDecision, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlerts = filteredAndSortedAlerts.slice(startIndex, startIndex + itemsPerPage);

  const escalatedCount = smartAlerts.filter((a) => a.decision === 'Escalated').length;
  const suppressedCount = smartAlerts.filter((a) => a.decision === 'Suppressed').length;

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskScoreBg = (score: number) => {
    if (score >= 80) return 'bg-red-500/10 border-red-500/30';
    if (score >= 60) return 'bg-orange-500/10 border-orange-500/30';
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-green-500/10 border-green-500/30';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Smart Alerts</h2>
        <p className="text-slate-400">
          AI-filtered alerts with risk scoring and automated decision-making
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{smartAlerts.length.toLocaleString()}</div>
              <div className="text-sm text-slate-400 mt-1">Total Smart Alerts</div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{escalatedCount.toLocaleString()}</div>
              <div className="text-sm text-slate-400 mt-1">Escalated</div>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{suppressedCount.toLocaleString()}</div>
              <div className="text-sm text-slate-400 mt-1">Suppressed</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user or explanation..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterDecision}
          onChange={(e) => {
            setFilterDecision(e.target.value as typeof filterDecision);
            setCurrentPage(1);
          }}
          className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Decisions</option>
          <option value="Escalated">Escalated</option>
          <option value="Suppressed">Suppressed</option>
        </select>

        <div className="text-sm text-slate-400">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedAlerts.length)} of{' '}
          {filteredAndSortedAlerts.length.toLocaleString()}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th
                  onClick={() => handleSort('userId')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                >
                  User ID <SortIcon field="userId" />
                </th>
                <th
                  onClick={() => handleSort('riskScore')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                >
                  Risk Score <SortIcon field="riskScore" />
                </th>
                <th
                  onClick={() => handleSort('decision')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                >
                  Decision <SortIcon field="decision" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Explanation
                </th>
                <th
                  onClick={() => handleSort('timestamp')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                >
                  Timestamp <SortIcon field="timestamp" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-300">{alert.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-lg border font-semibold text-sm ${getRiskScoreBg(alert.riskScore)}`}>
                        <span className={getRiskScoreColor(alert.riskScore)}>{alert.riskScore}</span>
                      </div>
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden" style={{ width: '80px' }}>
                        <div
                          className={`h-full transition-all ${
                            alert.riskScore >= 80
                              ? 'bg-red-500'
                              : alert.riskScore >= 60
                              ? 'bg-orange-500'
                              : alert.riskScore >= 40
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${alert.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        alert.decision === 'Escalated'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}
                    >
                      {alert.decision}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 max-w-md">{alert.explanation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono text-xs">{alert.timestamp.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
