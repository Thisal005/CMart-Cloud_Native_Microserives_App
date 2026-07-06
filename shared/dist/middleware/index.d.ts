import { Request, Response, NextFunction } from 'express';
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
