import api from './api';

export interface HealthStatus {
  status: string;
  uptimeSeconds: number;
  database: string;
  totalEvents: number;
  totalAlerts: number;
}

const healthService = {
  async getHealth(): Promise<HealthStatus> {
    const { data } = await api.get<HealthStatus>('/health');
    return data;
  }
};

export default healthService;
