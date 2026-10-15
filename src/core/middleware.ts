/**
 * Middleware System for A2UI Canvas
 *
 * Provides a message processing pipeline with before/after hooks.
 * Middleware can be used for logging, validation, transformation, caching, etc.
 */

import type { A2UIMessage } from '../schema/a2ui-envelope';
import { getMessageType } from '../schema/a2ui-envelope';

/**
 * Context passed to middleware functions
 */
export interface MiddlewareContext {
  /** The message being processed */
  message: A2UIMessage;
  /** Unique ID for this processing cycle */
  cycleId: string;
  /** Timestamp when processing started */
  timestamp: number;
  /** Custom data that can be shared between middleware */
  data: Map<string, unknown>;
}

/**
 * Result of middleware processing
 */
export type MiddlewareResult =
  | { success: true; message?: A2UIMessage }
  | { success: false; error: Error };

/**
 * Middleware function interface
 *
 * Middleware can:
 * - Transform the message (return modified message)
 * - Reject the message (return error)
 * - Add context data for downstream middleware
 */
export type MiddlewareFunction = (
  context: Readonly<MiddlewareContext>
) => MiddlewareResult | Promise<MiddlewareResult>;

/**
 * Middleware definition
 */
export interface Middleware {
  /** Unique identifier for this middleware */
  id: string;
  /** Display name for debugging */
  name: string;
  /** Whether this middleware should run asynchronously */
  async?: boolean;
  /** The middleware function */
  fn: MiddlewareFunction;
  /** Priority - lower numbers run first (default: 100) */
  priority?: number;
}

/**
 * Middleware registry and executor
 */
export class MiddlewareRegistry {
  private middleware: Map<string, Middleware> = new Map();
  private sortedMiddleware: Middleware[] = [];
  private needsSort = false;

  /**
   * Register a new middleware
   */
  register(middleware: Middleware): () => void {
    this.middleware.set(middleware.id, middleware);
    this.needsSort = true;
    return () => this.unregister(middleware.id);
  }

  /**
   * Unregister a middleware by ID
   */
  unregister(id: string): boolean {
    this.needsSort = this.middleware.delete(id) || this.needsSort;
    return this.needsSort;
  }

  /**
   * Get a middleware by ID
   */
  get(id: string): Middleware | undefined {
    return this.middleware.get(id);
  }

