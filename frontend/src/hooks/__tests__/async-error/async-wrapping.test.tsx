// Mock the toast hook first
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAsyncError } from '../../useAsyncError';
import { setupAsyncErrorMocks } from './test-utils';
import { toast } from '@/hooks/use-toast';

const mockToast = vi.mocked(toast);

describe('useAsyncError - Async Function Wrapping', () => {
  beforeEach(() => {
    setupAsyncErrorMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should wrap async functions that succeed', async () => {
    const { result } = renderHook(() => useAsyncError());
    const successfulAsyncFn = vi.fn().mockResolvedValue('success result');
    
    const wrappedFn = result.current.wrapAsync(successfulAsyncFn, 'async-success');
    
    await act(async () => {
      const response = await wrappedFn('arg1', 'arg2');
      expect(response).toBe('success result');
    });

    expect(successfulAsyncFn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(result.current.error).toBeNull();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should wrap async functions that throw errors', async () => {
    const { result } = renderHook(() => useAsyncError());
    const errorAsyncFn = vi.fn().mockRejectedValue(new Error('Async error'));
    
    const wrappedFn = result.current.wrapAsync(errorAsyncFn, 'async-error');
    
    await act(async () => {
      const response = await wrappedFn();
      expect(response).toBeUndefined();
    });

    expect(errorAsyncFn).toHaveBeenCalled();
    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'Async error',
      context: 'async-error',
    }));
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Something went wrong',
      description: 'Async error',
      variant: 'destructive',
      duration: 5000,
    });
  });

  it('should wrap async functions with string error rejection', async () => {
    const { result } = renderHook(() => useAsyncError());
    const stringErrorAsyncFn = vi.fn().mockRejectedValue('String error message');
    
    const wrappedFn = result.current.wrapAsync(stringErrorAsyncFn, 'string-async-error');
    
    await act(async () => {
      await wrappedFn();
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'String error message',
      context: 'string-async-error',
    }));
  });

  it('should wrap async functions that return promises with different contexts', async () => {
    const { result } = renderHook(() => useAsyncError());
    
    const apiCall = vi.fn().mockRejectedValue(new Error('API failed'));
    const dbCall = vi.fn().mockRejectedValue(new Error('DB failed'));
    
    const wrappedApiCall = result.current.wrapAsync(apiCall, 'api-context');
    const wrappedDbCall = result.current.wrapAsync(dbCall, 'db-context');
    
    await act(async () => {
      await wrappedApiCall();
    });

    expect(result.current.error?.context).toBe('api-context');
    expect(result.current.error?.message).toBe('API failed');

    await act(async () => {
      await wrappedDbCall();
    });

    expect(result.current.error?.context).toBe('db-context');
    expect(result.current.error?.message).toBe('DB failed');
  });

  it('should preserve function arguments and return values', async () => {
    const { result } = renderHook(() => useAsyncError());
    const asyncCalculator = vi.fn().mockImplementation(async (a: number, b: number) => {
      return a + b;
    });
    
    const wrappedCalculator = result.current.wrapAsync(asyncCalculator, 'calculator');
    
    await act(async () => {
      const sum = await wrappedCalculator(5, 3);
      expect(sum).toBe(8);
    });

    expect(asyncCalculator).toHaveBeenCalledWith(5, 3);
    expect(result.current.error).toBeNull();
  });

  it('should handle multiple consecutive async calls', async () => {
    const { result } = renderHook(() => useAsyncError());
    const asyncFn = vi.fn()
      .mockResolvedValueOnce('first')
      .mockRejectedValueOnce(new Error('second error'))
      .mockResolvedValueOnce('third');
    
    const wrappedFn = result.current.wrapAsync(asyncFn, 'multi-call');
    
    await act(async () => {
      const first = await wrappedFn();
      expect(first).toBe('first');
    });
    expect(result.current.error).toBeNull();

    await act(async () => {
      const second = await wrappedFn();
      expect(second).toBeUndefined();
    });
    expect(result.current.error?.message).toBe('second error');

    act(() => {
      result.current.clearError();
    });

    await act(async () => {
      const third = await wrappedFn();
      expect(third).toBe('third');
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle async functions with different parameter types', async () => {
    const { result } = renderHook(() => useAsyncError());
    const complexAsyncFn = vi.fn().mockImplementation(async (
      str: string,
      num: number,
      obj: { key: string },
      arr: number[]
    ) => {
      return { str, num, obj, arr };
    });
    
    const wrappedFn = result.current.wrapAsync(complexAsyncFn, 'complex-params');
    
    await act(async () => {
      const result = await wrappedFn('test', 42, { key: 'value' }, [1, 2, 3]);
      expect(result).toEqual({
        str: 'test',
        num: 42,
        obj: { key: 'value' },
        arr: [1, 2, 3],
      });
    });

    expect(complexAsyncFn).toHaveBeenCalledWith('test', 42, { key: 'value' }, [1, 2, 3]);
  });
});
