import { Router } from 'express';
import adminController from '../controllers/admin.controller';

const router = Router();

/**
 * POST /api/admin/seed
 * Seed database with events, alerts, and profiles
 */
router.post('/seed', adminController.seedDatabase.bind(adminController));

export default router;
