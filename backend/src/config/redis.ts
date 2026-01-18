import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

    const clientOptions: any = {
      url: redisUrl,
      socket: {
        connectTimeout: 60000,
      },
    };

    if (process.env.REDIS_PASSWORD) {
      clientOptions.password = process.env.REDIS_PASSWORD;
    }

    redisClient = createClient(clientOptions);

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis connection ended');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.disconnect();
    logger.info('Disconnected from Redis');
  }
};

// OTP operations
export const setOTP = async (email: string, otp: string, expirySeconds: number = 300): Promise<void> => {
  const key = `otp:${email}`;
  await redisClient.setEx(key, expirySeconds, otp);
};

export const getOTP = async (email: string): Promise<string | null> => {
  const key = `otp:${email}`;
  return await redisClient.get(key);
};

export const deleteOTP = async (email: string): Promise<void> => {
  const key = `otp:${email}`;
  await redisClient.del(key);
};

// Rate limiting
export const incrementRateLimit = async (key: string, windowMs: number = 60000): Promise<number> => {
  const count = await redisClient.incr(key);
  if (count === 1) {
    await redisClient.pExpire(key, windowMs);
  }
  return count;
};

export const getRateLimit = async (key: string): Promise<number> => {
  const count = await redisClient.get(key);
  return count ? parseInt(count) : 0;
};

// Session management
export const setSession = async (sessionId: string, data: any, expirySeconds: number = 3600): Promise<void> => {
  const key = `session:${sessionId}`;
  await redisClient.setEx(key, expirySeconds, JSON.stringify(data));
};

export const getSession = async (sessionId: string): Promise<any | null> => {
  const key = `session:${sessionId}`;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  const key = `session:${sessionId}`;
  await redisClient.del(key);
};

// Cache operations
export const setCache = async (key: string, value: any, expirySeconds?: number): Promise<void> => {
  const data = JSON.stringify(value);
  if (expirySeconds) {
    await redisClient.setEx(key, expirySeconds, data);
  } else {
    await redisClient.set(key, data);
  }
};

export const getCache = async (key: string): Promise<any | null> => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const deleteCache = async (key: string): Promise<void> => {
  await redisClient.del(key);
};