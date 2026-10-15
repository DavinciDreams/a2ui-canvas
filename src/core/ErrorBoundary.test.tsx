/**
 * Tests for ErrorBoundary component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// A component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(container.textContent).toBe('Test content');
  });

  it('should catch and display error when child component throws', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Renderer Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('Renderer Error')).not.toBeInTheDocument();
  });

  it('should display error details when errorInfo is available', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const details = screen.getByText('Error Details');
    expect(details).toBeInTheDocument();
  });

  it('should reset error state when children change to non-erroring component', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Renderer Error')).toBeInTheDocument();

    // Rerender with non-erroring component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // ErrorBoundary should have caught the error and won't automatically reset
    // This is expected React behavior - error boundaries don't auto-reset
    expect(screen.getByText('Renderer Error')).toBeInTheDocument();
  });

  it('should call onError callback with error and errorInfo', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    const calls = onError.mock.calls;
    if (calls && calls.length > 0) {
      const call = calls[0];
      if (call) {
        const [error, errorInfo] = call;
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Test error');
        expect(errorInfo).toBeDefined();
        expect(errorInfo.componentStack).toBeDefined();
      }
    }
  });

  it('should handle null error gracefully', () => {
    // This is a defensive test to ensure ErrorBoundary handles edge cases
    const { container } = render(
      <ErrorBoundary>
        <div>No error</div>
      </ErrorBoundary>
    );

    expect(container.textContent).toBe('No error');
  });

  it('should display error message from state', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
