import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  GlobalErrorBoundary
} from '../../ErrorBoundaryWrappers';
import { setupErrorBoundaryMocks, ThrowingComponentWithMessage, WorkingComponent } from './test-utils';

describe('ErrorBoundaryWrappers - GlobalErrorBoundary', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should catch errors and display global error UI', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowingComponentWithMessage message="Global error test" />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(screen.getByText(/the application encountered an unexpected error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('should render children when no error occurs', () => {
    render(
      <GlobalErrorBoundary>
        <WorkingComponent>Global content working</WorkingComponent>
      </GlobalErrorBoundary>
    );

    expect(screen.getByTestId('working')).toBeInTheDocument();
    expect(screen.getByText('Global content working')).toBeInTheDocument();
  });

  it('should handle reload functionality', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowingComponentWithMessage />
      </GlobalErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /reload page/i }));
    expect(window.location.reload).toHaveBeenCalled();
  });
});
