export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

export interface LogPayload {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  meta?: Record<string, any>;
}

export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Helper to write structured JSON log entries
   */
  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const logEntry: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...(meta && { meta }),
    };

    const output = JSON.stringify(logEntry);

    if (level === LogLevel.ERROR) {
      console.error(output);
    } else if (level === LogLevel.WARN) {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  public info(message: string, meta?: Record<string, any>) {
    this.log(LogLevel.INFO, message, meta);
  }

  public warn(message: string, meta?: Record<string, any>) {
    this.log(LogLevel.WARN, message, meta);
  }

  public error(message: string, error?: Error | any, meta?: Record<string, any>) {
    const errorMeta = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack, ...meta }
      : error !== undefined ? { error, ...meta } : meta;

    this.log(LogLevel.ERROR, message, errorMeta);
  }

  public debug(message: string, meta?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, meta);
  }
}
