import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Global Express error-handling middleware.
 * Intercepts all thrown exceptions and formats them as standard API error responses.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = isAppError ? err.details : undefined;

  // Log the error with appropriate level
  if (statusCode >= 500) {
    logger.error(`Unhandled Exception: ${message}`, err);
  } else {
    logger.warn(`Request Exception: ${message}`, { statusCode, errorCode, details });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV !== 'production' && !isAppError && { stack: err.stack }),
    },
  });
}
export default errorHandler;
