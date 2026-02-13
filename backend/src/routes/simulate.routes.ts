import { Router } from 'express';
import simulateController from '../controllers/simulate.controller';

const router = Router();

// POST /api/simulate?count=100
router.post('/', simulateController.simulate.bind(simulateController));

export default router;
