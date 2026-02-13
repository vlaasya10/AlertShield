import { Router } from 'express';
import eventController from '../controllers/event.controller';

const router = Router();

/**
 * GET /api/events
 * Get events with pagination and filters
 */
router.get('/', eventController.getEvents.bind(eventController));

/**
 * POST /api/events
 * Create new event with intelligence processing
 */
router.post('/', eventController.createEvent.bind(eventController));

/**
 * GET /api/events/user/:userId
 * Get events by user ID
 */
router.get('/user/:userId', eventController.getEventsByUser.bind(eventController));

/**
 * POST /api/events/test
 * Test endpoint for event creation (no intelligence processing)
 */
router.post('/test', eventController.testEvent.bind(eventController));

export default router;
