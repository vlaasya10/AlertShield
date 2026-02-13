import { Router } from 'express';
import metricsController from '../controllers/metrics.controller';

const router = Router();

// PART 1 — Summary
router.get('/summary', metricsController.getSummary.bind(metricsController));

// PART 2 — Decision Distribution
router.get('/decision-distribution', metricsController.getDecisionDistribution.bind(metricsController));

// PART 3 — Severity Distribution
router.get('/severity-distribution', metricsController.getSeverityDistribution.bind(metricsController));

// PART 4 — Alert Trend
router.get('/alert-trend', metricsController.getAlertTrend.bind(metricsController));

// PART 5 — High Risk Alerts
router.get('/high-risk', metricsController.getHighRiskAlerts.bind(metricsController));

export default router;
