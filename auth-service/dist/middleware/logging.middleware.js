"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../utils/logger");
/**
 * Express middleware to log incoming HTTP requests and response times.
 */
function requestLogger(req, res, next) {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
        if (res.statusCode >= 500) {
            logger_1.logger.error(message);
        }
        else if (res.statusCode >= 400) {
            logger_1.logger.warn(message);
        }
        else {
            logger_1.logger.info(message);
        }
    });
    next();
}
exports.default = requestLogger;
