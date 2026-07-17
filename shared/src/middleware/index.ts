import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError, ValidationError } from '../errors';
import { generateRandomId } from '../utils';
import { Logger } from '../logging';

const validationLogger = new Logger('validation-middleware');

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

/**
 * Extended Express request interface containing authenticated user payload
 */
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

/**
 * Reusable JWT authentication middleware creator
 * @param jwtSecret The JWT secret key used to verify the token
 */
export const authMiddleware = (jwtSecret: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1. Extract token from Authorization header or fallback to query/body
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    } else {
      token = (req.body?.token || req.query?.token || '') as string;
    }

    if (!token) {
      return next(new AuthenticationError('Authentication token is required'));
    }

    // 2. Verify token
    try {
      const decoded = jwt.verify(token, jwtSecret) as UserPayload;
      req.user = decoded;
      next();
    } catch (err) {
      return next(new AuthenticationError('Invalid or expired authentication token'));
    }
  };
};

/**
 * Reusable role authorization middleware
 * @param allowedRoles List of roles permitted to access the resource
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError('You do not have permission to access this resource'));
    }

    next();
  };
};

/**
 * Middleware to trace each request with a unique ID
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] || req.headers['x-correlation-id'] || generateRandomId()) as string;
  (req as any).requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

/**
 * Middleware creator to log incoming HTTP requests and response times
 */
export const requestLogger = (logger: Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const correlationId = (req.headers['x-request-id'] || req.headers['x-correlation-id'] || (req as any).requestId) as string | undefined;
      const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
      const meta = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
        ...(correlationId && { correlationId }),
      };

      if (res.statusCode >= 500) {
        logger.error(message, undefined, meta);
      } else if (res.statusCode >= 400) {
        logger.warn(message, meta);
      } else {
        logger.info(message, meta);
      }
    });

    next();
  };
};

export type ValidatorFunc = (data: any) => { error?: string; details?: Record<string, string> };

/**
 * Express middleware to validate request body
 */
export function validateBody(validator: ValidatorFunc) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, details } = validator(req.body);
    if (error) {
      validationLogger.warn('Validation Errors', { type: 'body', error, details, path: req.originalUrl });
      next(new ValidationError(error, details));
      return;
    }
    next();
  };
}

/**
 * Express middleware to validate request query parameters
 */
export function validateQuery(validator: ValidatorFunc) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, details } = validator(req.query);
    if (error) {
      validationLogger.warn('Validation Errors', { type: 'query', error, details, path: req.originalUrl });
      next(new ValidationError(error, details));
      return;
    }
    next();
  };
}

/**
 * Express middleware to validate UUID path parameter
 */
export function validateUuidParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!value || !uuidRegex.test(value)) {
      validationLogger.warn(`Invalid UUID path parameter: ${paramName}=${value}`);
      next(new ValidationError(`Parameter ${paramName} must be a valid UUID`));
      return;
    }
    next();
  };
}
