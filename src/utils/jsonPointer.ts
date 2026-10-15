/**
 * RFC 6901 JSON Pointer resolution
 * https://www.rfc-editor.org/rfc/rfc6901
 */

// Cache for parsed JSON Pointers to avoid repeated parsing
const pointerCache = new Map<string, string[]>();
const MAX_CACHE_SIZE = 1000;

// LRU Cache for frequently accessed resolved values
interface LRUCacheEntry<V> {
  value: V;
  prev: LRUCacheEntry<V> | null;
  next: LRUCacheEntry<V> | null;
  key: string;
}

class LRUCache<V> {
  private cache = new Map<string, LRUCacheEntry<V>>();
  private head: LRUCacheEntry<V> | null = null;
  private tail: LRUCacheEntry<V> | null = null;
  private maxSize: number;
  private cacheSize: number = 0;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Move to head (most recently used)
    this.moveToHead(entry);
    return entry.value;
  }

  set(key: string, value: V): void {
    const existing = this.cache.get(key);

    if (existing) {
      // Update existing entry
      existing.value = value;
      this.moveToHead(existing);
    } else {
      // Create new entry
      const entry: LRUCacheEntry<V> = {
        value,
        prev: null,
        next: null,
        key,
      };

      this.cache.set(key, entry);
      this.addToHead(entry);
      this.cacheSize++;

      // Evict if over capacity
      if (this.cacheSize > this.maxSize) {
        this.removeTail();
      }
    }
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.removeEntry(entry);
    this.cacheSize--;
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.cacheSize = 0;
  }

  getSize(): number {
    return this.cacheSize;
  }

  private addToHead(entry: LRUCacheEntry<V>): void {
    entry.prev = null;
    entry.next = this.head;

    if (this.head) {
      this.head.prev = entry;
    }
    this.head = entry;

    if (!this.tail) {
      this.tail = entry;
    }
  }

  private removeEntry(entry: LRUCacheEntry<V>): void {
    if (entry.prev) {
      entry.prev.next = entry.next;
    } else {
      this.head = entry.next;
    }

    if (entry.next) {
      entry.next.prev = entry.prev;
    } else {
      this.tail = entry.prev;
    }
  }

  private moveToHead(entry: LRUCacheEntry<V>): void {
    this.removeEntry(entry);
    this.addToHead(entry);
  }

  private removeTail(): void {
    if (!this.tail) return;

    this.cache.delete(this.tail.key);
    this.removeEntry(this.tail);
    this.cacheSize--;
  }
}

// LRU cache for resolved pointer values
const resolvedValueCache = new LRUCache<unknown>(500);

/** Clear the JSON Pointer cache (useful for testing or memory management) */
export function clearPointerCache(): void {
  pointerCache.clear();
  resolvedValueCache.clear();
}

/** Clear only the resolved value cache (preserving parsed pointer cache) */
export function clearResolvedValueCache(): void {
  resolvedValueCache.clear();
}

/** Get cache statistics */
export function getCacheStats(): {
  pointerCacheSize: number;
  resolvedValueCacheSize: number;
  resolvedValueCacheCapacity: number;
} {
  return {
    pointerCacheSize: pointerCache.size,
    resolvedValueCacheSize: resolvedValueCache.getSize(),
    resolvedValueCacheCapacity: 500,
  };
}

/** Configure resolved value cache capacity */
export function setResolvedValueCacheCapacity(capacity: number): void {
  // Create a new cache with the new capacity
  const newCache = new LRUCache<unknown>(capacity);
  
  // Transfer entries from old cache to new cache
  // We iterate from head (most recently used) to preserve LRU order
  let current = (resolvedValueCache as any).head;
  while (current) {
    newCache.set(current.key, current.value);
    current = current.next;
  }
  
  // Replace the old cache
  (resolvedValueCache as any) = newCache;
}

/** Unescape a JSON Pointer token (~1 → /, ~0 → ~) */
function unescapeToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

/** Escape a string for use as a JSON Pointer token */
export function escapeToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

