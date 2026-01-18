import { Response } from 'express';
import { ReceiversService } from './receivers.service';
import { AuthenticatedRequest } from './receivers.types';
import { response } from '../../utils/response';
import asyncHandler from '../../utils/asyncHandler';

export class ReceiversController {
  static createReceiver = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ReceiversService.createReceiver(req.body);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static getAllReceivers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page, limit, search, status, senderId } = req.query;
    const result = await ReceiversService.getAllReceivers({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search ? search as string : undefined,
      status: status ? status as string : undefined,
      senderId: senderId ? senderId as string : undefined,
    });

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static getReceiverById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Receiver ID is required', 400);
    }
    const result = await ReceiversService.getReceiverById(id);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static updateReceiver = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Receiver ID is required', 400);
    }
    const result = await ReceiversService.updateReceiver(id, req.body, req.userId);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static deactivateReceiver = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Receiver ID is required', 400);
    }
    const result = await ReceiversService.deactivateReceiver(id, req.userId);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static deleteReceiver = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Receiver ID is required', 400);
    }
    const result = await ReceiversService.deleteReceiver(id);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message);
  });

  static getReceiversBySenderId = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { senderId } = req.params;
    if (!senderId) {
      return response.error(res, 'Sender ID is required', 400);
    }
    const result = await ReceiversService.getReceiversBySenderId(senderId);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });
}
