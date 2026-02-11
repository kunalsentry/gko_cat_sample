import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

/**
 * Structured logger that integrates with Sentry's native logging and metrics
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

    // Use Sentry's native logging with breadcrumbs
    Sentry.addBreadcrumb({
      category: this.context.toLowerCase(),
      message: message,
      level: level === 'error' ? 'error' :
             level === 'warn' ? 'warning' :
             'info',
      data: logData,
    });

    // Track log event as a custom metric (if available)
    try {
      if (typeof Sentry.metrics !== 'undefined' && Sentry.metrics.increment) {
        Sentry.metrics.increment(`log.${level}`, 1, {
          tags: {
            context: this.context,
            level: level,
          },
        });
      }
    } catch (e) {
      // Metrics not available in this context, skip silently
    }

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

    // Track error metric (if available)
    try {
      if (typeof Sentry.metrics !== 'undefined' && Sentry.metrics.increment) {
        Sentry.metrics.increment('errors.total', 1, {
          tags: {
            context: this.context,
            error_type: error instanceof Error ? error.name : 'unknown',
          },
        });
      }
    } catch (e) {
      // Metrics not available in this context, skip silently
    }
  }

  /**
   * Start a performance span for tracking timing with metrics
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

        // Increment operation start counter (if available)
        try {
          if (typeof Sentry.metrics !== 'undefined' && Sentry.metrics.increment) {
            Sentry.metrics.increment(`operation.${name}.started`, 1, {
              tags: { context: this.context },
            });
          }
        } catch (e) {
          // Metrics not available, skip silently
        }

        try {
          const result = await callback();
          const duration = Date.now() - startTime;

          this.info(`Completed ${name}`, { duration: `${duration}ms` });

          // Track successful completion (if available)
          try {
            if (typeof Sentry.metrics !== 'undefined' && Sentry.metrics.increment) {
              Sentry.metrics.increment(`operation.${name}.success`, 1, {
                tags: { context: this.context },
              });
            }

            // Track duration as distribution metric
            if (typeof Sentry.metrics !== 'undefined' && Sentry.metrics.distribution) {
              Sentry.metrics.distribution(`operation.${name}.duration`, duration, {
                unit: 'millisecond',
                tags: { context: this.context },
              });
            }
          } catch (e) {
            // Metrics not available, skip silently
          }

          return result;
        } catch (error) {
          const duration = Date.now() - startTime;

          this.error(`Failed ${name}`, error, { duration: `${duration}ms` });

          // Track failure (if available)
          try {
            if (typeof Sentry.metrics !== 'undefined' && Sentry.metrics.increment) {
              Sentry.metrics.increment(`operation.${name}.failed`, 1, {
                tags: { context: this.context },
              });
            }
          } catch (e) {
            // Metrics not available, skip silently
          }

          throw error;
        }
      }
    );
  }

  /**
   * Track a custom counter metric
   */
  trackCounter(metric: string, value: number = 1, tags?: Record<string, string>) {
    try {
      if (typeof Sentry.metrics !== 'undefined' && Sentry.metrics.increment) {
        Sentry.metrics.increment(`${this.context.toLowerCase()}.${metric}`, value, {
          tags: { context: this.context, ...tags },
        });
      }
    } catch (e) {
      // Metrics not available, skip silently
    }
  }

  /**
   * Track a custom gauge metric
   */
  trackGauge(metric: string, value: number, tags?: Record<string, string>) {
    try {
      if (typeof Sentry.metrics !== 'undefined' && Sentry.metrics.gauge) {
        Sentry.metrics.gauge(`${this.context.toLowerCase()}.${metric}`, value, {
          tags: { context: this.context, ...tags },
        });
      }
    } catch (e) {
      // Metrics not available, skip silently
    }
  }

  /**
   * Track a custom distribution metric
   */
  trackDistribution(metric: string, value: number, unit?: string, tags?: Record<string, string>) {
    try {
      if (typeof Sentry.metrics !== 'undefined' && Sentry.metrics.distribution) {
        Sentry.metrics.distribution(`${this.context.toLowerCase()}.${metric}`, value, {
          unit: unit || 'none',
          tags: { context: this.context, ...tags },
        });
      }
    } catch (e) {
      // Metrics not available, skip silently
    }
  }
}

// Create logger instances for different parts of the app
export const apiLogger = new Logger('API');
export const uiLogger = new Logger('UI');
export const perfLogger = new Logger('Performance');
