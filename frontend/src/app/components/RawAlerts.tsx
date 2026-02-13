import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { getRawAlerts, type RawAlert } from '../utils/mockData';

type SortField = 'timestamp' | 'userId' | 'severity' | 'eventType';
type SortDirection = 'asc' | 'desc';

export function RawAlerts() {
  const rawAlerts = getRawAlerts();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = rawAlerts;

    if (searchTerm) {
      filtered = rawAlerts.filter(
        (alert) =>
          alert.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.device.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;

      switch (sortField) {
        case 'timestamp':
          aVal = a.timestamp.getTime();
          bVal = b.timestamp.getTime();
          break;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aVal = severityOrder[a.severity];
          bVal = severityOrder[b.severity];
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
  }, [rawAlerts, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlerts = filteredAndSortedAlerts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getSeverityBadge = (severity: RawAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-600/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1 text-slate-400" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1 text-slate-400" />
    );
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Raw Alerts</h2>
        <p className="text-slate-400">
          Viewing {rawAlerts.length.toLocaleString()} security events
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, event, location, or device..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="text-sm text-slate-400">
          Showing {startIndex + 1}-
          {Math.min(startIndex + itemsPerPage, filteredAndSortedAlerts.length)} of{' '}
          {filteredAndSortedAlerts.length.toLocaleString()} alerts
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50">
              <tr className="border-b border-slate-800">
                <th
                  onClick={() => handleSort('severity')}
                  className="px-6 py-3 text-left font-medium text-slate-400 uppercase cursor-pointer hover:text-white"
                >
                  Severity <SortIcon field="severity" />
                </th>
                <th
                  onClick={() => handleSort('userId')}
                  className="px-6 py-3 text-left font-medium text-slate-400 uppercase cursor-pointer hover:text-white"
                >
                  User ID <SortIcon field="userId" />
                </th>
                <th
                  onClick={() => handleSort('eventType')}
                  className="px-6 py-3 text-left font-medium text-slate-400 uppercase cursor-pointer hover:text-white"
                >
                  Event Type <SortIcon field="eventType" />
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-400 uppercase">
                  Device
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-400 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-400 uppercase">
                  Rule Triggered
                </th>
                <th
                  onClick={() => handleSort('timestamp')}
                  className="px-6 py-3 text-left font-medium text-slate-400 uppercase cursor-pointer hover:text-white"
                >
                  Timestamp <SortIcon field="timestamp" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getSeverityBadge(
                        alert.severity
                      )}`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-300">
                    {alert.userId}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{alert.eventType}</td>
                  <td className="px-6 py-4 text-slate-400">{alert.device}</td>
                  <td className="px-6 py-4 text-slate-400">{alert.location}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {alert.ruleTriggered}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                    {alert.timestamp.toLocaleString()}
                  </td>
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
            <span className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
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
