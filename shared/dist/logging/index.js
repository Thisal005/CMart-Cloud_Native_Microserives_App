"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const request_context_1 = require("../utils/request-context");
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    serviceName;
    constructor(serviceName) {
        this.serviceName = serviceName;
    }
    /**
     * Helper to write structured JSON log entries
     */
    log(level, message, meta) {
        const LEVEL_SEVERITY = {
            [LogLevel.DEBUG]: 0,
            [LogLevel.INFO]: 1,
            [LogLevel.WARN]: 2,
            [LogLevel.ERROR]: 3,
        };
        const configLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
        const currentSeverity = LEVEL_SEVERITY[level] !== undefined ? LEVEL_SEVERITY[level] : 1;
        const configSeverity = LEVEL_SEVERITY[configLevel] !== undefined ? LEVEL_SEVERITY[configLevel] : 1;
        if (currentSeverity < configSeverity) {
            return;
        }
        const context = (0, request_context_1.getRequestContext)();
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            service: this.serviceName,
            message,
            ...(context && {
                requestId: context.requestId,
                correlationId: context.correlationId,
            }),
            ...(meta && { meta }),
        };
        const output = JSON.stringify(logEntry);
        if (level === LogLevel.ERROR) {
            console.error(output);
        }
        else if (level === LogLevel.WARN) {
            console.warn(output);
        }
        else {
            console.log(output);
        }
    }
    info(message, meta) {
        this.log(LogLevel.INFO, message, meta);
    }
    warn(message, meta) {
        this.log(LogLevel.WARN, message, meta);
    }
    error(message, error, meta) {
        const errorMeta = error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack, ...meta }
            : error !== undefined ? { error, ...meta } : meta;
        this.log(LogLevel.ERROR, message, errorMeta);
    }
    debug(message, meta) {
        this.log(LogLevel.DEBUG, message, meta);
    }
}
exports.Logger = Logger;
