/**
 * SurfaceManager — A2UI surface lifecycle, data model, and component store
 *
 * Uses zustand for reactive state management. Each surface has:
 * - An id and optional metadata
 * - A data model (arbitrary JSON, addressed via JSON Pointers)
 * - A list of A2UI components that reference the data model
 */

import { createStore, type StoreApi } from 'zustand/vanilla';
import type { A2UIComponent } from '../schema/component-types';
import type { A2UIMessage } from '../schema/a2ui-envelope';
import { getMessageType } from '../schema/a2ui-envelope';
import { resolvePointer, setPointer, appendAtPointer } from '../utils/jsonPointer';

// Configuration for automatic cleanup of inactive surfaces
export interface SurfaceCleanupConfig {
  /** Interval in milliseconds to check for inactive surfaces. Default: 5 minutes */
  cleanupInterval?: number;
  /** Time in milliseconds after which a surface is considered inactive. Default: 30 minutes */
  inactivityThreshold?: number;
  /** Enable/disable automatic cleanup. Default: true */
  enabled?: boolean;
}

const DEFAULT_CLEANUP_CONFIG: Required<SurfaceCleanupConfig> = {
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  inactivityThreshold: 30 * 60 * 1000, // 30 minutes
  enabled: true,
};

// Surface inactivity tracker
class SurfaceInactivityTracker {
  private lastAccessed = new Map<string, number>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private config: Required<SurfaceCleanupConfig>;
  private cleanupCallback: (surfaceIds: string[]) => void;

  constructor(config: SurfaceCleanupConfig, cleanupCallback: (surfaceIds: string[]) => void) {
    this.config = { ...DEFAULT_CLEANUP_CONFIG, ...config };
    this.cleanupCallback = cleanupCallback;
    this.startCleanupTimer();
  }

  /** Record that a surface was accessed */
  recordAccess(surfaceId: string): void {
    this.lastAccessed.set(surfaceId, Date.now());
  }

  /** Get the last access time for a surface */
  getLastAccessed(surfaceId: string): number | undefined {
    return this.lastAccessed.get(surfaceId);
  }

  /** Remove a surface from tracking */
  removeSurface(surfaceId: string): void {
    this.lastAccessed.delete(surfaceId);
  }

  /** Get all surface IDs being tracked */
  getTrackedSurfaceIds(): string[] {
    return Array.from(this.lastAccessed.keys());
  }

  /** Find inactive surfaces based on threshold */
  findInactiveSurfaces(): string[] {
    const now = Date.now();
    const inactive: string[] = [];

    for (const [surfaceId, lastAccessed] of this.lastAccessed.entries()) {
      if (now - lastAccessed > this.config.inactivityThreshold) {
        inactive.push(surfaceId);
      }
    }

    return inactive;
  }

  /** Start the cleanup timer */
  private startCleanupTimer(): void {
    if (!this.config.enabled || this.cleanupTimer !== null) {
      return;
    }

    this.cleanupTimer = setInterval(() => {
      const inactive = this.findInactiveSurfaces();
      if (inactive.length > 0) {
        this.cleanupCallback(inactive);
        // Remove tracked surfaces after cleanup
        for (const surfaceId of inactive) {
          this.removeSurface(surfaceId);
        }
      }
    }, this.config.cleanupInterval);
  }

  /** Stop the cleanup timer */
  stopCleanupTimer(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /** Update configuration */
  updateConfig(config: Partial<SurfaceCleanupConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart timer if enabled state changed
    if (config.enabled !== undefined) {
      this.stopCleanupTimer();
      this.startCleanupTimer();
    }
  }

  /** Clear all tracking data */
  clear(): void {
    this.lastAccessed.clear();
  }

  /** Destroy the tracker */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
  }
}

// Global inactivity tracker instance (will be initialized in createSurfaceManager)
let inactivityTracker: SurfaceInactivityTracker | null = null;

// Memoization cache for frequently accessed data paths
interface MemoizationEntry {
  value: unknown;
  dataModelVersion: number;
  timestamp: number;
}

const MAX_MEMO_CACHE_SIZE = 500;
const MEMO_CACHE_TTL = 5000; // 5 seconds

