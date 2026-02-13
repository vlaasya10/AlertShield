import { Request, Response } from 'express';
import metricsService from '../services/metrics.service';

export class MetricsController {
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = await metricsService.getSummary();
      res.status(200).json(summary);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to fetch summary', error: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getDecisionDistribution(req: Request, res: Response): Promise<void> {
    try {
      const distribution = await metricsService.getDecisionDistribution();
      res.status(200).json(distribution);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to fetch decision distribution', error: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getSeverityDistribution(req: Request, res: Response): Promise<void> {
    try {
      const distribution = await metricsService.getSeverityDistribution();
      res.status(200).json(distribution);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to fetch severity distribution', error: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getAlertTrend(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const trend = await metricsService.getAlertTrend(days);
      res.status(200).json(trend);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to fetch alert trend', error: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getHighRiskAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await metricsService.getHighRiskAlerts();
      res.status(200).json(alerts);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to fetch high risk alerts', error: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
}

export default new MetricsController();
