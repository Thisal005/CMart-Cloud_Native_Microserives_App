import { Request, Response, NextFunction } from 'express';
/**
 * Base custom error class for operational errors
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly errors?: any;
    constructor(message: string, statusCode: number, errors?: any, isOperational?: boolean);
}
/**
 * Error thrown when input validation fails (HTTP 400)
 */
export declare class ValidationError extends AppError {
    constructor(message?: string, errors?: any);
}
/**
 * Error thrown when authentication fails or is missing (HTTP 401)
 */
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
/**
 * Error thrown when the user is authenticated but not authorized (HTTP 403)
 */
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
/**
 * Error thrown when a resource is not found (HTTP 404)
 */
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
/**
 * Error thrown when resource conflicts exist, like duplicate emails (HTTP 409)
 */
export declare class ConflictError extends AppError {
    constructor(message: string);
}
/**
 * Fallback error class for unexpected server errors (HTTP 500)
 */
export declare class InternalServerError extends AppError {
    constructor(message?: string, errors?: any);
}
/**
 * Global Express Error Handling Middleware.
 * Standardizes error responses across all microservices.
 */
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
