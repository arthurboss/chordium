import { describe, it, expect } from '@jest/globals';
import { extractFullChordSheet } from '../../../utils/dom-extractors.js';
import type { ChordSheet, SongMetadata } from '../../../../shared/types/index.js';
import { mockDocument, cleanupDOM, mockTextNode, mockElement } from './shared-setup.js';

/**
 * Tests for extractFullChordSheet function
 * Validates extraction of ChordPro-formatted chord content alongside song
 * metadata (title, artist, key, capo, tuning).
 */

describe('extractFullChordSheet', () => {
  cleanupDOM();

  const setupDOM = (preElement: unknown, overrides: Record<string, unknown> = {}) => {
    const selectors: Record<string, unknown> = {
      pre: [preElement],
      'h1.t1': { textContent: 'Wonderwall' },
      'h2.t3 a': { textContent: 'Oasis' },
      ...overrides,
    };

    mockDocument((selector: string) => selectors[selector] ?? []);
  };

  it('wraps <b> chords as inline brackets and bare "[Section]" lines as comment directives', () => {
    const preElement = mockElement('pre', {
      children: [
        mockTextNode('[Intro]\n'),
        mockElement('b', { textContent: 'Em7' }),
        mockTextNode('  '),
        mockElement('b', { textContent: 'G' }),
        mockTextNode('\n\n[Verse 1]\nToday is gonna be the day'),
      ],
    });

    setupDOM(preElement);

    const result: ChordSheet & SongMetadata = extractFullChordSheet();

    expect(result.songChords).toBe(
      '{comment: Intro}\n[Em7]  [G]\n\n{comment: Verse 1}\nToday is gonna be the day'
    );
    expect(result.title).toBe('Wonderwall');
    expect(result.artist).toBe('Oasis');
  });

  it('wraps span.tablatura tab blocks in {start_of_tab}/{end_of_tab} directives', () => {
    const tabContent = 'E|----3--x--3--3--x--3-----x----|';
    const preElement = mockElement('pre', {
      children: [mockElement('span', { className: 'tablatura', textContent: tabContent })],
    });

    setupDOM(preElement);

    const result: ChordSheet & SongMetadata = extractFullChordSheet();

    expect(result.songChords).toBe(`{start_of_tab}\n${tabContent}\n{end_of_tab}\n`);
  });

  it('trims whitespace inside the chord bracket', () => {
    const preElement = mockElement('pre', {
      children: [mockElement('b', { textContent: '   Am7   ' })],
    });

    setupDOM(preElement);

    const result: ChordSheet & SongMetadata = extractFullChordSheet();

    expect(result.songChords).toBe('[Am7]');
  });

  it('returns empty songChords and falls back to URL/page-title metadata when no pre element is found', () => {
    mockDocument(
      (selector: string) => {
        const selectors: Record<string, unknown> = { pre: [], 'h1.t1': [], 'h2.t3 a': [] };
        return selectors[selector] ?? [];
      },
      'Wonderwall - Oasis - Cifra Club'
    );

    const result: ChordSheet & SongMetadata = extractFullChordSheet();

    expect(result.songChords).toBe('');
    expect(result.title).toBe('Wonderwall');
    expect(result.artist).toBe('Oasis');
  });
});
