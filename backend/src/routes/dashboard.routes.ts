import express from 'express';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { DashboardController } from '../modules/dashboard/dashboard.controller';
import { getDashboardStatsSchema, getRecentTransactionsSchema, getActivitySummarySchema, getSystemHealthSchema } from '../modules/dashboard/dashboard.validation';

const router = express.Router();

router.use(authenticate);

router.get('/stats',
  validateRequest(getDashboardStatsSchema),
  DashboardController.getStats
);

router.get('/recent-transactions',
  validateRequest(getRecentTransactionsSchema),
  DashboardController.getRecentTransactions
);

router.get('/activity',
  validateRequest(getActivitySummarySchema),
  DashboardController.getActivitySummary
);

router.get('/health',
  validateRequest(getSystemHealthSchema),
  DashboardController.getSystemHealth
);

export default router;
