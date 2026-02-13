import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RawAlerts } from './components/RawAlerts';
import { SmartAlerts } from './components/SmartAlerts';
import { Metrics } from './components/Metrics';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'raw-alerts', Component: RawAlerts },
      { path: 'smart-alerts', Component: SmartAlerts },
      { path: 'metrics', Component: Metrics },
    ],
  },
]);
