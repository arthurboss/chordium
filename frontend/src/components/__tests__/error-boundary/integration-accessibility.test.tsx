import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  GlobalErrorBoundary, 
  RouteErrorBoundary, 
  QueryErrorBoundary, 
  AsyncErrorBoundary 
} from '../../ErrorBoundaryWrappers';
import { setupErrorBoundaryMocks, ThrowingComponentWithMessage } from './test-utils';

describe('ErrorBoundaryWrappers - Integration & Accessibility', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('Error Boundary Integration', () => {
    it('should work with nested error boundaries', () => {
      const InnerComponent = () => <ThrowingComponentWithMessage message="Inner error" />;

      render(
        <GlobalErrorBoundary>
          <RouteErrorBoundary>
            <InnerComponent />
          </RouteErrorBoundary>
        </GlobalErrorBoundary>
      );

      // Inner boundary should catch the error
      expect(screen.getByText('Page Error')).toBeInTheDocument();
      expect(screen.queryByText('Application Error')).not.toBeInTheDocument();
    });

    it('should propagate errors when inner boundary fails', () => {
      const FailingBoundary = () => {
        throw new Error('Boundary failure');
      };

      render(
        <GlobalErrorBoundary>
          <FailingBoundary />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText('Application Error')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for error messages', () => {
      render(
        <QueryErrorBoundary>
          <ThrowingComponentWithMessage />
        </QueryErrorBoundary>
      );

      const errorHeadings = screen.getAllByText('Failed to load data');
      expect(errorHeadings[0]).toBeInTheDocument();
      
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      expect(refreshButton).toBeInTheDocument();
      expect(refreshButton).toHaveClass('px-4', 'py-2');
    });

    it('should maintain focus management during error states', () => {
      render(
        <AsyncErrorBoundary>
          <ThrowingComponentWithMessage />
        </AsyncErrorBoundary>
      );

      const tryAgainButtons = screen.getAllByRole('button', { name: /try again/i });
      expect(tryAgainButtons[0]).toBeInTheDocument();
      
      // Button should be keyboard accessible
      tryAgainButtons[0].focus();
      expect(tryAgainButtons[0]).toHaveFocus();
    });
  });
});