class MemoizationCache {
  private cache = new Map<string, MemoizationEntry>();
  private dataModelVersions = new Map<string, number>();

  // Get cached value if still valid
  get(surfaceId: string, pointer: string): unknown | undefined {
    const key = `${surfaceId}:${pointer}`;
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    // Check if cache entry is stale
    const currentVersion = this.dataModelVersions.get(surfaceId) ?? 0;
    if (entry.dataModelVersion !== currentVersion) {
      this.cache.delete(key);
      return undefined;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > MEMO_CACHE_TTL) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  // Set cached value
  set(surfaceId: string, pointer: string, value: unknown): void {
    const key = `${surfaceId}:${pointer}`;
    const version = this.dataModelVersions.get(surfaceId) ?? 0;

    // Evict if cache is full
    if (this.cache.size >= MAX_MEMO_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      dataModelVersion: version,
      timestamp: Date.now(),
    });
  }

  // Increment version when data model changes
  incrementVersion(surfaceId: string): void {
    const current = this.dataModelVersions.get(surfaceId) ?? 0;
    this.dataModelVersions.set(surfaceId, current + 1);
  }

  // Clear cache for a surface
  clearSurface(surfaceId: string): void {
    const prefix = `${surfaceId}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.dataModelVersions.clear();
  }
}

// Global memoization cache instance
const memoizationCache = new MemoizationCache();

export interface Surface {
  surfaceId: string;
  catalogId?: string;
  title?: string;
  metadata?: Record<string, unknown>;
  dataModel: Record<string, unknown>;
  components: A2UIComponent[];
  createdAt: number;
  updatedAt: number;
  lastAccessed: number;
}

export interface SurfaceManagerState {
  surfaces: Record<string, Surface>;
  activeSurfaceId: string | null;
}

export interface SurfaceManagerActions {
  /** Process an A2UI message */
  processMessage: (msg: A2UIMessage) => void;
  /** Process multiple messages (batch) */
  processMessages: (msgs: A2UIMessage[]) => void;
  /** Get a surface by id */
  getSurface: (surfaceId: string) => Surface | undefined;
  /** Resolve a JSON Pointer on a surface's data model */
  resolveData: (surfaceId: string, pointer: string) => unknown;
  /** Set the active surface */
  setActiveSurface: (surfaceId: string | null) => void;
  /** Get all surface ids */
  getSurfaceIds: () => string[];
  /** Reset all surfaces */
  reset: () => void;
  /** Configure automatic cleanup of inactive surfaces */
  configureCleanup: (config: Partial<SurfaceCleanupConfig>) => void;
  /** Manually trigger cleanup of inactive surfaces */
  cleanupInactiveSurfaces: () => string[];
  /** Get the last access time for a surface */
  getLastAccessed: (surfaceId: string) => number | undefined;
  /** Manually record surface access */
  recordAccess: (surfaceId: string) => void;
}

export type SurfaceManagerStore = SurfaceManagerState & SurfaceManagerActions;

const INITIAL_STATE: SurfaceManagerState = {
  surfaces: {},
  activeSurfaceId: null,
};

// Optimized deep merge patch with minimal object allocations
function deepMergePatch(target: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  const patchKeys = Object.keys(patch);
  const patchKeysLength = patchKeys.length;

  for (let i = 0; i < patchKeysLength; i++) {
    const key = patchKeys[i];
    const val = patch[key];
    
    if (val === null) {
      delete result[key];
    } else if (typeof val === 'object' && !Array.isArray(val)) {
      const targetVal = result[key];
      if (typeof targetVal === 'object' && !Array.isArray(targetVal)) {
        result[key] = deepMergePatch(targetVal as Record<string, unknown>, val as Record<string, unknown>);
      } else {
        result[key] = val;
      }
    } else {
      result[key] = val;
    }
  }
  return result;
}

// Helper to get the store instance for cleanup callback
let storeInstance: StoreApi<SurfaceManagerStore> | null = null;

function getStoreInstance(): StoreApi<SurfaceManagerStore> | null {
  return storeInstance;
}

export function createSurfaceManager(cleanupConfig?: SurfaceCleanupConfig): StoreApi<SurfaceManagerStore> {
  // Initialize the inactivity tracker
  if (inactivityTracker === null) {
    inactivityTracker = new SurfaceInactivityTracker(cleanupConfig ?? {}, (inactiveIds) => {
      // Cleanup callback - remove inactive surfaces
      const store = getStoreInstance();
      if (store) {
        const state = store.getState();
        const surfacesToRemove: string[] = [];
        
        for (const surfaceId of inactiveIds) {
          if (state.surfaces[surfaceId]) {
            surfacesToRemove.push(surfaceId);
          }
        }
        
        if (surfacesToRemove.length > 0) {
          const newSurfaces: Record<string, Surface> = { ...state.surfaces };
          let newActiveSurfaceId = state.activeSurfaceId;
          
          for (const surfaceId of surfacesToRemove) {
            delete newSurfaces[surfaceId];
            memoizationCache.clearSurface(surfaceId);
            inactivityTracker?.removeSurface(surfaceId);
            if (newActiveSurfaceId === surfaceId) {
              newActiveSurfaceId = null;
            }
          }
          
          store.setState({ surfaces: newSurfaces, activeSurfaceId: newActiveSurfaceId });
        }
      }
    });
  }

  const store = createStore<SurfaceManagerStore>((set, get) => ({
    ...INITIAL_STATE,

    processMessage(msg: A2UIMessage) {
      const type = getMessageType(msg);
      const now = Date.now();

      switch (type) {
        case 'createSurface': {
          const { surfaceId, catalogId, title, metadata } = (msg as { createSurface: Surface }).createSurface;
          set((state) => ({
            surfaces: {
              ...state.surfaces,
              [surfaceId]: {
                surfaceId,
                catalogId,
                title,
                metadata,
                dataModel: {},
                components: [],
                createdAt: now,
                updatedAt: now,
                lastAccessed: now,
              },
            },
            activeSurfaceId: state.activeSurfaceId ?? surfaceId,
          }));
          break;
        }

        case 'destroySurface': {
          const { surfaceId } = (msg as { destroySurface: { surfaceId: string } }).destroySurface;
          set((state) => {
            const { [surfaceId]: _, ...rest } = state.surfaces;
            memoizationCache.clearSurface(surfaceId);
            inactivityTracker?.removeSurface(surfaceId);
            return {
              surfaces: rest,
              activeSurfaceId: state.activeSurfaceId === surfaceId ? null : state.activeSurfaceId,
            };
          });
          break;
        }

        case 'updateDataModel': {
          const { surfaceId, path, value } = (msg as { updateDataModel: { surfaceId: string; path: string; value: unknown } }).updateDataModel;
          set((state) => {
            const surface = state.surfaces[surfaceId];
            if (!surface) return state;
            memoizationCache.incrementVersion(surfaceId);
            return {
              surfaces: {
                ...state.surfaces,
                [surfaceId]: {
                  ...surface,
                  dataModel: setPointer(surface.dataModel, path, value) as Record<string, unknown>,
                  updatedAt: now,
                  lastAccessed: now,
                },
              },
            };
          });
          break;
        }

        case 'updateComponents': {
          const { surfaceId, components } = (msg as { updateComponents: { surfaceId: string; components: A2UIComponent[] } }).updateComponents;
          set((state) => {
            const surface = state.surfaces[surfaceId];
            if (!surface) return state;
            // Merge: update existing by id, add new ones
            const existingById = new Map(surface.components.map((c) => [c.id, c]));
            for (const comp of components) {
              existingById.set(comp.id, comp);
            }
            return {
              surfaces: {
                ...state.surfaces,
                [surfaceId]: {
                  ...surface,
                  components: Array.from(existingById.values()),
                  updatedAt: now,
                  lastAccessed: now,
                },
              },
            };
          });
          break;
        }

        case 'removeComponents': {
          const { surfaceId, componentIds } = (msg as { removeComponents: { surfaceId: string; componentIds: string[] } }).removeComponents;
          set((state) => {
            const surface = state.surfaces[surfaceId];
            if (!surface) return state;
            const removeSet = new Set(componentIds);
            return {
              surfaces: {
                ...state.surfaces,
                [surfaceId]: {
                  ...surface,
                  components: surface.components.filter((c) => !removeSet.has(c.id)),
                  updatedAt: now,
                  lastAccessed: now,
                },
              },
            };
          });
          break;
        }

        case 'appendData': {
          const { surfaceId, path, items } = (msg as { appendData: { surfaceId: string; path: string; items: unknown[] } }).appendData;
          set((state) => {
            const surface = state.surfaces[surfaceId];
            if (!surface) return state;
            memoizationCache.incrementVersion(surfaceId);
            return {
              surfaces: {
                ...state.surfaces,
                [surfaceId]: {
                  ...surface,
                  dataModel: appendAtPointer(surface.dataModel, path, items) as Record<string, unknown>,
                  updatedAt: now,
                  lastAccessed: now,
                },
              },
            };
          });
          break;
        }

        case 'patchDataModel': {
          const { surfaceId, patch } = (msg as { patchDataModel: { surfaceId: string; patch: Record<string, unknown> } }).patchDataModel;
          set((state) => {
            const surface = state.surfaces[surfaceId];
            if (!surface) return state;
            memoizationCache.incrementVersion(surfaceId);
            return {
              surfaces: {
                ...state.surfaces,
                [surfaceId]: {
                  ...surface,
                  dataModel: deepMergePatch(surface.dataModel, patch),
                  updatedAt: now,
                  lastAccessed: now,
                },
              },
            };
          });
          break;
        }
      }
    },

    processMessages(msgs: A2UIMessage[]) {
      for (const msg of msgs) {
        get().processMessage(msg);
      }
    },

    getSurface(surfaceId: string) {
      const surface = get().surfaces[surfaceId];
      if (surface) {
        inactivityTracker?.recordAccess(surfaceId);
      }
      return surface;
    },

    resolveData(surfaceId: string, pointer: string) {
      const surface = get().surfaces[surfaceId];
      if (!surface) return undefined;

      // Record access for inactivity tracking
      inactivityTracker?.recordAccess(surfaceId);

      // Check memoization cache first
      const cached = memoizationCache.get(surfaceId, pointer);
      if (cached !== undefined) {
        return cached;
      }

      // Resolve the pointer and cache the result
      const value = resolvePointer(surface.dataModel, pointer);
      memoizationCache.set(surfaceId, pointer, value);
      return value;
    },

    setActiveSurface(surfaceId: string | null) {
      if (surfaceId) {
        inactivityTracker?.recordAccess(surfaceId);
      }
      set({ activeSurfaceId: surfaceId });
    },

    getSurfaceIds() {
      return Object.keys(get().surfaces);
    },

    reset() {
      memoizationCache.clear();
      inactivityTracker?.clear();
      set(INITIAL_STATE);
    },

    configureCleanup(config: Partial<SurfaceCleanupConfig>) {
      inactivityTracker?.updateConfig(config);
    },

    cleanupInactiveSurfaces() {
      const inactive = inactivityTracker?.findInactiveSurfaces() ?? [];
      if (inactive.length > 0) {
        const state = get();
        const newSurfaces: Record<string, Surface> = { ...state.surfaces };
        let newActiveSurfaceId = state.activeSurfaceId;

        for (const surfaceId of inactive) {
          if (newSurfaces[surfaceId]) {
            delete newSurfaces[surfaceId];
            memoizationCache.clearSurface(surfaceId);
            inactivityTracker?.removeSurface(surfaceId);
            if (newActiveSurfaceId === surfaceId) {
              newActiveSurfaceId = null;
            }
          }
        }

        set({ surfaces: newSurfaces, activeSurfaceId: newActiveSurfaceId });
      }
      return inactive;
    },

    getLastAccessed(surfaceId: string) {
      return inactivityTracker?.getLastAccessed(surfaceId);
    },

    recordAccess(surfaceId: string) {
      inactivityTracker?.recordAccess(surfaceId);
    },
  }));
  
  // Store the instance for cleanup callback
  storeInstance = store;
  
  return store;
}
