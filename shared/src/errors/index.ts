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

const getServiceName = (): string => {
  if (process.env.SERVICE_NAME) {
    return process.env.SERVICE_NAME;
  }
  const cwd = process.cwd();
  if (cwd.includes('auth-service')) return 'auth-service';
  if (cwd.includes('product-service')) return 'product-service';
  if (cwd.includes('cart-service')) return 'cart-service';
  if (cwd.includes('order-service')) return 'order-service';
  if (cwd.includes('payment-service')) return 'payment-service';
  return 'CMartService';
};

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
  let details: any = null;
  let code = 'INTERNAL_SERVER_ERROR';

  // Check if it's a known custom operational error
  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.errors || null;
    code = 'VALIDATION_ERROR';
  } else if (err instanceof AuthenticationError) {
    statusCode = err.statusCode;
    message = err.message;
    code = 'UNAUTHORIZED';
  } else if (err instanceof AuthorizationError) {
    statusCode = err.statusCode;
    message = err.message;
    code = 'FORBIDDEN';
  } else if (err instanceof NotFoundError) {
    statusCode = err.statusCode;
    message = err.message;
    code = 'NOT_FOUND';
  } else if (err instanceof ConflictError) {
    statusCode = err.statusCode;
    message = err.message;
    code = 'CONFLICT';
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.errors || null;
    code = err.statusCode === HttpStatus.BAD_REQUEST ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR';
  } else if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === 'string') {
    message = err;
  }

  const requestId = (req as any).requestId || null;

  // Set response headers and send standard error format
  res.status(statusCode).json({
    status: statusCode,
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    requestId,
    details,
    error: {
      code,
      message,
      service: getServiceName(),
      timestamp: new Date().toISOString(),
      requestId,
      details,
    },
  });
};
