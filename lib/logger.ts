import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

/**
 * Structured logger that integrates with Sentry
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: LogContext) {
    const logData = {
      context: this.context,
      timestamp: new Date().toISOString(),
      ...data,
    };

    // Console logging with structured data
    const consoleMethod = level === 'error' ? console.error :
                         level === 'warn' ? console.warn :
                         console.log;

    consoleMethod(`[${this.context}] ${message}`, data || '');

    // Add breadcrumb to Sentry
    Sentry.addBreadcrumb({
      category: this.context.toLowerCase(),
      message: message,
      level: level === 'error' ? 'error' :
             level === 'warn' ? 'warning' :
             'info',
      data: logData,
    });

    // For errors and warnings, also capture in Sentry
    if (level === 'error' || level === 'warn') {
      Sentry.captureMessage(`[${this.context}] ${message}`, {
        level: level as Sentry.SeverityLevel,
        tags: {
          logger_context: this.context,
        },
        extra: logData,
      });
    }
  }

  debug(message: string, data?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }

  info(message: string, data?: LogContext) {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogContext) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown, data?: LogContext) {
    const errorData = {
      ...data,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };

    this.log('error', message, errorData);

    // Capture exception in Sentry if it's an Error object
    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: {
          logger_context: this.context,
        },
        extra: errorData,
      });
    }
  }

  /**
   * Start a performance span for tracking timing
   */
  startSpan<T>(name: string, operation: string, callback: () => Promise<T>): Promise<T> {
    return Sentry.startSpan(
      {
        name: `${this.context}.${name}`,
        op: operation,
        attributes: {
          logger_context: this.context,
        },
      },
      async () => {
        const startTime = Date.now();
        this.info(`Starting ${name}`);

        try {
          const result = await callback();
          const duration = Date.now() - startTime;
          this.info(`Completed ${name}`, { duration: `${duration}ms` });
          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          this.error(`Failed ${name}`, error, { duration: `${duration}ms` });
          throw error;
        }
      }
    );
  }
}

// Create logger instances for different parts of the app
export const apiLogger = new Logger('API');
export const uiLogger = new Logger('UI');
export const perfLogger = new Logger('Performance');
