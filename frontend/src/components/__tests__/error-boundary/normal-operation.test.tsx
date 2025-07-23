import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from '../../ErrorBoundary';
import { setupErrorBoundaryMocks } from './test-utils';

describe('ErrorBoundary - Normal Operation', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="normal-child">Normal operation</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('normal-child')).toBeInTheDocument();
    expect(screen.getByText('Normal operation')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should not interfere with normal component lifecycle', () => {
    const onMount = vi.fn();
    
    const TestComponent = () => {
      onMount();
      return <div data-testid="mounted">Mounted</div>;
    };

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(onMount).toHaveBeenCalled();
    expect(screen.getByTestId('mounted')).toBeInTheDocument();
  });
});
