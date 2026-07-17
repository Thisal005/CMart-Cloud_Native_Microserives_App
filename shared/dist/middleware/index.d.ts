import { Request, Response, NextFunction } from 'express';
import { Logger } from '../logging';
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
export declare const authMiddleware: (jwtSecret: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Reusable role authorization middleware
 * @param allowedRoles List of roles permitted to access the resource
 */
export declare const requireRole: (allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to trace each request with a unique ID and initialize request context.
 */
export declare const requestIdMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware creator to log incoming HTTP requests and response times
 */
export declare const requestLogger: (logger: Logger) => (req: Request, res: Response, next: NextFunction) => void;
export type ValidatorFunc = (data: any) => {
    error?: string;
    details?: Record<string, string>;
};
/**
 * Express middleware to validate request body
 */
export declare function validateBody(validator: ValidatorFunc): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Express middleware to validate request query parameters
 */
export declare function validateQuery(validator: ValidatorFunc): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Express middleware to validate UUID path parameter
 */
export declare function validateUuidParam(paramName: string): (req: Request, res: Response, next: NextFunction) => void;
