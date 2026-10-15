/**
 * Performance Monitoring System for A2UI Canvas
 *
 * Provides built-in metrics collection for:
 * - Component render times
 * - Message processing times
 * - Cache hit rates
 * - Custom metrics
 */

/**
 * Metric types
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timing';

/**
 * Base metric interface
 */
export interface Metric {
  name: string;
  type: MetricType;
  description?: string;
  labels?: Record<string, string>;
}

/**
 * Counter metric - monotonically increasing value
 */
export interface CounterMetric extends Metric {
  type: 'counter';
  value: number;
}

/**
 * Gauge metric - can go up and down
 */
export interface GaugeMetric extends Metric {
  type: 'gauge';
  value: number;
}

/**
 * Histogram metric - distribution of values
 */
export interface HistogramMetric extends Metric {
  type: 'histogram';
  buckets: number[];
  values: number[];
  sum: number;
  count: number;
}

/**
 * Timing metric - specialized histogram for timing data
 */
export interface TimingMetric extends Metric {
  type: 'timing';
  /** All recorded timings in milliseconds */
  values: number[];
  /** Sum of all timings */
  sum: number;
  /** Number of timings recorded */
  count: number;
  /** Minimum timing */
  min: number;
  /** Maximum timing */
  max: number;
  /** Average timing */
  avg: number;
}

/**
 * Metric query options
 */
export interface MetricQueryOptions {
  /** Filter by metric name pattern */
  namePattern?: string;
  /** Filter by metric type */
  type?: MetricType;
  /** Filter by labels */
  labels?: Record<string, string>;
  /** Limit number of results */
  limit?: number;
}

/**
 * Metrics statistics summary
 */
export interface MetricsSummary {
  /** Total number of metrics */
  totalMetrics: number;
  /** Metrics by type */
  byType: Record<MetricType, number>;
  /** Timestamp of last update */
  lastUpdate: number;
}

/**
 * Performance timing data
 */
export interface PerformanceTiming {
  /** Start timestamp */
  start: number;
  /** End timestamp */
  end: number;
  /** Duration in milliseconds */
  duration: number;
  /** Component or operation name */
  name: string;
  /** Additional labels */
  labels?: Record<string, string>;
}

/**
 * Metrics collector and registry
 */
export class MetricsCollector {
  private metrics: Map<string, CounterMetric | GaugeMetric | HistogramMetric | TimingMetric> =
    new Map();
  private timings: PerformanceTiming[] = [];
  private lastUpdate: number = Date.now();

  /**
   * Create or get a counter metric
   */
  counter(
    name: string,
    options?: { description?: string; labels?: Record<string, string> }
  ): CounterMetric {
    const key = this.getMetricKey(name, options?.labels);
    let metric = this.metrics.get(key) as CounterMetric;

    if (!metric || metric.type !== 'counter') {
      metric = {
        name,
        type: 'counter',
        description: options?.description,
        labels: options?.labels,
        value: 0,
      };
      this.metrics.set(key, metric);
    }

    return metric;
  }

  /**
   * Increment a counter metric
   */
  increment(name: string, amount: number = 1, labels?: Record<string, string>): void {
    const metric = this.counter(name, { labels });
    metric.value += amount;
    this.lastUpdate = Date.now();
  }

  /**
   * Create or get a gauge metric
   */
  gauge(
    name: string,
    options?: { description?: string; labels?: Record<string, string> }
  ): GaugeMetric {
    const key = this.getMetricKey(name, options?.labels);
    let metric = this.metrics.get(key) as GaugeMetric;

    if (!metric || metric.type !== 'gauge') {
      metric = {
        name,
        type: 'gauge',
        description: options?.description,
        labels: options?.labels,
        value: 0,
      };
      this.metrics.set(key, metric);
    }

    return metric;
  }

  /**
   * Set a gauge metric value
   */
  set(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.gauge(name, { labels });
    metric.value = value;
    this.lastUpdate = Date.now();
  }

  /**
   * Increment a gauge metric
   */
  gaugeIncrement(name: string, amount: number = 1, labels?: Record<string, string>): void {
    const metric = this.gauge(name, { labels });
    metric.value += amount;
    this.lastUpdate = Date.now();
  }

