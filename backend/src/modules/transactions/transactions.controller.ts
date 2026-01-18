import { Response } from 'express';
import { response } from '../../utils/response';
import asyncHandler from '../../utils/asyncHandler';
import { publishMessage } from '../../config/kafka';
import { TransactionsService } from './transactions.service';
import { AuthenticatedRequest } from './transactions.types';

export class TransactionsController {
  static createTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) {
      return response.unauthorized(res, 'User not authenticated');
    }

    const result = await TransactionsService.createTransaction(req.body, req.userId);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    // Publish transaction event to Kafka
    try {
      if (result.data) {
        await publishMessage('transaction-events', {
          event: 'TRANSACTION_CREATED',
          transactionId: result.data.id,
          userId: req.userId,
          senderId: result.data.senderId,
          receiverId: result.data.receiverId,
          amountJPY: result.data.amountJPY,
          amountNPR: result.data.amountNPR,
          serviceFee: result.data.serviceFee,
          exchangeRate: result.data.exchangeRate,
          totalAmountJPY: result.data.totalAmountJPY,
          status: result.data.status,
          purpose: result.data.purpose,
          createdAt: result.data.createdAt,
        }, result.data.id);
      }
    } catch (kafkaError) {
      // Log Kafka error but don't fail the request
      console.error('Failed to publish transaction event to Kafka:', kafkaError);
    }

    return response.success(res, result.message, result.data);
  });

  static getAllTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page, limit, startDate, endDate, senderId, receiverId, status, minAmount, maxAmount } = req.query;

    const filters: any = {};

    if (page) filters.page = parseInt(page as string);
    if (limit) filters.limit = parseInt(limit as string);
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;
    if (senderId) filters.senderId = senderId as string;
    if (receiverId) filters.receiverId = receiverId as string;
    if (status) filters.status = status as string;
    if (minAmount) filters.minAmount = parseFloat(minAmount as string);
    if (maxAmount) filters.maxAmount = parseFloat(maxAmount as string);

    const result = await TransactionsService.getAllTransactions(filters);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static getTransactionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Transaction ID is required', 400);
    }

    const result = await TransactionsService.getTransactionById(id);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static updateTransactionStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Transaction ID is required', 400);
    }

    const result = await TransactionsService.updateTransactionStatus(id, req.body, req.userId);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    // Publish transaction update event to Kafka
    try {
      if (result.data) {
        await publishMessage('transaction-events', {
          event: 'TRANSACTION_UPDATED',
          transactionId: result.data.id,
          status: result.data.status,
          updatedBy: req.userId,
          updatedAt: result.data.updatedAt,
        }, result.data.id);
      }
    } catch (kafkaError) {
      console.error('Failed to publish transaction update event to Kafka:', kafkaError);
    }

    return response.success(res, result.message, result.data);
  });

  static cancelTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return response.error(res, 'Transaction ID is required', 400);
    }

    const { reason } = req.body;
    const result = await TransactionsService.cancelTransaction(id, reason, req.userId);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    // Publish transaction cancellation event to Kafka
    try {
      if (result.data) {
        await publishMessage('transaction-events', {
          event: 'TRANSACTION_CANCELLED',
          transactionId: result.data.id,
          cancelledReason: result.data.cancelledReason,
          cancelledBy: req.userId,
          cancelledAt: result.data.cancelledAt,
        }, result.data.id);
      }
    } catch (kafkaError) {
      console.error('Failed to publish transaction cancellation event to Kafka:', kafkaError);
    }

    return response.success(res, result.message, result.data);
  });

  static getTransactionStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { startDate, endDate } = req.query;

    const dateRange = startDate || endDate ? {
      startDate: startDate as string,
      endDate: endDate as string
    } : undefined;

    const result = await TransactionsService.getTransactionStats(dateRange);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });
}
