import { vi } from 'vitest';

// Shared mock setup for query error tests
export const setupQueryErrorMocks = () => {
  // Mock console methods
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
};

export const mockToast = vi.fn();

// Mock search results data
export const mockSearchResults = {
  success: {
    artist: 'Test Artist',
    songs: [
      { title: 'Song 1', url: 'http://example.com/song1' },
      { title: 'Song 2', url: 'http://example.com/song2' },
    ],
  },
  error: {
    message: 'Search failed',
    code: 'SEARCH_ERROR',
  },
};

// Mock API responses
export const createMockResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

// Console mocks
export const consoleMocks = {
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
};

// Reset all mocks
export const resetAllMocks = () => {
  vi.resetAllMocks();
  mockToast.mockClear();
  consoleMocks.error.mockClear();
  consoleMocks.warn.mockClear();
  consoleMocks.log.mockClear();
};
