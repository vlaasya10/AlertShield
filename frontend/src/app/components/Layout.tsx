import { Outlet, Link, useLocation } from 'react-router';
import { Shield, LayoutDashboard, AlertTriangle, Zap, BarChart3, Plus } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  const handleGenerateEvents = () => {
    if ((window as any).handleGenerateEvents) {
      (window as any).handleGenerateEvents();
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/raw-alerts', label: 'Raw Alerts', icon: AlertTriangle },
    { path: '/smart-alerts', label: 'Smart Alerts', icon: Zap },
    { path: '/metrics', label: 'Metrics', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#1a1a33' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col"
        style={{ backgroundColor: '#1a1a33', borderRight: '1px solid #26264d' }}
      >
        <div className="p-6" style={{ borderBottom: '1px solid #26264d' }}>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: '#9088ff' }}
            >
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 style={{ color: '#e6e6ff' }} className="font-semibold text-lg">
                AlertShield
              </h1>
              <p style={{ color: '#9999cc' }} className="text-xs">
                Security Intelligence
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: active ? '#9088ff' : 'transparent',
                  color: active ? '#1a1a33' : '#c6c6ff',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#26264d';
                    (e.currentTarget as HTMLElement).style.color = '#e6e6ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#c6c6ff';
                  }
                }}
              >
                <Icon className="w-5 h-5" style={{ color: active ? '#1a1a33' : '#9088ff' }} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="px-8 py-4"
          style={{ backgroundColor: '#1a1a33', borderBottom: '1px solid #26264d' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ color: '#e6e6ff' }} className="text-xl font-semibold">
                Security Operations Center
              </h2>
              <p style={{ color: '#9999cc' }} className="text-sm mt-0.5">
                Real-time threat monitoring and alert intelligence
              </p>
            </div>

            <button
              onClick={handleGenerateEvents}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: '#9088ff',
                color: '#1a1a33',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#7a72e6';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#9088ff';
              }}
            >
              <Plus className="w-4 h-4" />
              Generate Events
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto" style={{ backgroundColor: '#1a1a33' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
