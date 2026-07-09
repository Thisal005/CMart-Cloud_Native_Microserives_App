"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    serviceName;
    isProduction;
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.isProduction = process.env.NODE_ENV === 'production';
    }
    log(level, message, meta) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            service: this.serviceName,
            message,
            ...(meta && { metadata: meta }),
        };
        if (this.isProduction) {
            console.log(JSON.stringify(logEntry));
        }
        else {
            const color = this.getColor(level);
            const reset = '\x1b[0m';
            console.log(`[${logEntry.timestamp}] [${color}${logEntry.level}${reset}] [${this.serviceName}] ${message}`, meta ? '\n' + JSON.stringify(meta, null, 2) : '');
        }
    }
    getColor(level) {
        switch (level) {
            case 'info': return '\x1b[32m'; // green
            case 'warn': return '\x1b[33m'; // yellow
            case 'error': return '\x1b[31m'; // red
            case 'debug': return '\x1b[36m'; // cyan
            default: return '';
        }
    }
    info(message, meta) {
        this.log('info', message, meta);
    }
    warn(message, meta) {
        this.log('warn', message, meta);
    }
    error(message, error) {
        const meta = error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error;
        this.log('error', message, meta);
    }
    debug(message, meta) {
        this.log('debug', message, meta);
    }
}
exports.logger = new Logger('auth-service');
exports.default = exports.logger;
