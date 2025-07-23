import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAsyncError } from '../../useAsyncError';
import { setupAsyncErrorMocks } from './test-utils';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('useAsyncError - Error Capturing Scenarios', () => {
  beforeEach(() => {
    setupAsyncErrorMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should capture and maintain most recent error', () => {
    const { result } = renderHook(() => useAsyncError());

    act(() => {
      result.current.captureError('First error', 'context-1');
    });

    const firstError = result.current.error;
    expect(firstError?.message).toBe('First error');

    act(() => {
      result.current.captureError('Second error', 'context-2');
    });

    expect(result.current.error?.message).toBe('Second error');
    expect(result.current.error?.context).toBe('context-2');
    // Verify we captured the most recent error
    expect(result.current.error?.timestamp).toBeGreaterThan(0);
  });

  it('should handle non-standard error objects', () => {
    const { result } = renderHook(() => useAsyncError());
    const weirdError = {
      name: 'WeirdError',
      message: 'This is a weird error',
      customProperty: 'custom value',
    };

    act(() => {
      result.current.captureError(weirdError as Error, 'weird-context');
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'This is a weird error',
      context: 'weird-context',
      timestamp: expect.any(Number),
    }));
  });

  it('should handle errors with stack traces', () => {
    const { result } = renderHook(() => useAsyncError());
    const errorWithStack = new Error('Error with stack');
    errorWithStack.stack = 'Error: Error with stack\n    at test.js:1:1';

    act(() => {
      result.current.captureError(errorWithStack, 'stack-context');
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'Error with stack',
      context: 'stack-context',
      stack: 'Error: Error with stack\n    at test.js:1:1',
    }));
  });

  it('should preserve error context when provided with error object', () => {
    const { result } = renderHook(() => useAsyncError());
    const error = new Error('Base error');

    act(() => {
      result.current.captureError(error, 'explicit-context');
    });

    expect(result.current.error?.context).toBe('explicit-context');
  });

  it('should handle empty string errors', () => {
    const { result } = renderHook(() => useAsyncError());

    act(() => {
      result.current.captureError('', 'empty-string-context');
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: '',
      context: 'empty-string-context',
    }));
  });

  it('should handle errors with numeric values', () => {
    const { result } = renderHook(() => useAsyncError());

    act(() => {
      // Test how the hook handles non-standard error types
      result.current.captureError(404 as unknown as string, 'numeric-context');
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'Unknown error',
      context: 'numeric-context',
    }));
  });

  it('should handle function errors', () => {
    const { result } = renderHook(() => useAsyncError());
    const functionError = () => 'error function';

    act(() => {
      // Test how the hook handles function error types
      result.current.captureError(functionError as unknown as string, 'function-context');
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'Unknown error',
      context: 'function-context',
    }));
  });
});
