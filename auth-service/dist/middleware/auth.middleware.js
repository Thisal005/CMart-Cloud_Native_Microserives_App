"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.authorizeRoles = authorizeRoles;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const errors_1 = require("../utils/errors");
/**
 * Middleware to protect routes and verify JWT access tokens.
 * Extracts the authenticated user payload and attaches it to the request object.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next(new errors_1.UnauthorizedError('Access token is missing or invalid'));
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(new errors_1.UnauthorizedError('Access token is missing or invalid'));
    }
}
/**
 * Middleware to authorize access based on user roles.
 * Must be used after authenticateToken middleware.
 */
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            next(new errors_1.UnauthorizedError('Unauthorized'));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new errors_1.ForbiddenError('Forbidden: Insufficient permissions'));
            return;
        }
        next();
    };
}