  /**
   * Decrement a gauge metric
   */
  gaugeDecrement(name: string, amount: number = 1, labels?: Record<string, string>): void {
    const metric = this.gauge(name, { labels });
    metric.value -= amount;
    this.lastUpdate = Date.now();
  }

  /**
   * Create or get a histogram metric
   */
  histogram(
    name: string,
    buckets: number[] = [1, 5, 10, 25, 50, 100, 250, 500, 1000],
    options?: { description?: string; labels?: Record<string, string> }
  ): HistogramMetric {
    const key = this.getMetricKey(name, options?.labels);
    let metric = this.metrics.get(key) as HistogramMetric;

    if (!metric || metric.type !== 'histogram') {
      metric = {
        name,
        type: 'histogram',
        description: options?.description,
        labels: options?.labels,
        buckets,
        values: new Array(buckets.length + 1).fill(0),
        sum: 0,
        count: 0,
      };
      this.metrics.set(key, metric);
    }

    return metric;
  }

  /**
   * Record a value in a histogram
   */
  observe(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.histogram(name, undefined, { labels });
    metric.sum += value;
    metric.count += 1;

    // Find the appropriate bucket
    let bucketIndex = metric.buckets.length;
    for (let i = 0; i < metric.buckets.length; i++) {
      if (value <= metric.buckets[i]) {
        bucketIndex = i;
        break;
      }
    }
    metric.values[bucketIndex] += 1;
    this.lastUpdate = Date.now();
  }

  /**
   * Create or get a timing metric
   */
  timing(
    name: string,
    options?: { description?: string; labels?: Record<string, string> }
  ): TimingMetric {
    const key = this.getMetricKey(name, options?.labels);
    let metric = this.metrics.get(key) as TimingMetric;

    if (!metric || metric.type !== 'timing') {
      metric = {
        name,
        type: 'timing',
        description: options?.description,
        labels: options?.labels,
        values: [],
        sum: 0,
        count: 0,
        min: Infinity,
        max: 0,
        avg: 0,
      };
      this.metrics.set(key, metric);
    }

    return metric;
  }

  /**
   * Record a timing value
   */
  recordTiming(name: string, durationMs: number, labels?: Record<string, string>): void {
    const metric = this.timing(name, { labels });
    metric.values.push(durationMs);
    metric.sum += durationMs;
    metric.count += 1;
    metric.min = Math.min(metric.min, durationMs);
    metric.max = Math.max(metric.max, durationMs);
    metric.avg = metric.sum / metric.count;
    this.lastUpdate = Date.now();
  }

