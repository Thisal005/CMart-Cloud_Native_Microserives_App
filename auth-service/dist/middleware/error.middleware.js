"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
/**
 * Global Express error-handling middleware.
 * Intercepts all thrown exceptions and formats them as standard API error responses.
 */
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    const isAppError = err instanceof errors_1.AppError;
    const statusCode = isAppError ? err.statusCode : 500;
    const errorCode = isAppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'An unexpected error occurred';
    const details = isAppError ? err.details : undefined;
    // Log the error with appropriate level
    if (statusCode >= 500) {
        logger_1.logger.error(`Unhandled Exception: ${message}`, err);
    }
    else {
        logger_1.logger.warn(`Request Exception: ${message}`, { statusCode, errorCode, details });
    }
    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message,
            ...(details && { details }),
            ...(process.env.NODE_ENV !== 'production' && !isAppError && { stack: err.stack }),
        },
    });
}
exports.default = errorHandler;
