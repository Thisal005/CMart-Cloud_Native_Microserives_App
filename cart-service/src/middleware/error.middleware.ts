import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler as sharedErrorHandler } from 'shared';
import { logger } from '../utils/logger';

/**
 * Global Express error-handling middleware.
 * Logs exceptions and delegates response formatting to the shared errorHandler.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err.message || 'An unexpected error occurred';
  const errors = isAppError ? err.errors : undefined;

  // Log the error with appropriate level and structured metadata
  if (statusCode >= 500) {
    logger.error(`Unhandled Exception: ${message}`, err);
  } else {
    logger.warn(`Request Exception: ${message}`, { statusCode, errors });
  }

  // Delegate formatting to shared error handler
  sharedErrorHandler(err, req, res, next);
}
export default errorHandler;
