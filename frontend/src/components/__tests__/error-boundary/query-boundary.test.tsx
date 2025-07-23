import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryErrorBoundary } from '../../ErrorBoundaryWrappers';
import { setupErrorBoundaryMocks, ThrowingComponentWithMessage, WorkingComponent } from './test-utils';

// Mock useChordSheet to prevent memory leaks from logging
vi.mock('@/hooks/useChordSheet', () => ({
  useChordSheet: vi.fn(() => ({
    chordSheet: null,
    isLoading: false,
    error: null,
    loadChordSheet: vi.fn(),
    clearChordSheet: vi.fn(),
    getChordSheetUrl: vi.fn(() => ''),
  })),
}));

describe('ErrorBoundaryWrappers - QueryErrorBoundary', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    // Enhanced cleanup for memory management
    vi.clearAllMocks();
    vi.clearAllTimers();
    cleanup();
    
    // Force garbage collection if available
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  });

  it('should catch errors and display data loading error UI', () => {
    render(
      <QueryErrorBoundary>
        <ThrowingComponentWithMessage message="API request failed" />
      </QueryErrorBoundary>
    );

    const errorHeadings = screen.getAllByText('Failed to load data');
    expect(errorHeadings[0]).toBeInTheDocument();
    expect(screen.getByText(/there was a problem loading the content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
  });

  it('should call custom onError handler', () => {
    const onError = vi.fn();

    render(
      <QueryErrorBoundary onError={onError}>
        <ThrowingComponentWithMessage message="Custom error test" />
      </QueryErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should log React Query specific error details', () => {
    const consoleMocks = {
      error: vi.fn(),
      warn: vi.fn(),
    };
    vi.spyOn(console, 'error').mockImplementation(consoleMocks.error);

    render(
      <QueryErrorBoundary>
        <ThrowingComponentWithMessage message="Query error test" />
      </QueryErrorBoundary>
    );

    expect(consoleMocks.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should render children when no error occurs', () => {
    render(
      <QueryErrorBoundary>
        <WorkingComponent>Query content working</WorkingComponent>
      </QueryErrorBoundary>
    );

    expect(screen.getByTestId('working')).toBeInTheDocument();
    expect(screen.getByText('Query content working')).toBeInTheDocument();
  });

  it('should handle refresh functionality', () => {
    render(
      <QueryErrorBoundary>
        <ThrowingComponentWithMessage />
      </QueryErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /refresh page/i }));
    expect(window.location.reload).toHaveBeenCalled();
  });
});
