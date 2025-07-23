// Mock the toast hook first
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAsyncError } from '../../useAsyncError';
import { setupAsyncErrorMocks, consoleMocks } from './test-utils';
import { toast } from '@/hooks/use-toast';

const mockToast = vi.mocked(toast);

describe('useAsyncError - Basic Functionality', () => {
  beforeEach(() => {
    setupAsyncErrorMocks();
    mockToast.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with no error', () => {
    const { result } = renderHook(() => useAsyncError());

    expect(result.current.error).toBeNull();
    expect(typeof result.current.captureError).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.wrapAsync).toBe('function');
    expect(typeof result.current.wrapEventHandler).toBe('function');
  });

  it('should capture errors with string messages', () => {
    const { result } = renderHook(() => useAsyncError());

    act(() => {
      result.current.captureError('Test error message', 'test-context');
    });

    expect(result.current.error).toEqual({
      message: 'Test error message',
      code: undefined,
      timestamp: expect.any(Number),
      context: 'test-context',
    });
  });

  it('should capture errors with Error objects', () => {
    const { result } = renderHook(() => useAsyncError());
    const testError = new Error('Test error object');

    act(() => {
      result.current.captureError(testError, 'error-context');
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'Test error object',
      code: 'Error',
      timestamp: expect.any(Number),
      context: 'error-context',
      stack: expect.any(String),
    }));
  });

  it('should handle null and undefined errors', () => {
    const { result } = renderHook(() => useAsyncError());

    act(() => {
      // @ts-expect-error Testing null/undefined error handling
      result.current.captureError(null, 'null-context');
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'Unknown error',
      context: 'null-context',
    }));

    act(() => {
      // @ts-expect-error Testing null/undefined error handling
      result.current.captureError(undefined, 'undefined-context');
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'Unknown error',
      context: 'undefined-context',
    }));
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useAsyncError());

    act(() => {
      result.current.captureError('Test error');
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should log errors to console', () => {
    const { result } = renderHook(() => useAsyncError());
    const testError = new Error('Console test error');

    act(() => {
      result.current.captureError(testError, 'console-test');
    });

    expect(consoleMocks.error).toHaveBeenCalledWith(
      'Async Error Captured:',
      expect.objectContaining({
        message: 'Console test error',
        context: 'console-test',
      })
    );
  });
});
