import { z } from 'zod';

// Sender creation validation
export const createSenderSchema = z.object({
  body: z.object({
    fullName: z.string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .trim()
      .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),

    email: z.string()
      .email('Invalid email format')
      .toLowerCase()
      .trim(),

    phone: z.string()
      .regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format')
      .min(10, 'Phone number must be at least 10 characters')
      .max(15, 'Phone number cannot exceed 15 characters'),

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

    identityType: z.enum(['passport', 'drivers_license', 'residence_card'], {
      errorMap: () => ({ message: 'Identity type must be passport, drivers_license, or residence_card' }),
    }),

    identityNumber: z.string()
      .min(5, 'Identity number must be at least 5 characters')
      .max(20, 'Identity number cannot exceed 20 characters')
      .trim(),
  }),
});

// Sender update validation
export const updateSenderSchema = z.object({
  params: z.object({
    id: z.string()

      .min(1, 'Sender ID is required'),
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
      .optional(),

    phone: z.string()
      .regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format')
      .min(10, 'Phone number must be at least 10 characters')
      .max(15, 'Phone number cannot exceed 15 characters')
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

    identityType: z.enum(['passport', 'drivers_license', 'residence_card'], {
      errorMap: () => ({ message: 'Identity type must be passport, drivers_license, or residence_card' }),
    }).optional(),

    identityNumber: z.string()
      .min(5, 'Identity number must be at least 5 characters')
      .max(20, 'Identity number cannot exceed 20 characters')
      .trim()
      .optional(),

    status: z.enum(['active', 'inactive', 'pending_verification'], {
      errorMap: () => ({ message: 'Status must be active, inactive, or pending_verification' }),
    }).optional(),
  }),
});

// Sender list query validation
export const getSendersSchema = z.object({
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

    status: z.enum(['active', 'inactive', 'pending_verification'])
      .optional(),

    sortBy: z.enum(['fullName', 'email', 'createdAt', 'updatedAt'])
      .optional()
      .default('createdAt'),

    sortOrder: z.enum(['asc', 'desc'])
      .optional()
      .default('desc'),
  }),
});

// Sender ID parameter validation
export const senderIdSchema = z.object({
  params: z.object({
    id: z.string()

      .min(1, 'Sender ID is required'),
  }),
});

// Deactivate sender validation
export const deactivateSenderSchema = z.object({
  params: z.object({
    id: z.string()

      .min(1, 'Sender ID is required'),
  }),
});

// Type exports for use in services/controllers
export type CreateSenderInput = z.infer<typeof createSenderSchema>;
export type UpdateSenderInput = z.infer<typeof updateSenderSchema>;
export type GetSendersInput = z.infer<typeof getSendersSchema>;
export type SenderIdInput = z.infer<typeof senderIdSchema>;
export type DeactivateSenderInput = z.infer<typeof deactivateSenderSchema>;
