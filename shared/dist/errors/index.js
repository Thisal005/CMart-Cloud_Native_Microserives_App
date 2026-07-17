"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
const constants_1 = require("../constants");
/**
 * Base custom error class for operational errors
 */
class AppError extends Error {
    statusCode;
    isOperational;
    errors;
    constructor(message, statusCode, errors, isOperational = true) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Error thrown when input validation fails (HTTP 400)
 */
class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors) {
        super(message, constants_1.HttpStatus.BAD_REQUEST, errors);
    }
}
exports.ValidationError = ValidationError;
/**
 * Error thrown when authentication fails or is missing (HTTP 401)
 */
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, constants_1.HttpStatus.UNAUTHORIZED);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Error thrown when the user is authenticated but not authorized (HTTP 403)
 */
class AuthorizationError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, constants_1.HttpStatus.FORBIDDEN);
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Error thrown when a resource is not found (HTTP 404)
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, constants_1.HttpStatus.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Error thrown when resource conflicts exist, like duplicate emails (HTTP 409)
 */
class ConflictError extends AppError {
    constructor(message) {
        super(message, constants_1.HttpStatus.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
/**
 * Fallback error class for unexpected server errors (HTTP 500)
 */
class InternalServerError extends AppError {
    constructor(message = 'Internal server error', errors) {
        super(message, constants_1.HttpStatus.INTERNAL_SERVER_ERROR, errors, false);
    }
}
exports.InternalServerError = InternalServerError;
const getServiceName = () => {
    if (process.env.SERVICE_NAME) {
        return process.env.SERVICE_NAME;
    }
    const cwd = process.cwd();
    if (cwd.includes('auth-service'))
        return 'auth-service';
    if (cwd.includes('product-service'))
        return 'product-service';
    if (cwd.includes('cart-service'))
        return 'cart-service';
    if (cwd.includes('order-service'))
        return 'order-service';
    if (cwd.includes('payment-service'))
        return 'payment-service';
    return 'CMartService';
};
/**
 * Global Express Error Handling Middleware.
 * Standardizes error responses across all microservices.
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = constants_1.HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details = null;
    let code = 'INTERNAL_SERVER_ERROR';
    // Check if it's a known custom operational error
    if (err instanceof ValidationError) {
        statusCode = err.statusCode;
        message = err.message;
        details = err.errors || null;
        code = 'VALIDATION_ERROR';
    }
    else if (err instanceof AuthenticationError) {
        statusCode = err.statusCode;
        message = err.message;
        code = 'UNAUTHORIZED';
    }
    else if (err instanceof AuthorizationError) {
        statusCode = err.statusCode;
        message = err.message;
        code = 'FORBIDDEN';
    }
    else if (err instanceof NotFoundError) {
        statusCode = err.statusCode;
        message = err.message;
        code = 'NOT_FOUND';
    }
    else if (err instanceof ConflictError) {
        statusCode = err.statusCode;
        message = err.message;
        code = 'CONFLICT';
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        details = err.errors || null;
        code = err.statusCode === constants_1.HttpStatus.BAD_REQUEST ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR';
    }
    else if (err instanceof Error) {
        message = err.message;
    }
    else if (typeof err === 'string') {
        message = err;
    }
    const requestId = req.requestId || null;
    // Set response headers and send standard error format
    res.status(statusCode).json({
        status: statusCode,
        success: false,
        message,
        code,
        timestamp: new Date().toISOString(),
        requestId,
        details,
        error: {
            code,
            message,
            service: getServiceName(),
            timestamp: new Date().toISOString(),
            requestId,
            details,
        },
    });
};
exports.errorHandler = errorHandler;
