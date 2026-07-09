export declare enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG"
}
export interface LogPayload {
    timestamp: string;
    level: LogLevel;
    service: string;
    message: string;
    meta?: Record<string, any>;
}
export declare class Logger {
    private serviceName;
    constructor(serviceName: string);
    /**
     * Helper to write structured JSON log entries
     */
    private log;
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, error?: Error | any, meta?: Record<string, any>): void;
    debug(message: string, meta?: Record<string, any>): void;
}
