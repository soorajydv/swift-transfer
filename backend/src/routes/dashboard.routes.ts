import express from 'express';
import { validateRequest } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { DashboardController } from '../modules/dashboard/dashboard.controller';
import { getDashboardStatsSchema, getRecentTransactionsSchema, getActivitySummarySchema, getSystemHealthSchema } from '../modules/dashboard/dashboard.validation';

const router = express.Router();

router.use(authenticate);

router.get('/stats',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(getDashboardStatsSchema),
  DashboardController.getStats
);

router.get('/recent-transactions',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(getRecentTransactionsSchema),
  DashboardController.getRecentTransactions
);

router.get('/activity',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(getActivitySummarySchema),
  DashboardController.getActivitySummary
);

router.get('/health',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(getSystemHealthSchema),
  DashboardController.getSystemHealth
);

export default router;
