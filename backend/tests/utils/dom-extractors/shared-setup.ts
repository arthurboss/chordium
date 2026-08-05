import { afterEach } from '@jest/globals';

/**
 * Shared setup utilities for DOM extractor tests
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = any;

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
  // dom-extractors.ts references the browser's global `Node` constants
  // (Node.TEXT_NODE / Node.ELEMENT_NODE) when walking childNodes. jsdom isn't
  // used in these unit tests (plain "node" jest environment), so provide the
  // two constants the extractors actually use.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).Node = {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
  };
};

// Cleanup function to be used in afterEach hooks
export const cleanupDOM = () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).document;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).Node;
  });
};

/**
 * Builds a mock DOM text node, as consumed by dom-extractors.ts's childNodes
 * walk (nodeType === Node.TEXT_NODE).
 */
export const mockTextNode = (text: string): AnyNode => ({
  nodeType: 3,
  textContent: text,
});

/**
 * Builds a mock DOM element node, as consumed by dom-extractors.ts's childNodes
 * walk (nodeType === Node.ELEMENT_NODE). `textContent` defaults to the
 * concatenation of children's textContent (mirrors real DOM behavior).
 */
export const mockElement = (
  tagName: string,
  {
    className,
    children = [] as AnyNode[],
    textContent,
  }: { className?: string; children?: AnyNode[]; textContent?: string } = {}
): AnyNode => {
  const computedTextContent =
    textContent !== undefined
      ? textContent
      : children.map((c) => c.textContent || '').join('');

  const classList = {
    contains: (cls: string) => (className || '').split(/\s+/).filter(Boolean).includes(cls),
  };

  return {
    nodeType: 1,
    tagName: tagName.toUpperCase(),
    textContent: computedTextContent,
    childNodes: children,
    classList,
    getAttribute: (name: string) => (name === 'class' ? className || null : null),
  };
};
