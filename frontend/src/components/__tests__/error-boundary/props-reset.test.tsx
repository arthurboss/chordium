import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from '../../ErrorBoundary';
import { setupErrorBoundaryMocks, ThrowingComponent } from './test-utils';

describe('ErrorBoundary - Reset on Props Change', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should reset error when resetKeys change', () => {
    let key = 'initial';
    const TestComponent = () => {
      if (key === 'error') {
        throw new Error('Reset test error');
      }
      return <div data-testid="success">Success: {key}</div>;
    };

    const { rerender } = render(
      <ErrorBoundary resetKeys={[key]}>
        <TestComponent />
      </ErrorBoundary>
    );

    // Initially should render successfully
    expect(screen.getByTestId('success')).toBeInTheDocument();

    // Change key to trigger error
    key = 'error';
    rerender(
      <ErrorBoundary resetKeys={[key]}>
        <TestComponent />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Change key back to reset error
    key = 'reset';
    rerender(
      <ErrorBoundary resetKeys={[key]}>
        <TestComponent />
      </ErrorBoundary>
    );

    // Should show success again
    expect(screen.getByTestId('success')).toBeInTheDocument();
    expect(screen.getByText('Success: reset')).toBeInTheDocument();
  });

  it('should reset error when resetOnPropsChange is true and children change', () => {
    const { rerender } = render(
      <ErrorBoundary resetOnPropsChange={true}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Change children
    rerender(
      <ErrorBoundary resetOnPropsChange={true}>
        <div data-testid="new-child">New child component</div>
      </ErrorBoundary>
    );

    // Should render new child
    expect(screen.getByTestId('new-child')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
