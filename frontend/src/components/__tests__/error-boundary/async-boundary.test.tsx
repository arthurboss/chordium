import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AsyncErrorBoundary } from '../../ErrorBoundaryWrappers';
import { setupErrorBoundaryMocks, ThrowingComponentWithMessage, WorkingComponent } from './test-utils';

describe('ErrorBoundaryWrappers - AsyncErrorBoundary', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should catch errors and display component-level error UI', () => {
    render(
      <AsyncErrorBoundary>
        <ThrowingComponentWithMessage message="Async error test" />
      </AsyncErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/this component encountered an error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should reset on resetKeys change', () => {
    let key = 'initial';
    const TestComponent = () => {
      if (key === 'error') {
        throw new Error('Reset test error');
      }
      return <div data-testid="success">Success: {key}</div>;
    };

    const { rerender } = render(
      <AsyncErrorBoundary resetKeys={[key]}>
        <TestComponent />
      </AsyncErrorBoundary>
    );

    // Initially should render successfully
    expect(screen.getByTestId('success')).toBeInTheDocument();

    // Change key to trigger error
    key = 'error';
    rerender(
      <AsyncErrorBoundary resetKeys={[key]}>
        <TestComponent />
      </AsyncErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Change key back to reset error
    key = 'reset';
    rerender(
      <AsyncErrorBoundary resetKeys={[key]}>
        <TestComponent />
      </AsyncErrorBoundary>
    );

    // Should show success again
    expect(screen.getByTestId('success')).toBeInTheDocument();
    expect(screen.getByText('Success: reset')).toBeInTheDocument();
  });

  it('should render children when no error occurs', () => {
    render(
      <AsyncErrorBoundary>
        <WorkingComponent>Async content working</WorkingComponent>
      </AsyncErrorBoundary>
    );

    expect(screen.getByTestId('working')).toBeInTheDocument();
    expect(screen.getByText('Async content working')).toBeInTheDocument();
  });

  it('should handle multiple resetKeys', () => {
    let key1 = 'a';
    let key2 = 'b';
    
    const TestComponent = () => {
      if (key1 === 'error') {
        throw new Error('Multiple reset test');
      }
      return <div data-testid="multi-success">Success: {key1}-{key2}</div>;
    };

    const { rerender } = render(
      <AsyncErrorBoundary resetKeys={[key1, key2]}>
        <TestComponent />
      </AsyncErrorBoundary>
    );

    expect(screen.getByTestId('multi-success')).toBeInTheDocument();

    // Trigger error
    key1 = 'error';
    rerender(
      <AsyncErrorBoundary resetKeys={[key1, key2]}>
        <TestComponent />
      </AsyncErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Reset by changing second key (and first key back to non-error)
    key1 = 'reset';
    key2 = 'c';
    rerender(
      <AsyncErrorBoundary resetKeys={[key1, key2]}>
        <TestComponent />
      </AsyncErrorBoundary>
    );

    expect(screen.getByTestId('multi-success')).toBeInTheDocument();
  });
});
