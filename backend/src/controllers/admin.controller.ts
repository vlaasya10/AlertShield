import { Request, Response } from 'express';
import Event from '../models/event.model';
import Alert from '../models/alert.model';
import UserProfile from '../models/userProfile.model';

/**
 * Request body interface for seed endpoint
 */
export interface ISeedRequest {
  events?: Array<Record<string, unknown>>;
  alerts?: Array<Record<string, unknown>>;
  profiles?: Array<Record<string, unknown>>;
}

/**
 * Response interface for seed endpoint
 */
export interface ISeedResponse {
  inserted: {
    events: number;
    alerts: number;
    profiles: number;
  };
}

export class AdminController {
  /**
   * Seed database with events, alerts, and profiles
   */
  async seedDatabase(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as ISeedRequest;

      // Validate request body
      if (
        !body ||
        (typeof body !== 'object' || Array.isArray(body)) ||
        (!Array.isArray(body.events) &&
          !Array.isArray(body.alerts) &&
          !Array.isArray(body.profiles))
      ) {
        res.status(400).json({
          message: 'Invalid request body. Must include at least one of: events, alerts, profiles arrays.'
        });
        return;
      }

      const results = {
        events: 0,
        alerts: 0,
        profiles: 0
      };

      // Seed events
      if (Array.isArray(body.events) && body.events.length > 0) {
        try {
          const insertedEvents = await Event.insertMany(body.events, { ordered: false });
          results.events = insertedEvents.length;
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes('duplicate key')) {
            res.status(400).json({
              message: 'Failed to insert events: duplicate event_id detected'
            });
            return;
          }
          throw error;
        }
      }

      // Seed alerts
      if (Array.isArray(body.alerts) && body.alerts.length > 0) {
        try {
          const insertedAlerts = await Alert.insertMany(body.alerts, { ordered: false });
          results.alerts = insertedAlerts.length;
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes('duplicate key')) {
            res.status(400).json({
              message: 'Failed to insert alerts: duplicate alert_id detected'
            });
            return;
          }
          throw error;
        }
      }

      // Seed profiles
      if (Array.isArray(body.profiles) && body.profiles.length > 0) {
        try {
          const insertedProfiles = await UserProfile.insertMany(body.profiles, { ordered: false });
          results.profiles = insertedProfiles.length;
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes('duplicate key')) {
            res.status(400).json({
              message: 'Failed to insert profiles: duplicate user_id detected'
            });
            return;
          }
          throw error;
        }
      }

      res.status(201).json({ inserted: results });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Seed operation failed:', error.message);
        res.status(500).json({
          message: 'Seed operation failed',
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

export default new AdminController();
