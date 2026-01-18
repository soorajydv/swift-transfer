import { z } from 'zod';

// Dashboard stats query validation
export const getDashboardStatsSchema = z.object({
  query: z.object({
    startDate: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Start date must be a valid date'
      }),

    endDate: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'End date must be a valid date'
      }),
  }),
});

// Recent transactions query validation
export const getRecentTransactionsSchema = z.object({
  query: z.object({
    limit: z.string()
      .optional()
      .transform(val => val ? parseInt(val) : 10)
      .refine(val => val >= 1 && val <= 50, {
        message: 'Limit must be between 1 and 50'
      }),
  }),
});

// Activity summary query validation
export const getActivitySummarySchema = z.object({
  query: z.object({
    startDate: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Start date must be a valid date'
      }),

    endDate: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'End date must be a valid date'
      }),
  }),
});

// System health query validation
export const getSystemHealthSchema = z.object({
  query: z.object({
    detailed: z.string()
      .optional()
      .default('false')
      .transform(val => val === 'true'),
  }),
});

// Type exports for use in services/controllers
export type GetDashboardStatsInput = z.infer<typeof getDashboardStatsSchema>;
export type GetRecentTransactionsInput = z.infer<typeof getRecentTransactionsSchema>;
export type GetActivitySummaryInput = z.infer<typeof getActivitySummarySchema>;
export type GetSystemHealthInput = z.infer<typeof getSystemHealthSchema>;
