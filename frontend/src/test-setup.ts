import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Simple global setup - individual tests will handle their own mocking
// to prevent cross-test contamination

// Only setup the most basic global mocks
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
});

// Basic fetch mock
global.fetch = vi.fn();
