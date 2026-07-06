import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants';

/**
 * Base custom error class for operational errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any;

  constructor(message: string, statusCode: number, errors?: any, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when input validation fails (HTTP 400)
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: any) {
    super(message, HttpStatus.BAD_REQUEST, errors);
  }
}

/**
 * Error thrown when authentication fails or is missing (HTTP 401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * Error thrown when the user is authenticated but not authorized (HTTP 403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

/**
 * Error thrown when a resource is not found (HTTP 404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * Error thrown when resource conflicts exist, like duplicate emails (HTTP 409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

/**
 * Fallback error class for unexpected server errors (HTTP 500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', errors?: any) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, errors, false);
  }
}

/**
 * Global Express Error Handling Middleware.
 * Standardizes error responses across all microservices.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let errors: any = undefined;

  // Check if it's a known custom operational error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Error) {
    // Check if it's a standard error that should be mapped, or if we just keep default
    message = err.message;
  } else if (typeof err === 'string') {
    message = err;
  }

  // Set response headers and send standard error format
  res.status(statusCode).json({
    success: false,
    message,
    error: message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  });
};
