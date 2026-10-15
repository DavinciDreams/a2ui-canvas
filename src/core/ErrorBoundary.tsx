/**
 * Per-renderer error boundary
 */

import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ padding: '16px', color: '#ef4444', fontSize: '14px', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2' }}>
          <strong>Renderer Error</strong>
          <p style={{ margin: '8px 0 0', opacity: 0.8 }}>{this.state.error?.message}</p>
          {this.state.errorInfo && (
            <details style={{ marginTop: '8px', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer' }}>Error Details</summary>
              <pre style={{ marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