  /**
   * Get all registered middleware (sorted by priority)
   */
  getAll(): Middleware[] {
    if (this.needsSort) {
      this.sortedMiddleware = Array.from(this.middleware.values()).sort(
        (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
      );
      this.needsSort = false;
    }
    return this.sortedMiddleware;
  }

  /**
   * Clear all middleware
   */
  clear(): void {
    this.middleware.clear();
    this.sortedMiddleware = [];
    this.needsSort = false;
  }

  /**
   * Execute middleware pipeline for a message
   */
  async executeBeforeHooks(context: MiddlewareContext): Promise<MiddlewareResult> {
    const middleware = this.getAll();

    for (const mw of middleware) {
      try {
        let result: MiddlewareResult;
        if (mw.async) {
          const awaited = await mw.fn(context);
          result = awaited;
        } else {
          result = mw.fn(context) as MiddlewareResult;
        }

        if (!result.success) {
          return result;
        }

        // Update context if message was transformed
        if (result.success && result.message && result.message !== context.message) {
          (context as MiddlewareContext).message = result.message;
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    }

    return { success: true };
  }

  /**
   * Execute after hooks (message was successfully processed)
   */
  async executeAfterHooks(context: MiddlewareContext): Promise<void> {
    const middleware = this.getAll();

    for (const mw of middleware) {
      try {
        let result: MiddlewareResult;
        if (mw.async) {
          const awaited = await mw.fn(context);
          result = awaited;
        } else {
          result = mw.fn(context) as MiddlewareResult;
        }
        // After hooks don't affect the message, just log errors
        if (!result.success) {
          console.error(`[Middleware ${mw.name}] After hook error:`, result.error);
        }
      } catch (error) {
        console.error(`[Middleware ${mw.name}] After hook error:`, error);
      }
    }
  }
}

/**
 * Create a logging middleware
 */
export function createLoggingMiddleware(options: {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  includeMessage?: boolean;
}): Middleware {
  return {
    id: 'logging',
    name: 'Logging',
    priority: 50,
    fn: (context) => {
      const { logLevel = 'info', includeMessage = false } = options;

      const logData: Record<string, unknown> = {
        cycleId: context.cycleId,
        messageType: getMessageType(context.message),
        timestamp: new Date(context.timestamp).toISOString(),
      };

      if (includeMessage) {
        logData.message = context.message;
      }

      switch (logLevel) {
        case 'debug':
          console.debug('[A2UI Middleware]', logData);
          break;
        case 'info':
          console.info('[A2UI Middleware]', logData);
          break;
        case 'warn':
          console.warn('[A2UI Middleware]', logData);
          break;
        case 'error':
          console.error('[A2UI Middleware]', logData);
          break;
      }

      return { success: true };
    },
  };
}

/**
 * Create a validation middleware
 */
export function createValidationMiddleware(options: {
  requiredFields?: string[];
  customValidator?: (message: A2UIMessage) => boolean | string;
}): Middleware {
  return {
    id: 'validation',
    name: 'Validation',
    priority: 10,
    fn: (context) => {
      const { requiredFields = [], customValidator } = options;
      const { message } = context;

      // Check required fields
      for (const field of requiredFields) {
        if (!(field in message) || message[field as keyof A2UIMessage] === undefined) {
          return {
            success: false,
            error: new Error(`Validation failed: missing required field '${field}'`),
          };
        }
      }

      // Run custom validator
      if (customValidator) {
        const result = customValidator(message);
        if (result !== true) {
          return {
            success: false,
            error: new Error(`Validation failed: ${typeof result === 'string' ? result : 'custom validation'}`),
          };
        }
      }

      return { success: true };
    },
  };
}

/**
 * Create a transformation middleware
 */
export function createTransformationMiddleware(options: {
  transformer: (message: A2UIMessage) => A2UIMessage | Promise<A2UIMessage>;
}): Middleware {
  return {
    id: 'transformation',
    name: 'Transformation',
    priority: 100,
    async: true,
    fn: async (context) => {
      try {
        const transformed = await options.transformer(context.message);
        return { success: true, message: transformed };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    },
  };
}

/**
 * Create a deduplication middleware
 */
export function createDeduplicationMiddleware(options: {
  /** Time window in ms for duplicate detection (default: 5000) */
  timeWindow?: number;
  /** Maximum cache size (default: 1000) */
  maxCacheSize?: number;
}): Middleware {
  const { timeWindow = 5000, maxCacheSize = 1000 } = options;
  const seenMessages = new Map<string, number>();

  return {
    id: 'deduplication',
    name: 'Deduplication',
    priority: 5,
    fn: (context) => {
      const key = `${getMessageType(context.message)}-${JSON.stringify(context.message).slice(0, 100)}`;
      const now = Date.now();

      // Clean old entries
      for (const [id, timestamp] of seenMessages) {
        if (now - timestamp > timeWindow) {
          seenMessages.delete(id);
        }
      }

      // Check cache size
      if (seenMessages.size >= maxCacheSize) {
        const oldestKey = Array.from(seenMessages.entries()).sort((a, b) => a[1] - b[1])[0][0];
        seenMessages.delete(oldestKey);
      }

      // Check for duplicate
      const lastSeen = seenMessages.get(key);
      if (lastSeen && now - lastSeen < timeWindow) {
        return {
          success: false,
          error: new Error(`Duplicate message detected: ${key}`),
        };
      }

      seenMessages.set(key, now);
      return { success: true };
    },
  };
}

/**
 * Create a rate limiting middleware
 */
export function createRateLimitMiddleware(options: {
  /** Maximum messages per window */
  maxMessages: number;
  /** Time window in ms */
  windowMs: number;
}): Middleware {
  const { maxMessages, windowMs } = options;
  const messageTimestamps: number[] = [];

  return {
    id: 'rate-limit',
    name: 'Rate Limit',
    priority: 1,
    fn: (context) => {
      const now = Date.now();

      // Remove timestamps outside the window
      const windowStart = now - windowMs;
      while (messageTimestamps.length > 0 && messageTimestamps[0] < windowStart) {
        messageTimestamps.shift();
      }

      // Check rate limit
      if (messageTimestamps.length >= maxMessages) {
        return {
          success: false,
          error: new Error(`Rate limit exceeded: ${maxMessages} messages per ${windowMs}ms`),
        };
      }

      messageTimestamps.push(now);
      return { success: true };
    },
  };
}