/** Parse a JSON Pointer string into an array of unescaped tokens (with caching) */
export function parsePointer(pointer: string): string[] {
  // Check cache first
  if (pointerCache.has(pointer)) {
    return pointerCache.get(pointer)!;
  }

  let result: string[];
  if (pointer === '' || pointer === '/') {
    result = pointer === '/' ? [''] : [];
  } else {
    if (!pointer.startsWith('/')) {
      throw new Error(`Invalid JSON Pointer: "${pointer}" (must start with /)`);
    }
    result = pointer.slice(1).split('/').map(unescapeToken);
  }

  // Cache the result with LRU eviction
  if (pointerCache.size >= MAX_CACHE_SIZE) {
    // Simple LRU: delete the first entry
    const firstKey = pointerCache.keys().next().value;
    if (firstKey !== undefined) {
      pointerCache.delete(firstKey);
    }
  }
  pointerCache.set(pointer, result);

  return result;
}

/** Resolve a JSON Pointer against a data object. Returns undefined if path doesn't exist. */
export function resolvePointer(data: unknown, pointer: string): unknown {
  if (pointer === '') return data;

  // Create a cache key based on data structure and pointer
  // For simple JSON-serializable data, we can use the pointer as key
  // For complex data, we'd need a more sophisticated approach
  const cacheKey = pointer;

  // Check cache
  const cached = resolvedValueCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const tokens = parsePointer(pointer);
  let current: unknown = data;

  for (const token of tokens) {
    if (current === null || current === undefined) return undefined;

    if (Array.isArray(current)) {
      const index = token === '-' ? current.length : parseInt(token, 10);
      if (isNaN(index) || index < 0 || index >= current.length) return undefined;
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[token];
    } else {
      return undefined;
    }
  }

  // Cache the result
  resolvedValueCache.set(cacheKey, current);
  return current;
}

/** Resolve a JSON Pointer without caching (useful for dynamic data) */
export function resolvePointerUncached(data: unknown, pointer: string): unknown {
  if (pointer === '') return data;

  const tokens = parsePointer(pointer);
  let current: unknown = data;

  for (const token of tokens) {
    if (current === null || current === undefined) return undefined;

    if (Array.isArray(current)) {
      const index = token === '-' ? current.length : parseInt(token, 10);
      if (isNaN(index) || index < 0 || index >= current.length) return undefined;
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[token];
    } else {
      return undefined;
    }
  }

  return current;
}

/** Set a value at a JSON Pointer path, creating intermediate objects as needed. Returns a new root object (immutable). */
export function setPointer(data: unknown, pointer: string, value: unknown): unknown {
  if (pointer === '') return value;

  const tokens = parsePointer(pointer);
  const root = structuredClone(data ?? {});
  let current: Record<string, unknown> = root as Record<string, unknown>;

  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    const next = current[token];
    if (next === null || next === undefined || typeof next !== 'object') {
      // Create intermediate: if next token is numeric, create array; otherwise object
      const nextToken = tokens[i + 1];
      const isIndex = /^\d+$/.test(nextToken) || nextToken === '-';
      current[token] = isIndex ? [] : {};
    }
    current = current[token] as Record<string, unknown>;
  }

  const lastToken = tokens[tokens.length - 1];
  if (Array.isArray(current) && lastToken === '-') {
    current.push(value);
  } else {
    current[lastToken] = value;
  }

  // Invalidate cache entries that might be affected
  // For simplicity, we clear all entries starting with the same prefix
  // A more sophisticated approach would track dependencies
  if (pointer !== '') {
    const prefix = pointer.split('/').slice(0, -1).join('/');
    if (prefix !== '') {
      // Clear all cache entries that might be affected
      // This is a simple approach - for production, you'd want more granular invalidation
      resolvedValueCache.clear();
    }
  }

  return root;
}

/** Append items to an array at a JSON Pointer path. Returns a new root object (immutable). */
export function appendAtPointer(data: unknown, pointer: string, items: unknown[]): unknown {
  const existing = resolvePointer(data, pointer);
  const arr = Array.isArray(existing) ? [...existing, ...items] : items;
  return setPointer(data, pointer, arr);
}
