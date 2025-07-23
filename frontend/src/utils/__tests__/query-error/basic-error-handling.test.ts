// Mock the toast hook first
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleQueryError } from '../../query-error-handling';
import { toast } from '@/hooks/use-toast';

const mockToast = vi.mocked(toast);

// Mock console to avoid noise in test output and capture logs
const consoleMocks = {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

// Type for errors with status codes
interface ErrorWithStatus extends Error {
  status?: number;
}

describe('handleQueryError - Basic Error Handling', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(consoleMocks.error);
    vi.spyOn(console, 'warn').mockImplementation(consoleMocks.warn);
    mockToast.mockClear();
    consoleMocks.error.mockClear();
    consoleMocks.warn.mockClear();
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/test',
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log error details to console', () => {
    const error = new Error('Test error');
    const query = { queryKey: ['test'], queryHash: 'hash123' };

    handleQueryError(error, query);

    expect(consoleMocks.error).toHaveBeenCalledWith(
      'React Query Error:',
      expect.objectContaining({
        error: 'Test error',
        stack: expect.any(String),
        queryKey: ['test'],
        queryHash: 'hash123',
        timestamp: expect.any(String),
        url: 'http://localhost:3000/test'
      })
    );
  });

  it('should show default error message for unknown errors', () => {
    const unknownError = new Error('Unknown error');

    handleQueryError(unknownError);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Something went wrong',
        description: 'Unknown error'
      })
    );
  });

  it('should handle errors without query info', () => {
    const error = new Error('Test error');

    handleQueryError(error);

    expect(consoleMocks.error).toHaveBeenCalledWith(
      'React Query Error:',
      expect.objectContaining({
        error: 'Test error',
        queryKey: undefined,
        queryHash: undefined
      })
    );
  });

  it('should throw when handling null and undefined errors', () => {
    // @ts-expect-error Testing null error handling
    expect(() => handleQueryError(null)).toThrow();

    // @ts-expect-error Testing undefined error handling  
    expect(() => handleQueryError(undefined)).toThrow();
  });

  it('should handle error objects with no message', () => {
    const errorWithoutMessage = new Error();
    errorWithoutMessage.message = '';

    handleQueryError(errorWithoutMessage);

    expect(consoleMocks.error).toHaveBeenCalledWith(
      'React Query Error:',
      expect.objectContaining({
        error: '',
      })
    );
  });

  it('should include stack trace when available', () => {
    const errorWithStack = new Error('Error with stack');
    errorWithStack.stack = 'Error: Error with stack\n    at test.js:1:1';

    handleQueryError(errorWithStack);

    expect(consoleMocks.error).toHaveBeenCalledWith(
      'React Query Error:',
      expect.objectContaining({
        stack: 'Error: Error with stack\n    at test.js:1:1',
      })
    );
  });

  it('should handle errors with custom properties', () => {
    interface CustomError extends Error {
      code?: string;
      details?: Record<string, unknown>;
    }
    
    const customError: CustomError = new Error('Custom error');
    customError.code = 'CUSTOM_CODE';
    customError.details = { extra: 'info' };

    handleQueryError(customError);

    expect(consoleMocks.error).toHaveBeenCalledWith(
      'React Query Error:',
      expect.objectContaining({
        error: 'Custom error',
      })
    );
  });
});
