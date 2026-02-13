import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import Event from '../models/event.model';
import profileService from '../services/profile.service';
import riskService from '../services/risk.service';
import alertService from '../services/alert.service';
import eventService from '../services/event.service';

export class EventController {
  /**
   * Get events with pagination and filters
   */
  async getEvents(req: Request, res: Response): Promise<void> {
    try {
      // Parse pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      // Parse filters
      const filters = {
        user_id: req.query.user_id as string | undefined,
        event_type: req.query.event_type as string | undefined
      };

      // Get paginated events
      const result = await eventService.getEvents(filters, { page, limit });

      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({
          message: 'Failed to retrieve events',
          error: error.message
        });
      } else {
        res.status(500).json({
          message: 'Internal server error'
        });
      }
    }
  }
  /**
   * Create new event with full intelligence processing
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      // Generate event ID
      const eventId = randomUUID();

      // Save event to database
      const event = await Event.create({
        ...req.body,
        event_id: eventId
      });

      // Get or create user profile
      const profile = await profileService.getOrCreateProfile(
        event.user_id,
        event.toObject()
      );

      // Calculate risk before updating profile
      const riskAssessment = await riskService.assessRisk(profile, event.toObject());

      // Update profile with new event data
      await profileService.updateProfile(event.user_id, event.toObject());

      // Create alert if risk score > 0
      await alertService.createAlertIfNeeded(
        event.user_id,
        eventId,
        riskAssessment
      );

      // Return response
      res.status(201).json({
        event: {
          event_id: event.event_id,
          timestamp: event.timestamp,
          user_id: event.user_id,
          event_type: event.event_type
        },
        risk_score: riskAssessment.risk_score,
        decision: riskAssessment.decision,
        explanation: riskAssessment.explanation
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Event creation failed:', error.message);
        res.status(400).json({
          message: 'Event creation failed',
          error: error.message
        });
      } else {
        res.status(500).json({
          message: 'Internal server error'
        });
      }
    }
  }

  /**
   * Get events by user ID
   */
  async getEventsByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const events = await Event.find({ user_id: userId })
        .sort({ timestamp: -1 })
        .limit(limit);

      res.status(200).json({
        count: events.length,
        events
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({
          message: 'Failed to retrieve events',
          error: error.message
        });
      } else {
        res.status(500).json({
          message: 'Internal server error'
        });
      }
    }
  }

  /**
   * Test endpoint for event creation
   */
  async testEvent(req: Request, res: Response): Promise<void> {
    try {
      const event = await Event.create(req.body);
      res.status(201).json(event);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        res.status(400).json({
          message: 'Event creation failed',
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

export default new EventController();
