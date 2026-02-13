import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Event from '../models/event.model';
import Alert from '../models/alert.model';

export class HealthController {
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const uptimeSeconds = Math.floor(process.uptime());
      const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      const [totalEvents, totalAlerts] = await Promise.all([
        Event.countDocuments(),
        Alert.countDocuments()
      ]);
      res.status(200).json({
        status: 'ok',
        uptimeSeconds,
        database: dbState,
        totalEvents,
        totalAlerts
      });
    } catch (error: unknown) {
      res.status(500).json({ status: 'error', error: (error instanceof Error ? error.message : 'Unknown error') });
    }
  }
}

export default new HealthController();
