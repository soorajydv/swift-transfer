import prisma from '../../config/prisma';
import { ServiceResult, DashboardStats, ActivitySummary, RecentTransaction, SystemHealth } from './dashboard.types';
import { connectRedis, disconnectRedis, getRedisClient } from '../../config/redis';
import { connectKafka, disconnectKafka } from '../../config/kafka';

export class DashboardService {
  static async getStats(): Promise<ServiceResult<DashboardStats>> {
    try {
      // Get date boundaries for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get transaction statistics
      const [
        totalTransactionsResult,
        totalVolumeResult,
        pendingTransactionsResult,
        completedTodayResult,
        activeUsersResult,
        activeSendersResult,
        activeReceiversResult
      ] = await Promise.all([
        prisma.transaction.aggregate({
          _count: { id: true }
        }),
        prisma.transaction.aggregate({
          _sum: { amountJPY: true, amountNPR: true, serviceFee: true }
        }),
        prisma.transaction.count({
          where: { status: 'pending' }
        }),
        prisma.transaction.count({
          where: {
            status: 'completed',
            createdAt: { gte: today, lt: tomorrow }
          }
        }),
        prisma.user.count({
          where: { status: 'ACTIVE' }
        }),
        prisma.sender.count({
          where: { status: 'active' }
        }),
        prisma.receiver.count({
          where: { status: 'active' }
        })
      ]);

      const stats: DashboardStats = {
        totalTransactions: totalTransactionsResult._count.id,
        totalVolumeJPY: totalVolumeResult._sum.amountJPY || 0,
        totalVolumeNPR: totalVolumeResult._sum.amountNPR || 0,
        totalServiceFees: totalVolumeResult._sum.serviceFee || 0,
        pendingTransactions: pendingTransactionsResult,
        completedToday: completedTodayResult,
        activeUsers: activeUsersResult,
        activeSenders: activeSendersResult,
        activeReceivers: activeReceiversResult
      };

      return {
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: stats
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: 'Failed to fetch dashboard statistics',
        statusCode: 500
      };
    }
  }

  static async getRecentTransactions(limit: number = 10): Promise<ServiceResult<RecentTransaction[]>> {
    try {
      const transactions = await prisma.transaction.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { fullName: true }
          },
          receiver: {
            select: { fullName: true }
          }
        }
      });

      const recentTransactions: RecentTransaction[] = transactions.map(transaction => ({
        id: transaction.id,
        transactionId: transaction.transactionId,
        senderName: transaction.sender.fullName,
        receiverName: transaction.receiver.fullName,
        amountJPY: transaction.amountJPY,
        amountNPR: transaction.amountNPR,
        status: transaction.status,
        createdAt: transaction.createdAt.toISOString()
      }));

      return {
        success: true,
        message: 'Recent transactions retrieved successfully',
        data: recentTransactions
      };
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return {
        success: false,
        message: 'Failed to fetch recent transactions',
        error: 'Failed to fetch recent transactions',
        statusCode: 500
      };
    }
  }

  static async getActivitySummary(): Promise<ServiceResult<ActivitySummary>> {
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);

      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);

      const [
        todayTransactionsResult,
        weekTransactionsResult,
        monthTransactionsResult,
        activeUsersResult,
        activeSendersResult,
        activeReceiversResult
      ] = await Promise.all([
        prisma.transaction.count({
          where: { createdAt: { gte: today } }
        }),
        prisma.transaction.count({
          where: { createdAt: { gte: weekAgo } }
        }),
        prisma.transaction.count({
          where: { createdAt: { gte: monthAgo } }
        }),
        prisma.user.count({
          where: { status: 'ACTIVE' }
        }),
        prisma.sender.count({
          where: { status: 'active' }
        }),
        prisma.receiver.count({
          where: { status: 'active' }
        })
      ]);

      const activitySummary: ActivitySummary = {
        todayTransactions: todayTransactionsResult,
        weekTransactions: weekTransactionsResult,
        monthTransactions: monthTransactionsResult,
        activeUsers: activeUsersResult,
        activeSenders: activeSendersResult,
        activeReceivers: activeReceiversResult
      };

      return {
        success: true,
        message: 'Activity summary retrieved successfully',
        data: activitySummary
      };
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      return {
        success: false,
        message: 'Failed to fetch activity summary',
        error: 'Failed to fetch activity summary',
        statusCode: 500
      };
    }
  }

  static async getSystemHealth(): Promise<ServiceResult<SystemHealth>> {
    try {
      // Check database connection
      let databaseHealthy = true;
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (error) {
        databaseHealthy = false;
        console.error('Database health check failed:', error);
      }

      // Check Redis connection
      let redisHealthy = true;
      try {
        const redis = getRedisClient();
        await redis.ping();
      } catch (error) {
        redisHealthy = false;
        console.error('Redis health check failed:', error);
      }

      // Check Kafka connection
      let kafkaHealthy = true;
      try {
        await connectKafka();
        await disconnectKafka();
      } catch (error) {
        kafkaHealthy = false;
        console.error('Kafka health check failed:', error);
      }

      // Determine overall status
      let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';
      if (!databaseHealthy || !redisHealthy || !kafkaHealthy) {
        overallStatus = 'error';
      } else if (!redisHealthy || !kafkaHealthy) {
        overallStatus = 'warning';
      }

      const healthStatus: SystemHealth = {
        status: overallStatus,
        services: {
          database: databaseHealthy,
          redis: redisHealthy,
          kafka: kafkaHealthy
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        message: 'System health status retrieved successfully',
        data: healthStatus
      };
    } catch (error) {
      console.error('Error fetching system health:', error);
      return {
        success: false,
        message: 'Failed to fetch system health status',
        error: 'Failed to fetch system health status',
        statusCode: 500
      };
    }
  }
}
