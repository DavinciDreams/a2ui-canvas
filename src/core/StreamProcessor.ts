/**
 * StreamProcessor — parses JSONL, SSE, WebSocket, or direct JSON into A2UIMessages
 *
 * Handles:
 * - JSONL over SSE (EventSource / ReadableStream)
 * - WebSocket messages
 * - Direct JSON arrays
 * - Single JSON objects
 *
 * Emits validated A2UIMessage objects to a callback.
 */

import type { A2UIMessage } from '../schema/a2ui-envelope';
import { isA2UIMessage } from '../schema/validation';
import { getMessageType } from '../schema/a2ui-envelope';
import { MiddlewareRegistry, type MiddlewareContext } from './middleware';
import { globalMetrics } from './metrics';

export type MessageCallback = (msg: A2UIMessage) => void;
export type ErrorCallback = (error: Error) => void;
export type StateChangeCallback = (state: ConnectionState) => void;

/** Connection state tracking */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
  CLOSED = 'closed',
}

/** Retry strategy options */
export interface RetryStrategy {
  /** Maximum number of retry attempts. Default: 3 */
  maxRetries?: number;
  /** Initial retry delay in ms. Default: 1000 */
  initialRetryDelay?: number;
  /** Maximum retry delay in ms. Default: 30000 */
  maxRetryDelay?: number;
  /** Exponential backoff multiplier. Default: 2 */
  backoffMultiplier?: number;
  /** Jitter factor for randomized delay (0-1). Default: 0.1 */
  jitterFactor?: number;
  /** Enable/disable retry. Default: true */
  enabled?: boolean;
}

export interface StreamProcessorOptions {
  onMessage: MessageCallback;
  onError?: ErrorCallback;
  /** Callback for connection state changes */
  onStateChange?: StateChangeCallback;
  /** Batch window in ms — messages arriving within this window are batched. Default: 0 (no batching) */
  batchWindow?: number;
  /** Retry strategy configuration */
  retryStrategy?: RetryStrategy;
  /** Middleware registry for message processing pipeline */
  middleware?: MiddlewareRegistry;
  /** Enable performance tracking for message processing */
  enableMetrics?: boolean;
}

export class StreamProcessor {
  private onMessage: MessageCallback;
  private onError: ErrorCallback;
  private onStateChange?: StateChangeCallback;
  private batchWindow: number;
  private batchBuffer: A2UIMessage[] = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private abortController: AbortController | null = null;
  private retryStrategy: Required<RetryStrategy>;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private connectionStateCallbacks: Map<string, StateChangeCallback> = new Map();
  private middleware?: MiddlewareRegistry;
  private enableMetrics: boolean;
  private cycleCounter = 0;

  constructor(options: StreamProcessorOptions) {
    this.onMessage = options.onMessage;
    this.onError = options.onError ?? (() => {});
    this.onStateChange = options.onStateChange;
    this.batchWindow = options.batchWindow ?? 0;
    this.middleware = options.middleware;
    this.enableMetrics = options.enableMetrics ?? false;
    this.retryStrategy = {
      maxRetries: options.retryStrategy?.maxRetries ?? 3,
      initialRetryDelay: options.retryStrategy?.initialRetryDelay ?? 1000,
      maxRetryDelay: options.retryStrategy?.maxRetryDelay ?? 30000,
      backoffMultiplier: options.retryStrategy?.backoffMultiplier ?? 2,
      jitterFactor: options.retryStrategy?.jitterFactor ?? 0.1,
      enabled: options.retryStrategy?.enabled ?? true,
    };
  }

