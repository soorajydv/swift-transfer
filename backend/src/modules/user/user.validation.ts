import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    fullName: z.string()
      .min(1, 'Full name is required')
      .max(100, 'Full name cannot exceed 100 characters')
      .trim(),
    role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER'], {
      errorMap: () => ({ message: 'Role must be ADMIN, OPERATOR, or VIEWER' }),
    }),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .toLowerCase()
      .trim()
      .optional(),
    fullName: z.string()
      .min(1, 'Full name is required')
      .max(100, 'Full name cannot exceed 100 characters')
      .trim()
      .optional(),
    phone: z.string()
      .min(10, 'Phone number must be at least 10 characters')
      .max(15, 'Phone number cannot exceed 15 characters')
      .trim()
      .optional(),
    role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER'], {
      errorMap: () => ({ message: 'Role must be ADMIN, OPERATOR, or VIEWER' }),
    }).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    search: z.string().optional(),
    role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUserInput = z.infer<typeof getUserSchema>;
export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
