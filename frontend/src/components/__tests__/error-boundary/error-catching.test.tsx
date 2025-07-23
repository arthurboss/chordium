import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from '../../ErrorBoundary';
import { setupErrorBoundaryMocks, ThrowingComponent, consoleMocks } from './test-utils';

describe('ErrorBoundary - Error Catching', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should catch errors and display fallback UI', () => {
    render(
      <ErrorBoundary level="component">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should display different titles based on error level', () => {
    // Test global level
    const { unmount: unmountGlobal } = render(
      <ErrorBoundary level="global">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    unmountGlobal();

    // Test page level
    const { unmount: unmountPage } = render(
      <ErrorBoundary level="page">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Page Error')).toBeInTheDocument();
    unmountPage();

    // Test component level
    const { unmount: unmountComponent } = render(
      <ErrorBoundary level="component">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    unmountComponent();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should log error details to console', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(consoleMocks.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );

    expect(consoleMocks.error).toHaveBeenCalledWith(
      'Error Report:',
      expect.objectContaining({
        message: 'Test error message',
        errorId: expect.stringMatching(/^err_\d+_[a-z0-9]+$/),
        timestamp: expect.any(String),
        level: 'component',
      })
    );
  });

  it('should generate unique error IDs', () => {
    // First error
    const { unmount: unmountFirst } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const firstErrorElement = screen.getByText(/Error ID:/);
    const firstErrorId = firstErrorElement.parentElement?.textContent || '';
    unmountFirst();

    // Second error
    const { unmount: unmountSecond } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const secondErrorElement = screen.getByText(/Error ID:/);
    const secondErrorId = secondErrorElement.parentElement?.textContent || '';
    
    // The full error ID strings should be different
    expect(firstErrorId).not.toBe(secondErrorId);
    unmountSecond();
  });
});
