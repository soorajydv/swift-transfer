import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema, ZodType } from 'zod';
import { ValidationError } from '../utils/errorTypes';

export const validateRequest = (schema: ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
      });

      // Replace request data with validated data
      if (validatedData.body) req.body = validatedData.body as any;
      if (validatedData.query) req.query = validatedData.query as any;
      if (validatedData.params) req.params = validatedData.params as any;
      if (validatedData.headers) req.headers = validatedData.headers as any;

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        if (firstIssue) {
          const fieldPath = firstIssue.path.join('.');
          const fieldName = fieldPath || 'unknown field';
          const message = `${fieldName}: ${firstIssue.message}`;
          next(new ValidationError(message));
          return;
        }
        next(new ValidationError("Validation failed"));
        return;
      }
      next(new ValidationError("Invalid request data"));
    }
  };
};
