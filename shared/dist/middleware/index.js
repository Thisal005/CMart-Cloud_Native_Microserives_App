"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../errors");
/**
 * Reusable JWT authentication middleware creator
 * @param jwtSecret The JWT secret key used to verify the token
 */
const authMiddleware = (jwtSecret) => {
    return (req, res, next) => {
        // 1. Extract token from Authorization header or fallback to query/body
        let token = req.headers.authorization;
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        }
        else {
            token = (req.body?.token || req.query?.token || '');
        }
        if (!token) {
            return next(new errors_1.AuthenticationError('Authentication token is required'));
        }
        // 2. Verify token
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            req.user = decoded;
            next();
        }
        catch (err) {
            return next(new errors_1.AuthenticationError('Invalid or expired authentication token'));
        }
    };
};
exports.authMiddleware = authMiddleware;
/**
 * Reusable role authorization middleware
 * @param allowedRoles List of roles permitted to access the resource
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.AuthenticationError('Authentication required'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errors_1.AuthorizationError('You do not have permission to access this resource'));
        }
        next();
    };
};
exports.requireRole = requireRole;
