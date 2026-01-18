import { Request } from 'express';

export interface DashboardStats {
  totalTransactions: number;
  totalVolumeJPY: number;
  totalVolumeNPR: number;
  totalServiceFees: number;
  pendingTransactions: number;
  completedToday: number;
  activeUsers: number;
  activeSenders: number;
  activeReceivers: number;
}

export interface ActivitySummary {
  todayTransactions: number;
  weekTransactions: number;
  monthTransactions: number;
  activeUsers: number;
  activeSenders: number;
  activeReceivers: number;
}

export interface RecentTransaction {
  id: string;
  transactionId: string;
  senderName: string;
  receiverName: string;
  amountJPY: number;
  amountNPR: number;
  status: string;
  createdAt: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  services: {
    database: boolean;
    redis: boolean;
    kafka: boolean;
  };
  uptime: number;
  timestamp: string;
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
