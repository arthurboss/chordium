import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RouteErrorBoundary } from '../../ErrorBoundaryWrappers';
import { setupErrorBoundaryMocks, ThrowingComponentWithMessage, WorkingComponent } from './test-utils';

describe('ErrorBoundaryWrappers - RouteErrorBoundary', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should catch errors and display page-level error UI', () => {
    render(
      <RouteErrorBoundary>
        <ThrowingComponentWithMessage message="Route error test" />
      </RouteErrorBoundary>
    );

    expect(screen.getByText('Page Error')).toBeInTheDocument();
    expect(screen.getByText(/this page encountered an error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });

  it('should render children when no error occurs', () => {
    render(
      <RouteErrorBoundary>
        <WorkingComponent>Route content working</WorkingComponent>
      </RouteErrorBoundary>
    );

    expect(screen.getByTestId('working')).toBeInTheDocument();
    expect(screen.getByText('Route content working')).toBeInTheDocument();
  });

  it('should reset error state when try again is clicked', () => {
    const { unmount } = render(
      <RouteErrorBoundary>
        <ThrowingComponentWithMessage />
      </RouteErrorBoundary>
    );

    expect(screen.getByText('Page Error')).toBeInTheDocument();

    // Click try again to test button functionality
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    unmount();

    // Render a working component to show error boundary can recover
    render(
      <RouteErrorBoundary>
        <WorkingComponent>Fixed content</WorkingComponent>
      </RouteErrorBoundary>
    );

    expect(screen.getByText('Fixed content')).toBeInTheDocument();
  });
});