  /**
   * Start a timing measurement
   * Returns a function that when called, records the elapsed time
   */
  startTiming(name: string, labels?: Record<string, string>): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordTiming(name, duration, labels);
    };
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, renderFn: () => void | Promise<void>): void | Promise<void> {
    const endTiming = this.startTiming('component_render', { component: componentName });
    const result = renderFn();
    endTiming();
    return result;
  }

  /**
   * Track message processing time
   */
  trackMessageProcessing(
    messageType: string,
    processFn: () => void | Promise<void>
  ): void | Promise<void> {
    const endTiming = this.startTiming('message_processing', { message_type: messageType });
    const result = processFn();
    endTiming();
    return result;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): (CounterMetric | GaugeMetric | HistogramMetric | TimingMetric)[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Query metrics with filters
   */
  queryMetrics(
    options?: MetricQueryOptions
  ): (CounterMetric | GaugeMetric | HistogramMetric | TimingMetric)[] {
    let results = this.getAllMetrics();

    if (options?.namePattern) {
      const pattern = new RegExp(options.namePattern);
      results = results.filter((m) => pattern.test(m.name));
    }

    if (options?.type) {
      results = results.filter((m) => m.type === options.type);
    }

    if (options?.labels) {
      results = results.filter((m) => {
        if (!m.labels) return false;
        return Object.entries(options.labels!).every(([key, value]) => m.labels![key] === value);
      });
    }

    if (options?.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Get a specific metric by name
   */
  getMetric(name: string, labels?: Record<string, string>): Metric | undefined {
    const key = this.getMetricKey(name, labels);
    return this.metrics.get(key);
  }

  /**
   * Get metrics summary
   */
  getSummary(): MetricsSummary {
    const metrics = this.getAllMetrics();
    const byType: Record<MetricType, number> = {
      counter: 0,
      gauge: 0,
      histogram: 0,
      timing: 0,
    };

    for (const metric of metrics) {
      byType[metric.type]++;
    }

    return {
      totalMetrics: metrics.length,
      byType,
      lastUpdate: this.lastUpdate,
    };
  }

  /**
   * Get all performance timings
   */
  getTimings(): PerformanceTiming[] {
    return [...this.timings];
  }

  /**
   * Get timings filtered by name
   */
  getTimingsByName(name: string): PerformanceTiming[] {
    return this.timings.filter((t) => t.name === name);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.timings = [];
    this.lastUpdate = Date.now();
  }

  /**
   * Reset specific metric
   */
  resetMetric(name: string, labels?: Record<string, string>): boolean {
    const key = this.getMetricKey(name, labels);
    const metric = this.metrics.get(key);

    if (!metric) return false;

    switch (metric.type) {
      case 'counter':
        metric.value = 0;
        break;
      case 'gauge':
        metric.value = 0;
        break;
      case 'histogram':
        metric.values = new Array(metric.buckets.length + 1).fill(0);
        metric.sum = 0;
        metric.count = 0;
        break;
      case 'timing':
        metric.values = [];
        metric.sum = 0;
        metric.count = 0;
        metric.min = Infinity;
        metric.max = 0;
        metric.avg = 0;
        break;
    }

    this.lastUpdate = Date.now();
    return true;
  }

  /**
   * Export metrics as JSON
   */
  toJSON(): string {
    return JSON.stringify({
      metrics: this.getAllMetrics(),
      timings: this.timings.slice(-100), // Last 100 timings
      summary: this.getSummary(),
    });
  }

  /**
   * Get cache hit rate metrics
   */
  getCacheMetrics(): { hits: number; misses: number; hitRate: number } {
    const hits = (this.getMetric('cache_hits') as CounterMetric)?.value ?? 0;
    const misses = (this.getMetric('cache_misses') as CounterMetric)?.value ?? 0;
    const total = hits + misses;
    const hitRate = total > 0 ? hits / total : 0;

    return { hits, misses, hitRate };
  }

  /**
   * Record a cache hit
   */
  recordCacheHit(): void {
    this.increment('cache_hits');
  }

  /**
   * Record a cache miss
   */
  recordCacheMiss(): void {
    this.increment('cache_misses');
  }

  /**
   * Get render time statistics
   */
  getRenderStats(): { avg: number; min: number; max: number; count: number } {
    const metric = this.getMetric('component_render') as TimingMetric;
    if (!metric || metric.count === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    return {
      avg: metric.avg,
      min: metric.min,
      max: metric.max,
      count: metric.count,
    };
  }

  /**
   * Get message processing statistics
   */
  getMessageProcessingStats(): { avg: number; min: number; max: number; count: number } {
    const metric = this.getMetric('message_processing') as TimingMetric;
    if (!metric || metric.count === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    return {
      avg: metric.avg,
      min: metric.min,
      max: metric.max,
      count: metric.count,
    };
  }

  /**
   * Generate a metric key from name and labels
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }
}

/**
 * Global metrics collector instance
 */
export const globalMetrics = new MetricsCollector();

/**
 * Helper function to track async function execution time
 */
export async function trackAsync<T>(
  name: string,
  fn: () => Promise<T>,
  labels?: Record<string, string>
): Promise<T> {
  const endTiming = globalMetrics.startTiming(name, labels);
  try {
    return await fn();
  } finally {
    endTiming();
  }
}

/**
 * Helper function to track sync function execution time
 */
export function track<T>(
  name: string,
  fn: () => T,
  labels?: Record<string, string>
): T {
  const endTiming = globalMetrics.startTiming(name, labels);
  try {
    return fn();
  } finally {
    endTiming();
  }
}
