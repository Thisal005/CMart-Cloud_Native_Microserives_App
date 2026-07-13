import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../errors';

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
