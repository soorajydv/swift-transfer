import { Response } from 'express';
import { MonitoringService } from './monitoring.service';
import { AuthenticatedRequest } from '../auth/auth.types';
import { response } from '../../utils/response';
import asyncHandler from '../../utils/asyncHandler';

export class MonitoringController {
  static getSystemHealth = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const health = await MonitoringService.getSystemHealth();
    return response.success(res, 'System health retrieved successfully', health);
  });

  static getRedisStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const redisStats = await MonitoringService.getRedisStats();
    return response.success(res, 'Redis statistics retrieved successfully', redisStats);
  });

  static getKafkaStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const kafkaStats = await MonitoringService.getKafkaStats();
    return response.success(res, 'Kafka statistics retrieved successfully', kafkaStats);
  });

  static getDatabaseStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const dbStats = await MonitoringService.getDatabaseStats();
    return response.success(res, 'Database statistics retrieved successfully', dbStats);
  });
}
