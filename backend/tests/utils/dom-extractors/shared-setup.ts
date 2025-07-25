import { afterEach } from '@jest/globals';

/**
 * Shared setup utilities for DOM extractor tests
 */

// Mock DOM environment for testing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockDocument = (queryMock: (selector: string) => any, title = 'Oasis - Cifra Club') => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).document = {
    querySelectorAll: (selector: string) => {
      const result = queryMock(selector);
      if (Array.isArray(result)) {
        return result;
      }
      return result ? [result] : [];
    },
    querySelector: (selector: string) => {
      const result = queryMock(selector);
      if (Array.isArray(result)) {
        return result.length > 0 ? result[0] : null;
      }
      return result;
    },
    title: title
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).window = {
    location: {
      origin: 'https://www.cifraclub.com.br',
      pathname: '/oasis/'
    }
  };
};

// Cleanup function to be used in afterEach hooks
export const cleanupDOM = () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).document;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
  });
};
