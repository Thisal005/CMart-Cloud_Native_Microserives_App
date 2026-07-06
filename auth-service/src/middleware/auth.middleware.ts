import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Role } from '../model/user';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Extend Express Request interface to include the authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

/**
 * Middleware to protect routes and verify JWT access tokens.
 * Extracts the authenticated user payload and attaches it to the request object.
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Access token is missing or invalid'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: Role;
    };

    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Access token is missing or invalid'));
  }
}

/**
 * Middleware to authorize access based on user roles.
 * Must be used after authenticateToken middleware.
 */
export function authorizeRoles(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Unauthorized'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Forbidden: Insufficient permissions'));
      return;
    }

    next();
  };
}
