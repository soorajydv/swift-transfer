import logger from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errorTypes';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
    });

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map((e: any) => ({
            field: e.path,
            message: e.message,
            value: e.value
        }));

        return res.status(400).json({ success: false, message: 'Validation error', errors });
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, message: 'Duplicate entry', error: err.errors[0]?.message || 'Unique constraint violated' });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
    }

    // Application errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message, ...(err.details && { details: err.details }) });
    }

    // Validation errors from Zod
    if (err instanceof ValidationError) {
        return res.status(err.statusCode).json({ success: false, message: err.message, ...(err.details && { errors: err.details }) });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    return res.status(statusCode).json({ success: false, message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
};

// Service layer error handler (Prisma version)
export class ErrorHandler {
    static handle(error: unknown, context: string) {
        if (error instanceof PrismaClientKnownRequestError) {
            const dbError = handlePrismaError(error);
            logger.warn("Database error occurred", {
                message: dbError.message,
                context,
                statusCode: dbError.statusCode,
                prismaCode: error.code,
                meta: error.meta,
            });
            return dbError;
        }

        if (error instanceof PrismaClientValidationError) {
            return new ValidationError("Validation failed", error.message);
        }

        if (error instanceof AppError) {
            logger.warn("Application error occurred", {
                message: error.message,
                context,
                statusCode: error.statusCode,
            });
            return error;
        }

        const unknownError = new AppError(
            error instanceof Error ? error.message : 'Internal Server Error',
            500
        );

        logger.error("Unknown error occurred", {
            message: error instanceof Error ? error.message : "Unknown error",
            context,
            stack: error instanceof Error ? error.stack : undefined,
        });

        return unknownError;
    }
}

const handlePrismaError = (error: PrismaClientKnownRequestError): AppError => {
    switch (error.code) {
        case 'P2002':
            return new AppError("Resource already exists", 409);
        case 'P2003':
            return new AppError("Foreign key constraint violation", 400);
        case 'P2025':
            return new AppError("Record not found", 404);
        default:
            return new AppError("Database operation failed", 500);
    }
};

export { ValidationError, AppError };
