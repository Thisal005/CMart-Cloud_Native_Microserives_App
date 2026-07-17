"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.requestIdMiddleware = exports.requireRole = exports.authMiddleware = void 0;
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateUuidParam = validateUuidParam;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const logging_1 = require("../logging");
const request_context_1 = require("../utils/request-context");
const validationLogger = new logging_1.Logger('validation-middleware');
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
/**
 * Middleware to trace each request with a unique ID and initialize request context.
 */
const requestIdMiddleware = (req, res, next) => {
    const requestId = (req.headers['x-request-id'] || req.headers['x-correlation-id'] || (0, utils_1.generateRandomId)());
    const correlationId = (req.headers['x-correlation-id'] || requestId);
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', correlationId);
    request_context_1.requestContext.run({
        get requestId() { return req.requestId || requestId; },
        get correlationId() { return (req.headers['x-correlation-id'] || req.requestId || requestId); },
        get token() { return (0, utils_1.extractBearerToken)(req.headers.authorization); },
        get userId() { return req.user?.id; }
    }, () => {
        next();
    });
};
exports.requestIdMiddleware = requestIdMiddleware;
/**
 * Middleware creator to log incoming HTTP requests and response times
 */
const requestLogger = (logger) => {
    return (req, res, next) => {
        const startTime = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const correlationId = (req.headers['x-request-id'] || req.headers['x-correlation-id'] || req.requestId);
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
            }
            else if (res.statusCode >= 400) {
                logger.warn(message, meta);
            }
            else {
                logger.info(message, meta);
            }
        });
        next();
    };
};
exports.requestLogger = requestLogger;
/**
 * Express middleware to validate request body
 */
function validateBody(validator) {
    return (req, res, next) => {
        const { error, details } = validator(req.body);
        if (error) {
            validationLogger.warn('Validation Errors', { type: 'body', error, details, path: req.originalUrl });
            next(new errors_1.ValidationError(error, details));
            return;
        }
        next();
    };
}
/**
 * Express middleware to validate request query parameters
 */
function validateQuery(validator) {
    return (req, res, next) => {
        const { error, details } = validator(req.query);
        if (error) {
            validationLogger.warn('Validation Errors', { type: 'query', error, details, path: req.originalUrl });
            next(new errors_1.ValidationError(error, details));
            return;
        }
        next();
    };
}
/**
 * Express middleware to validate UUID path parameter
 */
function validateUuidParam(paramName) {
    return (req, res, next) => {
        const value = req.params[paramName];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!value || !uuidRegex.test(value)) {
            validationLogger.warn(`Invalid UUID path parameter: ${paramName}=${value}`);
            next(new errors_1.ValidationError(`Parameter ${paramName} must be a valid UUID`));
            return;
        }
        next();
    };
}
