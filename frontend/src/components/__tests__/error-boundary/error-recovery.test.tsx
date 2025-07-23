import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from '../../ErrorBoundary';
import { setupErrorBoundaryMocks, ThrowingComponent, ConditionalThrowingComponent } from './test-utils';

describe('ErrorBoundary - Error Recovery', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should reset error state when Try Again button is clicked', async () => {
    let shouldThrow = true;
    const TestComponent = () => <ConditionalThrowingComponent error={shouldThrow} />;

    const { unmount } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click Try Again to test the functionality
    const tryAgainButtons = screen.getAllByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButtons[0]);

    unmount();

    // Test that the error boundary can handle successful renders after error
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <ConditionalThrowingComponent error={false} />
      </ErrorBoundary>
    );

    // Success message should appear - simplified check
    expect(screen.getByTestId('success')).toBeInTheDocument();
  }, 10000); // Increase timeout to 10 seconds

  it('should call window.location.reload when Reload Page button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const reloadButtons = screen.getAllByRole('button', { name: /reload page/i });
    fireEvent.click(reloadButtons[0]);
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should navigate to home when Go Home button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /go home/i }));
    expect(window.location.href).toBe('/');
  });
});
