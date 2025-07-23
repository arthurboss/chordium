// Mock window.matchMedia globally for all tests
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {}, // deprecated
      removeListener: function () {}, // deprecated
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {},
    };
  };
}

// Global memory cleanup for large test suites
import { beforeEach, afterEach } from 'vitest';

// Global cleanup after each test to prevent memory leaks
afterEach(() => {
  // Clear all timers
  if (typeof global !== 'undefined') {
    // Force garbage collection if available (requires --expose-gc flag)
    if (global.gc) {
      global.gc();
    }
  }
});

// Mock console methods globally to capture errors for debugging while preventing memory leaks
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
};

// Store captured console output for debugging (with memory limits)
let capturedErrors = [];
let capturedWarnings = [];
let capturedLogs = [];

const MAX_CAPTURED_ITEMS = 50; // Limit to prevent memory buildup

// Helper to add items with memory limit
function addCapturedItem(array, item) {
  array.push(item);
  if (array.length > MAX_CAPTURED_ITEMS) {
    array.shift(); // Remove oldest item
  }
}

beforeEach(() => {
  // Clear captured items for each test
  capturedErrors = [];
  capturedWarnings = [];
  capturedLogs = [];

  // Mock console methods to capture but not output (prevents noise and memory issues)
  console.error = (message, ...args) => {
    addCapturedItem(capturedErrors, { message, args, timestamp: Date.now() });
    // Only output critical errors that might affect test validity
    if (message && typeof message === 'string' && 
        (message.includes('CRITICAL') || message.includes('Test Error'))) {
      originalConsole.error(message, ...args);
    }
  };

  console.warn = (message, ...args) => {
    addCapturedItem(capturedWarnings, { message, args, timestamp: Date.now() });
    // Only output test-related warnings
    if (message && typeof message === 'string' && message.includes('Test Warning')) {
      originalConsole.warn(message, ...args);
    }
  };

  console.log = (message, ...args) => {
    addCapturedItem(capturedLogs, { message, args, timestamp: Date.now() });
    // Don't output logs during tests to reduce noise
  };
});

afterEach(() => {
  // Restore original console methods
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.log = originalConsole.log;
  
  // Clear captured items to prevent memory buildup between tests
  capturedErrors = [];
  capturedWarnings = [];
  capturedLogs = [];
});

// Export captured console methods for test inspection if needed
export const getConsoleCapture = () => ({
  errors: capturedErrors,
  warnings: capturedWarnings,
  logs: capturedLogs,
});

// Helper function for tests to check if specific errors occurred
export const hasConsoleError = (searchText) => {
  return capturedErrors.some(error => 
    error.message && error.message.toString().includes(searchText)
  );
};

export const hasConsoleWarning = (searchText) => {
  return capturedWarnings.some(warning => 
    warning.message && warning.message.toString().includes(searchText)
  );
};
