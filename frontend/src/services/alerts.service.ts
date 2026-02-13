import api from './api';

export interface Alert {
  _id: string; // ADD THIS
  user_id: string;
  risk_score: number;
  decision: string;
  timestamp: string;
  explanation: string;
}


export interface AlertsResponse {
  data: Alert[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const alertsService = {
  async getAlerts(params?: {
    decision?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AlertsResponse> {
    const { data } = await api.get<AlertsResponse>('/alerts', { params });
    return data;
  },
  async simulate(count: number): Promise<{ eventsCreated: number; alertsCreated: number; suppressedEvents: number }> {
    const { data } = await api.post('/simulate', undefined, { params: { count } });
    return data;
  }
};

export default alertsService;
