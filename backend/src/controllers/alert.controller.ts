import { Request, Response } from 'express';
import alertService from '../services/alert.service';
import { AlertDecision } from '../models/alert.model';

export class AlertController {
  /**
   * Get alerts with pagination, filtering, and search
   */
  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, decision, search } = req.query;

      // Parse query parameters
      const query = {
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        decision: decision as AlertDecision | undefined,
        search: search as string | undefined
      };

      // Validate decision enum if provided
      if (query.decision && !['suppress', 'review', 'escalate'].includes(query.decision)) {
        res.status(400).json({
          message: 'Invalid decision value. Must be: suppress, review, or escalate'
        });
        return;
      }

      // Get alerts from service
      const result = await alertService.getAlerts(query);

      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to retrieve alerts:', error.message);
        res.status(500).json({
          message: 'Failed to retrieve alerts',
          error: error.message
        });
      } else {
        res.status(500).json({
          message: 'Internal server error'
        });
      }
    }
  }
}

export default new AlertController();
