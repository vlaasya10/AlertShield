import Alert, { IAlert, AlertDecision } from '../models/alert.model';
import { randomUUID } from 'crypto';
import { IRiskAssessment } from './risk.service';

interface IAlertQuery {
  page?: number;
  limit?: number;
  decision?: AlertDecision;
  search?: string;
}

interface IAlertResponse {
  data: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class AlertService {
  /**
   * Create alert if risk score exceeds threshold
   */
  async createAlertIfNeeded(
    userId: string,
    eventId: string,
    riskAssessment: IRiskAssessment
  ): Promise<IAlert | null> {
    // Only create alert if risk score > 0
    if (riskAssessment.risk_score === 0) {
      return null;
    }

    const { rule_triggered, risk_score, risk_factors, decision, explanation } =
      riskAssessment;

    return await Alert.create({
      alert_id: randomUUID(),
      timestamp: new Date(),
      user_id: userId,
      event_id: eventId,
      rule_triggered,
      risk_score,
      risk_factors,
      decision,
      explanation,
      status: "pending",
    });


  }

  /**
   * Get alerts by user ID
   */
  async getAlertsByUser(userId: string, limit: number = 50): Promise<IAlert[]> {
    return await Alert.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  /**
   * Get alerts by status
   */
  async getAlertsByStatus(status: string, limit: number = 100): Promise<IAlert[]> {
    return await Alert.find({ status })
      .sort({ risk_score: -1, timestamp: -1 })
      .limit(limit);
  }

  /**
   * Update alert status
   */
  async updateAlertStatus(alertId: string, status: string): Promise<IAlert | null> {
    return await Alert.findOneAndUpdate(
      { alert_id: alertId },
      { status },
      { new: true }
    );
  }

  /**
   * Get alerts with pagination, filtering, and search
   */
  async getAlerts(query: IAlertQuery): Promise<IAlertResponse> {
    // Parse and validate pagination parameters
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));
    const skip = (page - 1) * limit;

    // Build filter criteria
    const filter: Record<string, unknown> = {};

    // Filter by decision if provided
    if (query.decision) {
      filter.decision = query.decision;
    }

    // Search in user_id and explanation (case-insensitive)
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { user_id: searchRegex },
        { explanation: searchRegex }
      ];
    }

    // Execute queries in parallel
    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .select('user_id risk_score decision explanation timestamp')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Alert.countDocuments(filter)
    ]);

    return {
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export default new AlertService();
