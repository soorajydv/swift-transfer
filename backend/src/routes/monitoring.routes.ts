import express from 'express';
import { validateRequest } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { MonitoringController } from '../modules/monitoring/monitoring.controller';
import { getSystemHealthSchema, getRedisStatsSchema, getKafkaStatsSchema, getDatabaseStatsSchema } from '../modules/monitoring/monitoring.validation';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/health',
  validateRequest(getSystemHealthSchema),
  MonitoringController.getSystemHealth
);

router.get('/redis',
  validateRequest(getRedisStatsSchema),
  MonitoringController.getRedisStats
);

router.get('/kafka',
  validateRequest(getKafkaStatsSchema),
  MonitoringController.getKafkaStats
);

router.get('/database',
  validateRequest(getDatabaseStatsSchema),
  MonitoringController.getDatabaseStats
);

export default router;
