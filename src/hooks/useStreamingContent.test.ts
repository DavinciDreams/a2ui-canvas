/**
 * Tests for useStreamingContent hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStreamingContent } from './useStreamingContent';
import { createSurfaceManager } from '../core/SurfaceManager';
import type { A2UIComponent } from '../schema/component-types';

describe('useStreamingContent', () => {
  let store: any;

  beforeEach(() => {
    store = createSurfaceManager();
    vi.clearAllMocks();
  });

  it('should return undefined for non-existent surface', () => {
    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId: 'non-existent' })
    );

    expect(result.current.surface).toBeUndefined();
    expect(result.current.components).toEqual([]);
    expect(result.current.dataModel).toEqual({});
  });

  it('should return surface data for existing surface', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    expect(result.current.surface).toBeDefined();
    expect(result.current.surface?.surfaceId).toBe(surfaceId);
    expect(result.current.surface?.title).toBe('Test Surface');
  });

  it('should return components for surface', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    const components: A2UIComponent[] = [
      {
        id: 'comp-1',
        component: 'Document',
        content: 'test',
      },
      {
        id: 'comp-2',
        component: 'Chart',
        chartType: 'bar',
        data: '/chart-data',
      },
    ];

    act(() => {
      store.getState().processMessage({
        updateComponents: {
          surfaceId,
          components,
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    expect(result.current.components).toHaveLength(2);
    expect(result.current.components[0]?.id).toBe('comp-1');
    expect(result.current.components[1]?.id).toBe('comp-2');
  });

  it('should return data model for surface', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    act(() => {
      store.getState().processMessage({
        updateDataModel: {
          surfaceId,
          path: '/test',
          value: 'test-value',
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    expect(result.current.dataModel).toEqual({ test: 'test-value' });
  });

  it('should provide resolveData function', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    act(() => {
      store.getState().processMessage({
        updateDataModel: {
          surfaceId,
          path: '/nested/value',
          value: 'deep-value',
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    const value = result.current.resolveData('/nested/value');
    expect(value).toBe('deep-value');
  });

  it('should return undefined for non-existent data path', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    const value = result.current.resolveData('/non-existent');
    expect(value).toBeUndefined();
  });

  it('should return updated timestamp', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    expect(result.current.updatedAt).toBeGreaterThan(0);

    const initialTimestamp = result.current.updatedAt;

    act(() => {
      store.getState().processMessage({
        updateDataModel: {
          surfaceId,
          path: '/test',
          value: 'updated',
        },
      });
    });

    expect(result.current.updatedAt).toBeGreaterThan(initialTimestamp);
  });

  it('should update when components are removed', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    const components: A2UIComponent[] = [
      {
        id: 'comp-1',
        component: 'Document',
        content: 'test',
      },
      {
        id: 'comp-2',
        component: 'Chart',
        chartType: 'bar',
        data: '/chart-data',
      },
    ];

    act(() => {
      store.getState().processMessage({
        updateComponents: {
          surfaceId,
          components,
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    expect(result.current.components).toHaveLength(2);

    act(() => {
      store.getState().processMessage({
        removeComponents: {
          surfaceId,
          componentIds: ['comp-1'],
        },
      });
    });

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0]?.id).toBe('comp-2');
  });

  it('should update when data is appended', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    act(() => {
      store.getState().processMessage({
        appendData: {
          surfaceId,
          path: '/items',
          items: ['item1', 'item2'],
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    expect(result.current.dataModel).toEqual({ items: ['item1', 'item2'] });

    act(() => {
      store.getState().processMessage({
        appendData: {
          surfaceId,
          path: '/items',
          items: ['item3'],
        },
      });
    });

    expect(result.current.dataModel).toEqual({ items: ['item1', 'item2', 'item3'] });
  });

  it('should update when data model is patched', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    act(() => {
      store.getState().processMessage({
        patchDataModel: {
          surfaceId,
          patch: { test: 'value', nested: { value: 'deep' } },
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    expect(result.current.dataModel).toEqual({
      test: 'value',
      nested: { value: 'deep' },
    });

    act(() => {
      store.getState().processMessage({
        patchDataModel: {
          surfaceId,
          patch: { test: 'updated' },
        },
      });
    });

    expect(result.current.dataModel.test).toBe('updated');
  });

  it('should handle surface destruction', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    expect(result.current.surface).toBeDefined();

    act(() => {
      store.getState().processMessage({
        destroySurface: { surfaceId },
      });
    });

    expect(result.current.surface).toBeUndefined();
  });

  it('should handle empty pointer', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    act(() => {
      store.getState().processMessage({
        updateDataModel: {
          surfaceId,
          path: '',
          value: { root: 'value' },
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    const value = result.current.resolveData('');
    expect(value).toEqual({ root: 'value' });
  });

  it('should handle root pointer', () => {
    const surfaceId = 'test-surface-1';

    act(() => {
      store.getState().processMessage({
        createSurface: {
          surfaceId,
          title: 'Test Surface',
        },
      });
    });

    act(() => {
      store.getState().processMessage({
        updateDataModel: {
          surfaceId,
          path: '/root',
          value: 'value',
        },
      });
    });

    const { result } = renderHook(() =>
      useStreamingContent({ store, surfaceId })
    );

    const value = result.current.resolveData('/root');
    expect(value).toBe('value');
  });
});
