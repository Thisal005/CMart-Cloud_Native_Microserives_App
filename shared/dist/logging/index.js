"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
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
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            service: this.serviceName,
            message,
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
