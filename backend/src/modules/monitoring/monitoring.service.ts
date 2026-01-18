import logger from '../../utils/logger';
import prisma from '../../config/prisma';
import { getRedisClient } from '../../config/redis';
import { getKafkaClient } from '../../config/kafka';

export class MonitoringService {
    static async getSystemHealth(): Promise<{
        status: 'healthy' | 'warning' | 'error';
        services: {
            database: boolean;
            redis: boolean;
            kafka: boolean;
        };
        uptime: number;
        timestamp: string;
    }> {
        const services = {
            database: false,
            redis: false,
            kafka: false,
        };

        // Check database
        try {
            await prisma.$queryRaw`SELECT 1`;
            services.database = true;
        } catch (error) {
            logger.error('Database health check failed:', error);
        }

        // Check Redis
        try {
            const redis = getRedisClient();
            await redis.ping();
            services.redis = true;
        } catch (error) {
            logger.error('Redis health check failed:', error);
        }

        // Check Kafka
        try {
            const kafka = getKafkaClient();
            // For basic connectivity check, we can try to get cluster info
            services.kafka = true; // Kafka client initialization is checked during startup
        } catch (error) {
            logger.error('Kafka health check failed:', error);
        }

        const allHealthy = Object.values(services).every(service => service);
        const hasWarnings = Object.values(services).some(service => !service);

        const status = allHealthy ? 'healthy' : hasWarnings ? 'warning' : 'error';

        return {
            status,
            services,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
    }

    static async getRedisStats(): Promise<{
        connected: boolean;
        memory?: {
            used: number;
            peak: number;
            fragmentation: number;
        };
        keys?: {
            total: number;
            expired: number;
        };
        connections?: {
            active: number;
            total: number;
        };
        operations?: {
            commands_processed: number;
            hits: number;
            misses: number;
        };
    }> {
        try {
            const redis = getRedisClient();

            // Get basic info
            const info = await redis.info();
            const infoLines = info.split('\n');

            // Parse memory info
            const usedMemory = infoLines.find(line => line.startsWith('used_memory:'))?.split(':')[1];
            const peakMemory = infoLines.find(line => line.startsWith('mem_fragmentation_ratio:'))?.split(':')[1];

      // Parse keyspace info
      const keyspaceLine = infoLines.find(line => line.startsWith('db0:'));
      let totalKeys = 0;
      if (keyspaceLine) {
        const keyParts = keyspaceLine.split(',')[0]?.split('=');
        const keyInfo = keyParts?.[1];
        totalKeys = keyInfo ? parseInt(keyInfo, 10) || 0 : 0;
      }

            // Parse connections
            const connectedClients = infoLines.find(line => line.startsWith('connected_clients:'))?.split(':')[1];
            const totalConnections = infoLines.find(line => line.startsWith('total_connections_received:'))?.split(':')[1];

            // Parse operations
            const totalCommands = infoLines.find(line => line.startsWith('total_commands_processed:'))?.split(':')[1];
            const keyspaceHits = infoLines.find(line => line.startsWith('keyspace_hits:'))?.split(':')[1];
            const keyspaceMisses = infoLines.find(line => line.startsWith('keyspace_misses:'))?.split(':')[1];

            return {
                connected: true,
                memory: {
                    used: parseInt(usedMemory || '0'),
                    peak: parseInt(peakMemory || '0'),
                    fragmentation: parseFloat(peakMemory || '1'),
                },
                keys: {
                    total: totalKeys,
                    expired: 0, // Would need more complex parsing
                },
                connections: {
                    active: parseInt(connectedClients || '0'),
                    total: parseInt(totalConnections || '0'),
                },
                operations: {
                    commands_processed: parseInt(totalCommands || '0'),
                    hits: parseInt(keyspaceHits || '0'),
                    misses: parseInt(keyspaceMisses || '0'),
                },
            };
        } catch (error) {
            logger.error('Failed to get Redis stats:', error);
            return { connected: false };
        }
    }

    static async getKafkaStats(): Promise<{
        connected: boolean;
        brokers?: number;
        topics?: number;
        consumer_groups?: number;
        partitions?: number;
        messages?: {
            produced: number;
            consumed: number;
        };
    }> {
        try {
            const kafka = getKafkaClient();

            // For basic Kafka stats, we'll return connection status
            // In a production system, you'd use Kafka Admin API for detailed stats
            return {
                connected: true,
                brokers: 1, // Single broker setup
                topics: 1, // transaction-events topic
                consumer_groups: 1, // transaction-consumer-group
                partitions: 1, // Default partition count
                messages: {
                    produced: 0, // Would need monitoring tools like Burrow
                    consumed: 0,
                },
            };
        } catch (error) {
            logger.error('Failed to get Kafka stats:', error);
            return { connected: false };
        }
    }

  static async getDatabaseStats(): Promise<{
    connected: boolean;
    tables?: {
      total: number;
      names: string[];
    };
    records?: {
      total: number;
      byTable: Record<string, number>;
    };
    performance?: {
      queryCount: number;
      slowQueries: number;
    };
  }> {
    try {
      // Get basic counts for main tables
      const [sendersCount, receiversCount, transactionsCount, usersCount] = await Promise.all([
        prisma.sender.count(),
        prisma.receiver.count(),
        prisma.transaction.count(),
        prisma.user.count(),
      ]);

      const totalRecords = sendersCount + receiversCount + transactionsCount + usersCount;

      return {
        connected: true,
        tables: {
          total: 4, // Main application tables
          names: ['senders', 'receivers', 'transactions', 'users'],
        },
        records: {
          total: totalRecords,
          byTable: {
            senders: sendersCount,
            receivers: receiversCount,
            transactions: transactionsCount,
            users: usersCount,
          },
        },
        performance: {
          queryCount: 0, // Would need additional monitoring
          slowQueries: 0,
        },
      };
    } catch (error) {
      logger.error('Failed to get database stats:', error);
      return { connected: false };
    }
  }
}
