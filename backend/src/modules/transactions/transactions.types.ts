import { Request } from 'express';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface ITransactionAttributes {
  id: string;
  transactionId: string;
  userId: string;
  senderId: string;
  receiverId: string;
  amountJPY: number;
  amountNPR: number;
  serviceFee: number;
  exchangeRate: number;
  totalAmountJPY: number;
  status: TransactionStatus;
  purpose: string;
  notes?: string;
  processedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledReason?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICreateTransactionData {
  senderId: string;
  receiverId: string;
  amountJPY: number;
  purpose: string;
  notes?: string;
}

export interface IUpdateTransactionData {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  notes?: string;
  processedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledReason?: string | undefined;
}

export interface ITransactionData {
  id: string;
  transactionId: string;
  userId: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  receiverName?: string;
  amountJPY: number;
  amountNPR: number;
  serviceFee: number;
  exchangeRate: number;
  totalAmountJPY: number;
  status: TransactionStatus;
  purpose: string;
  notes?: string;
  processedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  statusCode?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  senderId?: string;
  receiverId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  minAmount?: number;
  maxAmount?: number;
}
