import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from '../../ErrorBoundary';
import { setupErrorBoundaryMocks, ThrowingComponent } from './test-utils';

describe('ErrorBoundary - Error Level Variants', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should not show Try Again button for global errors', () => {
    render(
      <ErrorBoundary level="global">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });

  it('should show appropriate descriptions for different error levels', () => {
    const { rerender } = render(
      <ErrorBoundary level="global">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/application encountered an unexpected error/i)).toBeInTheDocument();

    rerender(
      <ErrorBoundary level="page">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/this page encountered an error/i)).toBeInTheDocument();

    rerender(
      <ErrorBoundary level="component">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/this component encountered an error/i)).toBeInTheDocument();
  });
});
