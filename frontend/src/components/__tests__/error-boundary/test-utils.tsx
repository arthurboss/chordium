import React from 'react';
import { vi } from 'vitest';

// Mock console methods to avoid noise in test output
export const consoleMocks = {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

// Common setup function for error boundary tests
export const setupErrorBoundaryMocks = () => {
  // Mock all console methods to prevent memory leaks from error logging
  vi.spyOn(console, 'error').mockImplementation(consoleMocks.error);
  vi.spyOn(console, 'warn').mockImplementation(consoleMocks.warn);
  vi.spyOn(console, 'log').mockImplementation(consoleMocks.log);
  
  // Mock window.open for GitHub issue creation
  vi.spyOn(window, 'open').mockImplementation(vi.fn());
  
  // Mock window.location methods
  Object.defineProperty(window, 'location', {
    value: {
      reload: vi.fn(),
      href: 'http://localhost:3000/test',
    },
    writable: true,
  });

  // Clear previous mock calls to prevent memory accumulation
  consoleMocks.error.mockClear();
  consoleMocks.warn.mockClear();
  consoleMocks.log.mockClear();
};

// Enhanced cleanup function for memory management
export const cleanupErrorBoundaryMocks = () => {
  // Clear all mock call history
  consoleMocks.error.mockClear();
  consoleMocks.warn.mockClear();
  consoleMocks.log.mockClear();
  
  // Force garbage collection if available (Node.js only)
  if (typeof global !== 'undefined' && global.gc) {
    global.gc();
  }
  
  // Clear any timers or intervals that might be hanging around
  vi.clearAllTimers();
};

// Component that throws an error
export const ThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error occurred</div>;
};

// Component that throws an error conditionally
export const ConditionalThrowingComponent = ({ error }: { error: boolean }) => {
  if (error) {
    throw new Error('Conditional error');
  }
  return <div data-testid="success">Success</div>;
};

// Component for testing different error messages
export const ThrowingComponentWithMessage = ({ message = 'Test error' }: { message?: string }) => {
  throw new Error(message);
};

// Working component for testing normal operation
export const WorkingComponent = ({ children = 'Working correctly' }: { children?: string }) => (
  <div data-testid="working">{children}</div>
);
