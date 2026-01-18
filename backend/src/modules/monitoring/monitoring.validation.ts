import { z } from 'zod';

// System health validation
export const getSystemHealthSchema = z.object({
  query: z.object({
    detailed: z.string()
      .optional()
      .default('false')
      .transform(val => val === 'true'),
  }),
});

// Redis stats validation
export const getRedisStatsSchema = z.object({
  query: z.object({
    detailed: z.string()
      .optional()
      .default('false')
      .transform(val => val === 'true'),
  }),
});

// Kafka stats validation
export const getKafkaStatsSchema = z.object({
  query: z.object({
    detailed: z.string()
      .optional()
      .default('false')
      .transform(val => val === 'true'),
  }),
});

// Database stats validation
export const getDatabaseStatsSchema = z.object({
  query: z.object({
    detailed: z.string()
      .optional()
      .default('false')
      .transform(val => val === 'true'),
  }),
});

// Type exports for use in services/controllers
export type GetSystemHealthInput = z.infer<typeof getSystemHealthSchema>;
export type GetRedisStatsInput = z.infer<typeof getRedisStatsSchema>;
export type GetKafkaStatsInput = z.infer<typeof getKafkaStatsSchema>;
export type GetDatabaseStatsInput = z.infer<typeof getDatabaseStatsSchema>;
