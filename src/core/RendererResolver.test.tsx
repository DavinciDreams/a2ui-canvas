/**
 * Tests for RendererResolver component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RendererResolver } from './RendererResolver';
import { ComponentRegistry } from './ComponentRegistry';
import type { A2UIComponent } from '../schema/component-types';

// Mock renderer component
const MockRenderer: React.FC<{ component: A2UIComponent; data: unknown; theme?: unknown }> = ({
  component,
  data,
  theme,
}) => (
  <div data-testid="mock-renderer">
    <div data-testid="component-type">{component.component}</div>
    <div data-testid="data">{JSON.stringify(data)}</div>
    {theme != null && <div data-testid="theme">{JSON.stringify(theme)}</div>}
  </div>
);

describe('RendererResolver', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = new ComponentRegistry();
    registry.registerCustomSync('mock-test', MockRenderer);
    vi.clearAllMocks();
  });

  it('should show loading fallback initially', () => {
    const mockComponent: A2UIComponent = {
      id: 'test-1',
      component: 'Custom',
      rendererKey: 'mock-test',
    };

    render(
      <RendererResolver component={mockComponent} data={{}} registry={registry} />
    );

    expect(screen.getByText('Loading renderer...')).toBeInTheDocument();
  });

  it('should render custom loading fallback when provided', () => {
    const mockComponent: A2UIComponent = {
      id: 'test-1',
      component: 'Custom',
      rendererKey: 'mock-test',
    };

    render(
      <RendererResolver
        component={mockComponent}
        data={{}}
        registry={registry}
        loadingFallback={<div>Custom loading...</div>}
      />
    );

    expect(screen.getByText('Custom loading...')).toBeInTheDocument();
  });

  it('should resolve and render correct renderer', async () => {
    const mockComponent: A2UIComponent = {
      id: 'test-1',
      component: 'Custom',
      rendererKey: 'mock-test',
    };

    render(
      <RendererResolver component={mockComponent} data={{ test: 'data' }} registry={registry} />
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByTestId('mock-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('component-type')).toHaveTextContent('Custom');
    expect(screen.getByTestId('data')).toHaveTextContent('{"test":"data"}');
  });

  it('should pass theme to renderer', async () => {
    const mockComponent: A2UIComponent = {
      id: 'test-1',
      component: 'Custom',
      rendererKey: 'mock-test',
    };

    const theme = { colors: { primary: 'blue' } };

    render(
      <RendererResolver
        component={mockComponent}
        data={{}}
        registry={registry}
        theme={theme}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByTestId('mock-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('theme')).toHaveTextContent(JSON.stringify(theme));
  });

  it('should handle renderer resolution errors', async () => {
    const mockComponent: A2UIComponent = {
      id: 'test-1',
      component: 'Custom',
      rendererKey: 'non-existent',
    };

    render(
      <RendererResolver component={mockComponent} data={{}}
registry={registry} />
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText(/No renderer found/)).toBeInTheDocument();
  });

  it('should handle missing renderer', async () => {
    const mockComponent: A2UIComponent = {
      id: 'test-1',
      component: 'Custom',
      rendererKey: 'non-existent',
    };

    render(
      <RendererResolver component={mockComponent} data={{}}
registry={registry} />
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText(/No renderer found/)).toBeInTheDocument();
  });

  it('should handle Custom component with rendererKey', async () => {
    const mockComponent: A2UIComponent = {
      id: 'test-1',
      component: 'Custom',
      rendererKey: 'mock-test',
    };

    render(
      <RendererResolver component={mockComponent} data={{}}
registry={registry} />
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByTestId('mock-renderer')).toBeInTheDocument();
  });


  it('should clean up on unmount', () => {
    const mockComponent: A2UIComponent = {
      id: 'test-1',
      component: 'Custom',
      rendererKey: 'mock-test',
    };

    const { unmount } = render(
      <RendererResolver component={mockComponent} data={{}}
registry={registry} />
    );

    expect(screen.getByText('Loading renderer...')).toBeInTheDocument();

    unmount();

    // Should not throw any errors
  });

  it('should handle non-Error objects thrown during resolution', async () => {
    const mockComponent: A2UIComponent = {
      id: 'test-1',
      component: 'Custom',
      rendererKey: 'non-existent',
    };

    render(
      <RendererResolver component={mockComponent} data={{}}
registry={registry} />
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText(/No renderer found/)).toBeInTheDocument();
  });
});
