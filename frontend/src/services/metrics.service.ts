import api from './api';

export interface MetricsSummary {
  totalEvents: number;
  totalAlerts: number;
  smartAlerts: number;
  alertReductionPercentage: number;
  escalationRate: number;
  suppressionRate: number;
  averageRiskScore: number;
}

export interface DecisionDistribution {
  suppress: number;
  review: number;
  escalate: number;
}

export interface SeverityDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface AlertTrendItem {
  date: string;
  raw: number;
  smart: number;
}

export interface HighRiskAlert {
  alert_id: string;
  timestamp: string;
  user_id: string;
  event_id: string;
  risk_score: number;
  decision: string;
}

const metricsService = {
  async getSummary(): Promise<MetricsSummary> {
    const { data } = await api.get<MetricsSummary>('/metrics/summary');
    return data;
  },
  async getDecisionDistribution(): Promise<DecisionDistribution> {
    const { data } = await api.get<DecisionDistribution>('/metrics/decision-distribution');
    return data;
  },
  async getSeverityDistribution(): Promise<SeverityDistribution> {
    const { data } = await api.get<SeverityDistribution>('/metrics/severity-distribution');
    return data;
  },
  async getAlertTrend(days: number): Promise<AlertTrendItem[]> {
    const { data } = await api.get<AlertTrendItem[]>(`/metrics/alert-trend?days=${days}`);
    return data;
  },
  async getHighRisk(): Promise<HighRiskAlert[]> {
    const { data } = await api.get<HighRiskAlert[]>('/metrics/high-risk');
    return data;
  }
};

export default metricsService;
