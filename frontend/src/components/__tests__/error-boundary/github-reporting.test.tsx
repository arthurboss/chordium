import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from '../../ErrorBoundary';
import { setupErrorBoundaryMocks, ThrowingComponent } from './test-utils';

describe('ErrorBoundary - GitHub Issue Reporting', () => {
  beforeEach(() => {
    setupErrorBoundaryMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should open GitHub issue when Report this issue button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /report this issue on github/i }));

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://github.com/arthurboss/chordium/issues/new'),
      '_blank',
      'noopener,noreferrer'
    );

    // Check if the URL contains proper query parameters
    const openMock = window.open as ReturnType<typeof vi.fn>;
    const callArgs = openMock.mock.calls[0][0] as string;
    const url = new URL(callArgs);
    expect(url.searchParams.get('title')).toContain('Test error message');
    expect(url.searchParams.get('body')).toContain('Error ID:');
    expect(url.searchParams.get('labels')).toBe('bug');
  });
});
