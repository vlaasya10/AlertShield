import { Router } from 'express';
import alertController from '../controllers/alert.controller';

const router = Router();

/**
 * GET /api/alerts
 * Retrieve alerts with pagination, filtering, and search
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - decision: Filter by decision (suppress, review, escalate)
 * - search: Search in user_id and explanation (case-insensitive)
 */
router.get('/', (req, res) => alertController.getAlerts(req, res));

export default router;
