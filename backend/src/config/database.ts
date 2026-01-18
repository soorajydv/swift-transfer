import prisma from './prisma';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('MS SQL Database connected successfully via Prisma');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
};

export { prisma };
