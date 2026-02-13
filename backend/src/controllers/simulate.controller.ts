import { Request, Response } from 'express';
import simulateService from '../services/simulate.service';

export class SimulateController {
  async simulate(req: Request, res: Response): Promise<void> {
    try {
      const count = Math.max(1, Math.min(parseInt(req.query.count as string) || 100, 1000));
      const result = await simulateService.simulateEvents(count);
      // result: { eventsCreated, alertsCreated, suppressedEvents }
      res.status(201).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: 'Simulation failed', error: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
}

export default new SimulateController();
