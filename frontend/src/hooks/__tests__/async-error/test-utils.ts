import { vi } from 'vitest';

// Mock console methods to avoid noise in test output
export const consoleMocks = {
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock toast system
export const mockToast = vi.fn();

export const setupAsyncErrorMocks = () => {
  vi.spyOn(console, 'error').mockImplementation(consoleMocks.error);
  vi.spyOn(console, 'warn').mockImplementation(consoleMocks.warn);
};

// Helper to create an async function that throws
export const createAsyncThrowingFunction = (message = 'Async error') => {
  return async () => {
    throw new Error(message);
  };
};

// Helper to create a successful async function
export const createAsyncSuccessFunction = (result = 'success') => {
  return async () => {
    return result;
  };
};

// Helper to create an event handler that throws
export const createThrowingEventHandler = (message = 'Event handler error') => {
  return () => {
    throw new Error(message);
  };
};
