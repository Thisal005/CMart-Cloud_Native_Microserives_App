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
/**
 * Global Express Error Handling Middleware.
 * Standardizes error responses across all microservices.
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = constants_1.HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors = undefined;
    // Check if it's a known custom operational error
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    }
    else if (err instanceof Error) {
        // Check if it's a standard error that should be mapped, or if we just keep default
        message = err.message;
    }
    else if (typeof err === 'string') {
        message = err;
    }
    // Set response headers and send standard error format
    res.status(statusCode).json({
        success: false,
        message,
        error: message,
        ...(errors && { errors }),
        timestamp: new Date().toISOString(),
    });
};
exports.errorHandler = errorHandler;
