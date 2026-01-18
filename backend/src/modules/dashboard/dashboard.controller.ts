import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { AuthenticatedRequest } from './dashboard.types';
import { response } from '../../utils/response';
import asyncHandler from '../../utils/asyncHandler';

export class DashboardController {
  static getStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await DashboardService.getStats();

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static getRecentTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 10;

    const result = await DashboardService.getRecentTransactions(limitNum);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static getActivitySummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await DashboardService.getActivitySummary();

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static getSystemHealth = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await DashboardService.getSystemHealth();

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });
}
