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
    role: z.enum(['admin', 'operator', 'viewer'], {
      errorMap: () => ({ message: 'Role must be admin, operator, or viewer' }),
    }),
    status: z.enum(['active', 'inactive']).optional().default('active'),
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
    role: z.enum(['admin', 'operator', 'viewer'], {
      errorMap: () => ({ message: 'Role must be admin, operator, or viewer' }),
    }).optional(),
    status: z.enum(['active', 'inactive']).optional(),
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
    role: z.enum(['admin', 'operator', 'viewer']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
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
