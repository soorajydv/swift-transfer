import { z } from 'zod';

// Receiver creation validation
export const createReceiverSchema = z.object({
  body: z.object({
    senderId: z.string()
      .min(1, 'Sender ID is required'),

    fullName: z.string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .trim()
      .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),

    email: z.string()
      .email('Invalid email format')
      .toLowerCase()
      .trim()
      .optional(),

    phone: z.string()
      .regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format')
      .min(10, 'Phone number must be at least 10 characters')
      .max(15, 'Phone number cannot exceed 15 characters'),

    bankName: z.string()
      .min(2, 'Bank name must be at least 2 characters')
      .max(100, 'Bank name cannot exceed 100 characters')
      .trim(),

    bankBranch: z.string()
      .min(2, 'Bank branch must be at least 2 characters')
      .max(100, 'Bank branch cannot exceed 100 characters')
      .trim(),

    accountNumber: z.string()
      .min(8, 'Account number must be at least 8 characters')
      .max(20, 'Account number cannot exceed 20 characters')
      .regex(/^\d+$/, 'Account number must contain only digits'),

    address: z.string()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address cannot exceed 200 characters')
      .trim(),

    city: z.string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City cannot exceed 50 characters')
      .trim(),

    country: z.string()
      .min(2, 'Country must be at least 2 characters')
      .max(50, 'Country cannot exceed 50 characters')
      .trim(),

    relationship: z.string()
      .min(2, 'Relationship must be at least 2 characters')
      .max(50, 'Relationship cannot exceed 50 characters')
      .trim(),
  }),
});

// Receiver update validation
export const updateReceiverSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, 'Receiver ID is required'),
  }),
  body: z.object({
    fullName: z.string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .trim()
      .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
      .optional(),

    email: z.string()
      .email('Invalid email format')
      .toLowerCase()
      .trim()
      .optional()
      .or(z.literal('')),

    phone: z.string()
      .regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format')
      .min(10, 'Phone number must be at least 10 characters')
      .max(15, 'Phone number cannot exceed 15 characters')
      .optional(),

    bankName: z.string()
      .min(2, 'Bank name must be at least 2 characters')
      .max(100, 'Bank name cannot exceed 100 characters')
      .trim()
      .optional(),

    bankBranch: z.string()
      .min(2, 'Bank branch must be at least 2 characters')
      .max(100, 'Bank branch cannot exceed 100 characters')
      .trim()
      .optional(),

    accountNumber: z.string()
      .min(8, 'Account number must be at least 8 characters')
      .max(20, 'Account number cannot exceed 20 characters')
      .regex(/^\d+$/, 'Account number must contain only digits')
      .optional(),

    address: z.string()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address cannot exceed 200 characters')
      .trim()
      .optional(),

    city: z.string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City cannot exceed 50 characters')
      .trim()
      .optional(),

    country: z.string()
      .min(2, 'Country must be at least 2 characters')
      .max(50, 'Country cannot exceed 50 characters')
      .trim()
      .optional(),

    relationship: z.string()
      .min(2, 'Relationship must be at least 2 characters')
      .max(50, 'Relationship cannot exceed 50 characters')
      .trim()
      .optional(),

    status: z.enum(['active', 'inactive'], {
      errorMap: () => ({ message: 'Status must be active or inactive' }),
    }).optional(),
  }),
});

// Receiver list query validation
export const getReceiversSchema = z.object({
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

    search: z.string()
      .max(100, 'Search query cannot exceed 100 characters')
      .optional(),

    senderId: z.string()
      .optional(),

    status: z.enum(['active', 'inactive'])
      .optional(),

    sortBy: z.enum(['fullName', 'bankName', 'createdAt', 'updatedAt'])
      .optional()
      .default('createdAt'),

    sortOrder: z.enum(['asc', 'desc'])
      .optional()
      .default('desc'),
  }),
});

// Receiver ID parameter validation
export const receiverIdSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, 'Receiver ID is required'),
  }),
});

// Deactivate receiver validation
export const deactivateReceiverSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, 'Receiver ID is required'),
  }),
});

// Get receivers by sender ID validation
export const getReceiversBySenderSchema = z.object({
  params: z.object({
    senderId: z.string()
      .min(1, 'Sender ID is required'),
  }),
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

    status: z.enum(['active', 'inactive'])
      .optional(),
  }),
});

// Type exports for use in services/controllers
export type CreateReceiverInput = z.infer<typeof createReceiverSchema>;
export type UpdateReceiverInput = z.infer<typeof updateReceiverSchema>;
export type GetReceiversInput = z.infer<typeof getReceiversSchema>;
export type ReceiverIdInput = z.infer<typeof receiverIdSchema>;
export type DeactivateReceiverInput = z.infer<typeof deactivateReceiverSchema>;
export type GetReceiversBySenderInput = z.infer<typeof getReceiversBySenderSchema>;
