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

// Mock console methods globally to prevent memory leaks from error logging
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
};

beforeEach(() => {
  // Mock console methods to capture but not actually output in tests
  console.error = () => {
    // Silently ignore console.error calls to prevent memory buildup
  };
  console.warn = () => {
    // Silently ignore console.warn calls to prevent memory buildup
  };
  console.log = () => {
    // Silently ignore console.log calls to prevent memory buildup
  };
});

afterEach(() => {
  // Restore original console methods
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.log = originalConsole.log;
}); 