  /** Get current connection state */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /** Update connection state and notify callbacks */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.onStateChange?.(state);
      for (const callback of this.connectionStateCallbacks.values()) {
        callback(state);
      }
    }
  }

  /** Register a callback for connection state changes */
  onConnectionStateChange(id: string, callback: StateChangeCallback): () => void {
    this.connectionStateCallbacks.set(id, callback);
    // Immediately call with current state
    callback(this.connectionState);
    return () => {
      this.connectionStateCallbacks.delete(id);
    };
  }

  /** Calculate retry delay with exponential backoff and jitter */
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = Math.min(
      this.retryStrategy.initialRetryDelay * Math.pow(this.retryStrategy.backoffMultiplier, attempt),
      this.retryStrategy.maxRetryDelay
    );

    // Add jitter to prevent thundering herd
    const jitter = baseDelay * this.retryStrategy.jitterFactor * (Math.random() * 2 - 1);
    return Math.max(0, baseDelay + jitter);
  }

  /** Update retry strategy */
  updateRetryStrategy(strategy: Partial<RetryStrategy>): void {
    this.retryStrategy = { ...this.retryStrategy, ...strategy };
  }

  /** Process a single parsed JSON object */
  async processJSON(data: unknown): Promise<void> {
    try {
      if (Array.isArray(data)) {
        for (const item of data) {
          await this.processJSON(item);
        }
        return;
      }

      if (isA2UIMessage(data)) {
        await this.emit(data);
      } else {
        // Enhanced error with more context
        const errorMsg = `Invalid A2UI message: ${JSON.stringify(data).slice(0, 200)}`;
        this.onError(new Error(errorMsg));
      }
    } catch (error) {
      // Catch any unexpected errors during processing
      this.onError(new Error(`Error processing JSON data: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  /** Process a JSONL string (newline-delimited JSON) */
  async processJSONL(text: string): Promise<void> {
    if (!text || typeof text !== 'string') {
      this.onError(new Error('Invalid JSONL input: text must be a non-empty string'));
      return;
    }

    try {
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          await this.processJSON(parsed);
        } catch (e) {
          // Enhanced error with line number and context
          const lineNumber = lines.indexOf(line) + 1;
          this.onError(new Error(`Failed to parse JSONL line ${lineNumber}: ${trimmed.slice(0, 100)}${trimmed.length > 100 ? '...' : ''}`));
        }
      }
    } catch (error) {
      this.onError(new Error(`Error processing JSONL text: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  /** Connect to an SSE endpoint (EventSource-compatible) */
  connectSSE(url: string): () => void {
    let retries = 0;
    let eventSource: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const attemptConnect = () => {
      if (!this.retryStrategy.enabled) {
        this.setConnectionState(ConnectionState.ERROR);
        this.onError(new Error('SSE connection failed and retry is disabled'));
        return;
      }

      if (retries > this.retryStrategy.maxRetries) {
        this.setConnectionState(ConnectionState.ERROR);
        this.onError(new Error(`SSE connection failed after ${retries} attempts`));
        return;
      }

      this.setConnectionState(retries > 0 ? ConnectionState.RECONNECTING : ConnectionState.CONNECTING);

      try {
        eventSource = new EventSource(url);

        eventSource.onopen = () => {
          this.setConnectionState(ConnectionState.CONNECTED);
          retries = 0; // Reset retry count on successful connection
        };

        eventSource.onmessage = async (event) => {
          try {
            if (!event.data) {
              this.onError(new Error('SSE event received with empty data'));
              return;
            }
            const data = JSON.parse(event.data);
            await this.processJSON(data);
          } catch (e) {
            // Enhanced error with more context
            const errorMsg = `Failed to parse SSE data: ${event.data ? (event.data as string).slice(0, 100) : 'empty data'}`;
            this.onError(new Error(errorMsg));
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          retries++;
          const errorMsg = retries > this.retryStrategy.maxRetries
            ? `SSE connection failed after ${retries} attempts`
            : `SSE connection error (attempt ${retries}/${this.retryStrategy.maxRetries})`;
          
          if (retries <= this.retryStrategy.maxRetries && this.retryStrategy.enabled) {
            const delay = this.calculateRetryDelay(retries - 1);
            retryTimer = setTimeout(attemptConnect, delay);
          } else {
            this.setConnectionState(ConnectionState.ERROR);
            this.onError(new Error(errorMsg));
          }
        };
      } catch (error) {
        this.setConnectionState(ConnectionState.ERROR);
        this.onError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    attemptConnect();

    return () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      this.setConnectionState(ConnectionState.CLOSED);
    };
  }

  /** Connect to a fetch-based SSE stream (ReadableStream) */
  async connectStream(url: string, init?: RequestInit): Promise<() => void> {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    let retries = 0;

    const attemptConnect = async (): Promise<void> => {
      if (!this.retryStrategy.enabled) {
        this.setConnectionState(ConnectionState.ERROR);
        this.onError(new Error('SSE stream failed and retry is disabled'));
        return;
      }

      if (retries > this.retryStrategy.maxRetries) {
        this.setConnectionState(ConnectionState.ERROR);
        this.onError(new Error(`SSE stream failed after ${retries} attempts`));
        return;
      }

      this.setConnectionState(retries > 0 ? ConnectionState.RECONNECTING : ConnectionState.CONNECTING);

      try {
        const response = await fetch(url, { ...init, signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        if (!response.body) {
          throw new Error('Response has no body');
        }

        this.setConnectionState(ConnectionState.CONNECTED);
        retries = 0; // Reset retry count on successful connection

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const read = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              this.setConnectionState(ConnectionState.DISCONNECTED);
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              // SSE format: strip "data: " prefix
              const payload = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
              try {
                const parsed = JSON.parse(payload);
                await this.processJSON(parsed);
              } catch {
                // Enhanced error handling for non-JSON data
                if (payload.length > 0 && !payload.startsWith(':')) {
                  // Only log errors for non-comment lines
                  this.onError(new Error(`Failed to parse SSE payload: ${payload.slice(0, 100)}${payload.length > 100 ? '...' : ''}`));
                }
              }
            }
          }
          // Process remaining buffer
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer.trim());
              await this.processJSON(parsed);
            } catch {
              // Enhanced error handling for remaining buffer
              this.onError(new Error(`Failed to parse remaining buffer: ${buffer.trim().slice(0, 100)}${buffer.trim().length > 100 ? '...' : ''}`));
            }
          }
        };

        await read().catch((e) => {
          if (!signal.aborted) {
            this.onError(e instanceof Error ? e : new Error(String(e)));
          }
        });
      } catch (e) {
        if (signal.aborted) return;
        
        retries++;
        const errorMsg = retries > this.retryStrategy.maxRetries
          ? `SSE stream failed after ${retries} attempts`
          : `SSE stream error (attempt ${retries}/${this.retryStrategy.maxRetries})`;
        
        if (retries <= this.retryStrategy.maxRetries && this.retryStrategy.enabled) {
          const delay = this.calculateRetryDelay(retries - 1);
          setTimeout(attemptConnect, delay);
        } else {
          this.setConnectionState(ConnectionState.ERROR);
          this.onError(e instanceof Error ? e : new Error(String(e)));
        }
      }
    };

    attemptConnect().catch((e) => {
      if (!signal.aborted) {
        this.setConnectionState(ConnectionState.ERROR);
        this.onError(e instanceof Error ? e : new Error(String(e)));
      }
    });

    return () => {
      this.abortController?.abort();
      this.setConnectionState(ConnectionState.CLOSED);
    };
  }

  /** Connect to a WebSocket */
  connectWebSocket(url: string): () => void {
    let retries = 0;
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const attemptConnect = () => {
      if (!this.retryStrategy.enabled) {
        this.setConnectionState(ConnectionState.ERROR);
        this.onError(new Error('WebSocket connection failed and retry is disabled'));
        return;
      }

      if (retries > this.retryStrategy.maxRetries) {
        this.setConnectionState(ConnectionState.ERROR);
        this.onError(new Error(`WebSocket connection failed after ${retries} attempts`));
        return;
      }

      this.setConnectionState(retries > 0 ? ConnectionState.RECONNECTING : ConnectionState.CONNECTING);

      try {
        ws = new WebSocket(url);

        ws.onopen = () => {
          this.setConnectionState(ConnectionState.CONNECTED);
          retries = 0; // Reset retry count on successful connection
        };

        ws.onmessage = async (event) => {
          try {
            if (!event.data) {
              this.onError(new Error('WebSocket message received with empty data'));
              return;
            }
            const data = JSON.parse(event.data as string);
            await this.processJSON(data);
          } catch (e) {
            // Enhanced error with message content
            const errorMsg = `Failed to parse WebSocket message: ${event.data ? (event.data as string).slice(0, 100) : 'empty data'}`;
            this.onError(new Error(errorMsg));
          }
        };

        ws.onerror = (error) => {
          // Enhanced error with more context
          const errorMsg = error ? `WebSocket error: ${error}` : 'WebSocket error occurred';
          this.onError(new Error(errorMsg));
        };

        ws.onclose = (event) => {
          if (event.code !== 1000) {
            // Non-normal closure - attempt reconnection
            retries++;
            const errorMsg = retries > this.retryStrategy.maxRetries
              ? `WebSocket closed unexpectedly after ${retries} attempts`
              : `WebSocket closed unexpectedly (attempt ${retries}/${this.retryStrategy.maxRetries})`;
            
            if (retries <= this.retryStrategy.maxRetries && this.retryStrategy.enabled) {
              const delay = this.calculateRetryDelay(retries - 1);
              retryTimer = setTimeout(attemptConnect, delay);
            } else {
              this.setConnectionState(ConnectionState.ERROR);
              this.onError(new Error(errorMsg));
            }
          } else {
            this.setConnectionState(ConnectionState.DISCONNECTED);
          }
        };
      } catch (error) {
        this.setConnectionState(ConnectionState.ERROR);
        this.onError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    attemptConnect();

    return () => {
      if (ws) {
        ws.close(1000); // Normal closure
        ws = null;
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      this.setConnectionState(ConnectionState.CLOSED);
    };
  }

  /** Flush any batched messages */
  async flush(): Promise<void> {
    if (this.batchBuffer.length > 0) {
      const msgs = this.batchBuffer;
      this.batchBuffer = [];
      for (const msg of msgs) {
        this.onMessage(msg);
      }
    }
    if (this.batchTimer !== null) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /** Destroy the processor and clean up */
  async destroy(): Promise<void> {
    try {
      await this.flush();
      this.abortController?.abort();
      this.setConnectionState(ConnectionState.CLOSED);
      this.connectionStateCallbacks.clear();
    } catch (error) {
      // Enhanced error handling for cleanup
      console.error('Error during StreamProcessor destruction:', error);
    }
  }

  private async emit(msg: A2UIMessage): Promise<void> {
    // Create context for middleware
    const context: MiddlewareContext = {
      message: msg,
      cycleId: `cycle-${++this.cycleCounter}`,
      timestamp: Date.now(),
      data: new Map(),
    };

    // Track metrics if enabled
    const endTiming = this.enableMetrics
      ? globalMetrics.startTiming('message_processing', { message_type: getMessageType(msg) })
      : null;

    try {
      // Run middleware before hooks
      if (this.middleware) {
        const result = await this.middleware.executeBeforeHooks(context);
        if (!result.success) {
          this.onError(result.error);
          return;
        }
        // Use potentially transformed message
        msg = result.message ?? msg;
      }

      // Process message (with or without batching)
      if (this.batchWindow <= 0) {
        this.onMessage(msg);
      } else {
        this.batchBuffer.push(msg);
        if (this.batchTimer === null) {
          this.batchTimer = setTimeout(() => {
            this.flush();
          }, this.batchWindow);
        }
      }

      // Run middleware after hooks
      if (this.middleware) {
        await this.middleware.executeAfterHooks(context);
      }
    } catch (error) {
      this.onError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      // End timing
      endTiming?.();
    }
  }
}
