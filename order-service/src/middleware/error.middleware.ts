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
  const errorType = err.constructor?.name || err.name || 'Error';
  const correlationId = (req.headers['x-correlation-id'] || req.headers['x-request-id']) as string | undefined;

  const errorMetadata = {
    message,
    type: errorType,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(correlationId && { correlationId }),
    ...(isAppError && err.errors && { details: err.errors }),
    path: req.originalUrl,
    method: req.method,
  };

  // Log the error with appropriate level and structured metadata
  if (statusCode >= 500) {
    logger.error(`Unhandled Exception: ${message}`, err, errorMetadata);
  } else {
    logger.warn(`Request Exception: ${message}`, errorMetadata);
  }

  // Delegate formatting to shared error handler
  sharedErrorHandler(err, req, res, next);
}
export default errorHandler;
export { errorHandler as localErrorHandler };
