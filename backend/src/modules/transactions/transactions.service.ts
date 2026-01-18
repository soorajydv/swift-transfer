import prisma from '../../config/prisma';
import { ServiceResult, ITransactionAttributes, ICreateTransactionData, IUpdateTransactionData, ITransactionData, TransactionFilters } from './transactions.types';
import { generateId, generateTransactionId } from '../../utils/helpers';
import { calculateTransferSummary } from '../../utils/fees';

export class TransactionsService {
  static async createTransaction(data: ICreateTransactionData, userId: string): Promise<ServiceResult<ITransactionData>> {
    try {
      // Check if sender exists and is active
      const sender = await prisma.sender.findUnique({
        where: { id: data.senderId }
      });

      if (!sender) {
        return {
          success: false,
          message: 'Sender not found',
          error: 'Sender not found',
          statusCode: 404
        };
      }

      if (sender.status !== 'active') {
        return {
          success: false,
          message: 'Sender is not active',
          error: 'Sender is not active',
          statusCode: 400
        };
      }

      // Check if receiver exists and is active
      const receiver = await prisma.receiver.findUnique({
        where: { id: data.receiverId }
      });

      if (!receiver) {
        return {
          success: false,
          message: 'Receiver not found',
          error: 'Receiver not found',
          statusCode: 404
        };
      }

      if (receiver.status !== 'active') {
        return {
          success: false,
          message: 'Receiver is not active',
          error: 'Receiver is not active',
          statusCode: 400
        };
      }

      // Calculate transfer amounts using current exchange rate (0.92 JPY to NPR)
      const calculation = calculateTransferSummary(data.amountJPY);

      const transactionData: any = {
        id: generateId('TXN'),
        transactionId: generateTransactionId(),
        userId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        amountJPY: calculation.amountJPY,
        amountNPR: calculation.amountNPR,
        serviceFee: calculation.serviceFee,
        exchangeRate: calculation.exchangeRate,
        totalAmountJPY: calculation.totalJPY,
        status: 'pending',
        purpose: data.purpose,
        createdBy: userId
      };

      if (data.notes !== undefined) {
        transactionData.notes = data.notes;
      }

      const transaction = await prisma.transaction.create({
        data: transactionData
      });

      return {
        success: true,
        data: this.formatTransaction(transaction as ITransactionAttributes),
        message: 'Transaction created successfully'
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return {
        success: false,
        message: 'Failed to create transaction',
        error: 'Failed to create transaction',
        statusCode: 500
      };
    }
  }

  static async getAllTransactions(filters?: TransactionFilters & {
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ items: ITransactionData[]; total: number; page: number; limit: number }>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.senderId) {
        where.senderId = filters.senderId;
      }

      if (filters?.receiverId) {
        where.receiverId = filters.receiverId;
      }

      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt.lte = new Date(filters.endDate);
        }
      }

      if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
        where.amountJPY = {};
        if (filters.minAmount !== undefined) {
          where.amountJPY.gte = filters.minAmount;
        }
        if (filters.maxAmount !== undefined) {
          where.amountJPY.lte = filters.maxAmount;
        }
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: true,
            receiver: true
          }
        }),
        prisma.transaction.count({ where })
      ]);

      return {
        success: true,
        message: 'Transactions retrieved successfully',
        data: {
          items: transactions.map(transaction => this.formatTransactionWithNames(transaction as ITransactionAttributes & { sender: any; receiver: any })),
          total,
          page,
          limit
        }
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return {
        success: false,
        message: 'Failed to fetch transactions',
        error: 'Failed to fetch transactions',
        statusCode: 500
      };
    }
  }

  static async getTransactionById(id: string): Promise<ServiceResult<ITransactionData>> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id }
      });

      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found',
          error: 'Transaction not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        message: 'Transaction retrieved successfully',
        data: this.formatTransaction(transaction as ITransactionAttributes)
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return {
        success: false,
        message: 'Failed to fetch transaction',
        error: 'Failed to fetch transaction',
        statusCode: 500
      };
    }
  }

  static async updateTransactionStatus(id: string, data: IUpdateTransactionData, updatedBy?: string): Promise<ServiceResult<ITransactionData>> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id }
      });

      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found',
          error: 'Transaction not found',
          statusCode: 404
        };
      }

      const updateData: any = { ...data };
      if (updatedBy !== undefined) {
        updateData.updatedBy = updatedBy;
      }

      // Set timestamps based on status
      if (data.status === 'processing' && !transaction.processedAt) {
        updateData.processedAt = new Date();
      } else if (data.status === 'completed' && !transaction.completedAt) {
        updateData.completedAt = new Date();
      } else if (data.status === 'cancelled' && !transaction.cancelledAt) {
        updateData.cancelledAt = new Date();
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        data: this.formatTransaction(updatedTransaction as ITransactionAttributes),
        message: 'Transaction updated successfully'
      };
    } catch (error) {
      console.error('Error updating transaction:', error);
      return {
        success: false,
        message: 'Failed to update transaction',
        error: 'Failed to update transaction',
        statusCode: 500
      };
    }
  }

  static async cancelTransaction(id: string, reason?: string, cancelledBy?: string): Promise<ServiceResult<ITransactionData>> {
    return this.updateTransactionStatus(id, {
      status: 'cancelled',
      cancelledReason: reason,
      cancelledAt: new Date()
    }, cancelledBy);
  }

  static async getTransactionStats(dateRange?: { startDate: string; endDate: string }): Promise<ServiceResult<{
    totalAmount: number;
    totalTransactions: number;
    successRate: number;
    averageAmount: number;
  }>> {
    try {
      const where: any = {};

      if (dateRange?.startDate || dateRange?.endDate) {
        where.createdAt = {};
        if (dateRange.startDate) {
          where.createdAt.gte = new Date(dateRange.startDate);
        }
        if (dateRange.endDate) {
          where.createdAt.lte = new Date(dateRange.endDate);
        }
      }

      const transactions = await prisma.transaction.findMany({
        where,
        select: {
          amountJPY: true,
          status: true
        }
      });

      const totalTransactions = transactions.length;
      const completedTransactions = transactions.filter(t => t.status === 'completed').length;
      const totalAmount = transactions.reduce((sum, t) => sum + t.amountJPY, 0);
      const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
      const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

      return {
        success: true,
        message: 'Transaction statistics retrieved successfully',
        data: {
          totalAmount,
          totalTransactions,
          successRate,
          averageAmount
        }
      };
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      return {
        success: false,
        message: 'Failed to fetch transaction statistics',
        error: 'Failed to fetch transaction statistics',
        statusCode: 500
      };
    }
  }

  private static formatTransaction(transaction: ITransactionAttributes): ITransactionData {
    return {
      id: transaction.id,
      transactionId: transaction.transactionId,
      userId: transaction.userId,
      senderId: transaction.senderId,
      receiverId: transaction.receiverId,
      amountJPY: transaction.amountJPY,
      amountNPR: transaction.amountNPR,
      serviceFee: transaction.serviceFee,
      exchangeRate: transaction.exchangeRate,
      totalAmountJPY: transaction.totalAmountJPY,
      status: transaction.status,
      purpose: transaction.purpose,
      notes: transaction.notes as string,
      processedAt: transaction.processedAt?.toISOString() as string,
      completedAt: transaction.completedAt?.toISOString() as string,
      cancelledAt: transaction.cancelledAt?.toISOString() as string,
      cancelledReason: transaction.cancelledReason as string,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      createdBy: transaction.createdBy as string,
      updatedBy: transaction.updatedBy as string
    };
  }

  private static formatTransactionWithNames(transaction: ITransactionAttributes & { sender: any; receiver: any }): ITransactionData {
    return {
      id: transaction.id,
      transactionId: transaction.transactionId,
      userId: transaction.userId,
      senderId: transaction.senderId,
      senderName: transaction.sender?.fullName || 'Unknown Sender',
      receiverId: transaction.receiverId,
      receiverName: transaction.receiver?.fullName || 'Unknown Receiver',
      amountJPY: transaction.amountJPY,
      amountNPR: transaction.amountNPR,
      serviceFee: transaction.serviceFee,
      exchangeRate: transaction.exchangeRate,
      totalAmountJPY: transaction.totalAmountJPY,
      status: transaction.status,
      purpose: transaction.purpose,
      notes: transaction.notes as string,
      processedAt: transaction.processedAt?.toISOString() as string,
      completedAt: transaction.completedAt?.toISOString() as string,
      cancelledAt: transaction.cancelledAt?.toISOString() as string,
      cancelledReason: transaction.cancelledReason as string,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      createdBy: transaction.createdBy as string,
      updatedBy: transaction.updatedBy as string
    };
  }
}
