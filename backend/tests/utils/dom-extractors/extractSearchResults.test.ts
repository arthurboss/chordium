import { describe, it, expect } from '@jest/globals';
import { extractSearchResults } from '../../../utils/dom-extractors.js';
import type { DOMSearchResult } from '../../../types/dom.types.js';
import { mockDocument, cleanupDOM } from './shared-setup.js';

/**
 * Tests for extractSearchResults function
 * Validates extraction of search results from DOM with proper artist information
 */

describe('extractSearchResults', () => {
  cleanupDOM();

  it('should extract valid search results with artist information', () => {
    const mockLinks = [
      {
        textContent: 'Oasis - Cifra Club',
        href: 'https://www.cifraclub.com.br/oasis/',
        parentElement: { className: 'gs-title' }
      },
      {
        textContent: 'Wonderwall - Oasis - Cifra Club',
        href: '/oasis/wonderwall/',
        parentElement: { className: 'gs-title' }
      }
    ];

    mockDocument((selector: string) => {
      if (selector === '.gsc-result a') {
        return mockLinks;
      }
      return [];
    });

    const results: DOMSearchResult[] = extractSearchResults();

    expect(results).toEqual([
      { title: 'Oasis', path: 'oasis', artist: 'Oasis' },
      { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis' }
    ]);
  });

  it('should extract artist from URL when not in title', () => {
    const mockLinks = [
      {
        textContent: 'Some Song Title - Cifra Club',
        href: 'https://www.cifraclub.com.br/ac-dc/back-in-black/',
        parentElement: { className: 'gs-title' }
      }
    ];

    mockDocument((selector: string) => {
      if (selector === '.gsc-result a') {
        return mockLinks;
      }
      return [];
    });

    const results: DOMSearchResult[] = extractSearchResults();

    expect(results).toEqual([
      { title: 'Some Song Title', path: 'ac-dc/back-in-black', artist: 'Ac Dc' }
    ]);
  });

  it('should filter out links without gs-title parent', () => {
    const mockLinks = [
      {
        textContent: 'Valid Result - Artist Name - Cifra Club',
        href: 'https://www.cifraclub.com.br/valid/',
        parentElement: { className: 'gs-title' }
      },
      {
        textContent: 'Invalid Result',
        href: 'https://www.cifraclub.com.br/invalid/',
        parentElement: { className: 'other-class' }
      }
    ];

    mockDocument((selector: string) => {
      if (selector === '.gsc-result a') {
        return mockLinks;
      }
      return [];
    });

    const results: DOMSearchResult[] = extractSearchResults();

    expect(results).toEqual([
      { title: 'Valid Result', path: 'valid', artist: 'Artist Name' }
    ]);
  });
});
