/**
 * Shared utilities for data transformation pipeline tests
 * Provides DOM mocking and common test setup functionality
 */

// Type definitions for test globals
interface TestGlobal {
  document?: {
    querySelectorAll: (selector: string) => MockLink[];
    querySelector: (selector: string) => MockLink[];
    title: string;
  };
  window?: {
    location: {
      origin: string;
      pathname: string;
    };
  };
}

/**
 * Mock DOM environment for testing data extraction
 * @param queryMock - Function that returns mock elements based on selector
 * @param title - Document title to set (defaults to 'Test - Cifra Club')
 */
export const mockDocument = (queryMock: (selector: string) => MockLink[], title = 'Test - Cifra Club'): void => {
  const testGlobal = global as unknown as TestGlobal;
  testGlobal.document = {
    querySelectorAll: queryMock,
    querySelector: queryMock,
    title: title
  };
  testGlobal.window = {
    location: {
      origin: 'https://www.cifraclub.com.br',
      pathname: '/test/'
    }
  };
};

/**
 * Cleanup DOM globals after each test
 * Use in afterEach hooks
 */
export const cleanupDOM = (): void => {
  const testGlobal = global as unknown as TestGlobal;
  delete testGlobal.document;
  delete testGlobal.window;
};

/**
 * Interface for mock link elements used in tests
 */
export interface MockLink {
  textContent: string;
  href: string;
  parentElement?: { className: string };
}

/**
 * Expected Song interface for validation
 */
export const expectedSongInterface = {
  title: expect.any(String),
  path: expect.any(String),
  artist: expect.any(String)
};
