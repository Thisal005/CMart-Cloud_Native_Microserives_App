type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private serviceName: string;
  private isProduction: boolean;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: this.serviceName,
      message,
      ...(meta && { metadata: meta }),
    };

    if (this.isProduction) {
      console.log(JSON.stringify(logEntry));
    } else {
      const color = this.getColor(level);
      const reset = '\x1b[0m';
      console.log(
        `[${logEntry.timestamp}] [${color}${logEntry.level}${reset}] [${this.serviceName}] ${message}`,
        meta ? '\n' + JSON.stringify(meta, null, 2) : ''
      );
    }
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case 'info': return '\x1b[32m'; // green
      case 'warn': return '\x1b[33m'; // yellow
      case 'error': return '\x1b[31m'; // red
      case 'debug': return '\x1b[36m'; // cyan
      default: return '';
    }
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: any) {
    const meta = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any) {
    this.log('debug', message, meta);
  }
}

export const logger = new Logger('auth-service');
export default logger;
