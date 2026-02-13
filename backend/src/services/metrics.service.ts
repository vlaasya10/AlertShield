import Event from '../models/event.model';
import Alert from '../models/alert.model';

export interface IMetricsSummary {
  totalEvents: number;
  totalAlerts: number;
  smartAlerts: number;
  alertReductionPercentage: number;
  escalationRate: number;
  suppressionRate: number;
  averageRiskScore: number;
}

export interface IDecisionDistribution {
  suppress: number;
  review: number;
  escalate: number;
}

export interface ISeverityDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface IAlertTrendItem {
  date: string;
  raw: number;
  smart: number;
}

export interface IHighRiskAlert {
  alert_id: string;
  timestamp: Date;
  user_id: string;
  event_id: string;
  risk_score: number;
  decision: string;
}

export class MetricsService {
  async getSummary(): Promise<IMetricsSummary> {
    const [
      totalEventCount,
      totalAlertCount,
      smartAlertCount,
      escalationCount,
      suppressionCount,
      avgAgg
    ] = await Promise.all([
      Event.countDocuments(),
      Alert.countDocuments(),
      Alert.countDocuments({ decision: { $ne: 'suppress' } }),
      Alert.countDocuments({ decision: 'escalate' }),
      Alert.countDocuments({ decision: 'suppress' }),
      Alert.aggregate([
        { $match: { decision: { $ne: 'suppress' } } },
        { $group: { _id: null, avg: { $avg: '$risk_score' } } }
      ])
    ]);

    const totalEvents = Math.max(totalEventCount, smartAlertCount);
    const smartAlerts = Math.min(smartAlertCount, totalEvents);
    const totalAlerts = totalAlertCount;

    const alertReductionPercentage = totalEvents === 0
      ? 0
      : this.roundToTwoDecimals(((totalEvents - smartAlerts) / totalEvents) * 100);

    const escalationRate = smartAlerts === 0
      ? 0
      : this.roundToTwoDecimals((Math.min(escalationCount, smartAlerts) / smartAlerts) * 100);

    const suppressionRate = totalEvents === 0
      ? 0
      : this.roundToTwoDecimals((Math.min(suppressionCount, totalEvents) / totalEvents) * 100);

    let averageRiskScore = 0;
    if (avgAgg.length > 0 && typeof avgAgg[0].avg === 'number') {
      averageRiskScore = this.roundToTwoDecimals(avgAgg[0].avg);
    }

    return {
      totalEvents,
      totalAlerts,
      smartAlerts,
      alertReductionPercentage,
      escalationRate,
      suppressionRate,
      averageRiskScore
    };
  }

  async getDecisionDistribution(): Promise<IDecisionDistribution> {
    const agg = await Alert.aggregate([
      { $match: { decision: { $in: ['suppress', 'review', 'escalate'] } } },
      {
        $group: {
          _id: '$decision',
          count: { $sum: 1 }
        }
      }
    ]);
    const result: IDecisionDistribution = { suppress: 0, review: 0, escalate: 0 };
    agg.forEach(item => {
      if (item._id === 'suppress') result.suppress = item.count;
      if (item._id === 'review') result.review = item.count;
      if (item._id === 'escalate') result.escalate = item.count;
    });
    return result;
  }

  async getSeverityDistribution(): Promise<ISeverityDistribution> {
    const agg = await Alert.aggregate([
      { $match: { risk_score: { $gte: 0 } } },
      {
        $bucket: {
          groupBy: '$risk_score',
          boundaries: [0, 31, 70, 90, 101],
          default: 'other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);
    const result: ISeverityDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    agg.forEach(item => {
      if (item._id === 0) result.low = item.count;
      if (item._id === 31) result.medium = item.count;
      if (item._id === 70) result.high = item.count;
      if (item._id === 90) result.critical = item.count;
    });
    return result;
  }

  async getAlertTrend(days: number): Promise<IAlertTrendItem[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rawAgg = await Event.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          raw: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const smartAgg = await Alert.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          smart: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const trendMap: Record<string, IAlertTrendItem> = {};
    rawAgg.forEach(item => {
      trendMap[item._id] = { date: item._id, raw: item.raw, smart: 0 };
    });
    smartAgg.forEach(item => {
      if (trendMap[item._id]) {
        trendMap[item._id].smart = item.smart;
      } else {
        trendMap[item._id] = { date: item._id, raw: 0, smart: item.smart };
      }
    });
    return Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getHighRiskAlerts(): Promise<IHighRiskAlert[]> {
    const alerts = await Alert.find({ risk_score: { $gte: 70 } })
      .sort({ risk_score: -1 })
      .limit(20)
      .select('alert_id timestamp user_id event_id risk_score decision')
      .lean();
    return alerts as IHighRiskAlert[];
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

export default new MetricsService();
