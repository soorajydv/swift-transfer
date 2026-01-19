import { z } from 'zod';

// Transaction creation validation
export const createTransactionSchema = z.object({
  body: z.object({
    senderId: z.string()
      .min(1, 'Sender ID is required'),

    receiverId: z.string()
      .min(1, 'Receiver ID is required'),

    amountJPY: z.number()
      .positive('Amount must be greater than 0')
      .max(10000000, 'Amount cannot exceed 10,000,000 JPY')
      .finite('Amount must be a valid number'),

    purpose: z.string()
      .min(3, 'Purpose must be at least 3 characters')
      .max(200, 'Purpose cannot exceed 200 characters')
      .trim(),

    notes: z.string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .optional()
      .default(''),
  }),
});

// Transaction status update validation
export const updateTransactionStatusSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, 'Transaction ID is required'),
  }),
  body: z.object({
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled'], {
      errorMap: () => ({ message: 'Invalid transaction status' }),
    }),

    notes: z.string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .optional()
      .default(''),
  }),
});

// Transaction cancellation validation
export const cancelTransactionSchema = z.object({
  body: z.object({
    reason: z.string()
      .min(5, 'Cancellation reason must be at least 5 characters')
      .max(500, 'Cancellation reason cannot exceed 500 characters')
      .trim(),
  }),
});

// Transaction list query validation
export const getTransactionsSchema = z.object({
  query: z.object({
    page: z.string()
      .optional()
      .transform(val => val ? parseInt(val) : 1)
      .refine(val => val >= 1 && val <= 1000, {
        message: 'Page must be between 1 and 1000'
      }),

    limit: z.string()
      .optional()
      .transform(val => val ? parseInt(val) : 10)
      .refine(val => val >= 1 && val <= 100, {
        message: 'Limit must be between 1 and 100'
      }),

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

    senderId: z.string().optional(),

    receiverId: z.string().optional(),
    
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
      .optional(),

    minAmount: z.string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => val === undefined || val > 0, {
        message: 'Minimum amount must be positive'
      }),

    maxAmount: z.string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => val === undefined || val > 0, {
        message: 'Maximum amount must be positive'
      }),
  }),
});

// Transaction stats query validation
export const getTransactionStatsSchema = z.object({
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

// Transaction ID parameter validation
export const transactionIdSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, 'Transaction ID is required'),
  }),
});

// Type exports for use in services/controllers
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusSchema>;
export type CancelTransactionInput = z.infer<typeof cancelTransactionSchema>;
export type GetTransactionsInput = z.infer<typeof getTransactionsSchema>;
export type GetTransactionStatsInput = z.infer<typeof getTransactionStatsSchema>;
export type TransactionIdInput = z.infer<typeof transactionIdSchema>;
