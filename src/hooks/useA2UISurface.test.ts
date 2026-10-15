/**
 * Tests for useA2UISurface hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useA2UISurface } from './useA2UISurface';
import { ComponentRegistry } from '../core/ComponentRegistry';
import type { A2UIMessage } from '../schema/a2ui-envelope';

describe('useA2UISurface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty surfaces', () => {
    const { result } = renderHook(() => useA2UISurface());

    expect(result.current.surfaces).toEqual({});
    expect(result.current.activeSurface).toBeUndefined();
  });

  it('should process direct messages', () => {
    const messages: A2UIMessage[] = [
      {
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Test Surface',
        },
      },
    ];

    const { result } = renderHook(() => useA2UISurface({ messages }));

    expect(result.current.surfaces['test-surface-1']).toBeDefined();
    expect(result.current.surfaces['test-surface-1']?.title).toBe('Test Surface');
  });

  it('should set first surface as active', () => {
    const messages: A2UIMessage[] = [
      {
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Test Surface',
        },
      },
    ];

    const { result } = renderHook(() => useA2UISurface({ messages }));

    expect(result.current.activeSurface).toBeDefined();
    expect(result.current.activeSurface?.surfaceId).toBe('test-surface-1');
  });

  it('should allow manual message processing', () => {
    const { result } = renderHook(() => useA2UISurface());

    const message: A2UIMessage = {
      createSurface: {
        surfaceId: 'test-surface-1',
        title: 'Test Surface',
      },
    };

    act(() => {
      result.current.processMessage(message);
    });

    expect(result.current.surfaces['test-surface-1']).toBeDefined();
  });

  it('should allow manual batch message processing', () => {
    const { result } = renderHook(() => useA2UISurface());

    const messages: A2UIMessage[] = [
      {
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Surface 1',
        },
      },
      {
        createSurface: {
          surfaceId: 'test-surface-2',
          title: 'Surface 2',
        },
      },
    ];

    act(() => {
      result.current.processMessages(messages);
    });

    expect(result.current.surfaces['test-surface-1']).toBeDefined();
    expect(result.current.surfaces['test-surface-2']).toBeDefined();
  });

  it('should allow setting active surface', () => {
    const messages: A2UIMessage[] = [
      {
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Surface 1',
        },
      },
      {
        createSurface: {
          surfaceId: 'test-surface-2',
          title: 'Surface 2',
        },
      },
    ];

    const { result } = renderHook(() => useA2UISurface({ messages }));

    act(() => {
      result.current.setActiveSurface('test-surface-2');
    });

    expect(result.current.activeSurface?.surfaceId).toBe('test-surface-2');
  });

  it('should allow resolving data from surface', () => {
    const messages: A2UIMessage[] = [
      {
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Test Surface',
        },
      },
      {
        updateDataModel: {
          surfaceId: 'test-surface-1',
          path: '/test',
          value: 'test-value',
        },
      },
    ];

    const { result } = renderHook(() => useA2UISurface({ messages }));

    const value = result.current.resolveData('test-surface-1', '/test');
    expect(value).toBe('test-value');
  });

  it('should return undefined for non-existent surface', () => {
    const { result } = renderHook(() => useA2UISurface());

    const value = result.current.resolveData('non-existent', '/test');
    expect(value).toBeUndefined();
  });

  it('should get components for a surface', () => {
    const messages: A2UIMessage[] = [
      {
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Test Surface',
        },
      },
      {
        updateComponents: {
          surfaceId: 'test-surface-1',
          components: [
            {
              id: 'comp-1',
              component: 'Document',
              content: 'test',
            },
          ],
        },
      },
    ];

    const { result } = renderHook(() => useA2UISurface({ messages }));

    const components = result.current.getComponents('test-surface-1');
    expect(components).toHaveLength(1);
    expect(components[0]?.id).toBe('comp-1');
  });

  it('should return empty array for non-existent surface components', () => {
    const { result } = renderHook(() => useA2UISurface());

    const components = result.current.getComponents('non-existent');
    expect(components).toEqual([]);
  });

  it('should handle destroy surface message', () => {
    const messages: A2UIMessage[] = [
      {
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Test Surface',
        },
      },
    ];

    const { result } = renderHook(() => useA2UISurface({ messages }));

    expect(result.current.surfaces['test-surface-1']).toBeDefined();

    act(() => {
      result.current.processMessage({
        destroySurface: { surfaceId: 'test-surface-1' },
      });
    });

    expect(result.current.surfaces['test-surface-1']).toBeUndefined();
  });

  it('should handle updating data model', () => {
    const { result } = renderHook(() => useA2UISurface());

    act(() => {
      result.current.processMessage({
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Test Surface',
        },
      });
    });

    act(() => {
      result.current.processMessage({
        updateDataModel: {
          surfaceId: 'test-surface-1',
          path: '/test',
          value: 'updated-value',
        },
      });
    });

    const value = result.current.resolveData('test-surface-1', '/test');
    expect(value).toBe('updated-value');
  });

  it('should provide the underlying store', () => {
    const { result } = renderHook(() => useA2UISurface());

    expect(result.current.store).toBeDefined();
    expect(typeof result.current.store.getState).toBe('function');
  });

  it('should use custom batch window', () => {
    const { result } = renderHook(() => useA2UISurface({ batchWindow: 100 }));

    expect(result.current.surfaces).toEqual({});
    // The batch window is used internally by StreamProcessor
    // This test mainly ensures the option is accepted
  });


  it('should handle null active surface', () => {
    const messages: A2UIMessage[] = [
      {
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Test Surface',
        },
      },
    ];

    const { result } = renderHook(() => useA2UISurface({ messages }));

    expect(result.current.activeSurface).toBeDefined();

    act(() => {
      result.current.setActiveSurface(null);
    });

    expect(result.current.activeSurface).toBeUndefined();
  });

  it('should handle error callback', () => {
    const onError = vi.fn();

    renderHook(() => useA2UISurface({ onError }));

    // The error callback is passed to StreamProcessor
    // This test mainly ensures the option is accepted
    expect(onError).not.toHaveBeenCalled();
  });

  it('should handle appending data', () => {
    const { result } = renderHook(() => useA2UISurface());

    act(() => {
      result.current.processMessage({
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Test Surface',
        },
      });
    });

    act(() => {
      result.current.processMessage({
        appendData: {
          surfaceId: 'test-surface-1',
          path: '/items',
          items: ['item1', 'item2'],
        },
      });
    });

    const value = result.current.resolveData('test-surface-1', '/items');
    expect(value).toEqual(['item1', 'item2']);
  });

  it('should handle patching data model', () => {
    const { result } = renderHook(() => useA2UISurface());

    act(() => {
      result.current.processMessage({
        createSurface: {
          surfaceId: 'test-surface-1',
          title: 'Test Surface',
        },
      });
    });

    act(() => {
      result.current.processMessage({
        patchDataModel: {
          surfaceId: 'test-surface-1',
          patch: { test: 'value' },
        },
      });
    });

    const value = result.current.resolveData('test-surface-1', '/test');
    expect(value).toBe('value');
  });
});
