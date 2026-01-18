import { Response } from 'express';
import { SendersService } from './senders.service';
import { AuthenticatedRequest } from '../auth/auth.types';
import { response } from '../../utils/response';
import asyncHandler from '../../utils/asyncHandler';

export class SendersController {
  static createSender = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await SendersService.createSender(req.body);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static getAllSenders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page, limit, search, status } = req.query;
    const result = await SendersService.getAllSenders({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search ? search as string : undefined,
      status: status ? status as string : undefined,
    });

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static getSenderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Sender ID is required', 400);
    }
    const result = await SendersService.getSenderById(id);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static updateSender = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Sender ID is required', 400);
    }
    const result = await SendersService.updateSender(id, req.body, req.userId);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static deactivateSender = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Sender ID is required', 400);
    }
    const result = await SendersService.deactivateSender(id, req.userId);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static deleteSender = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Sender ID is required', 400);
    }
    const result = await SendersService.deleteSender(id);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message);
  });
}
