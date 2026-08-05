import { describe, it, expect } from '@jest/globals';
import { extractChordSheet } from '../../../utils/dom-extractors.js';
import type { ChordSheet } from '../../../../shared/types/index.js';
import { mockDocument, cleanupDOM, mockTextNode, mockElement } from './shared-setup.js';

/**
 * Tests for extractChordSheet function
 * Validates extraction of chord sheet content in ChordPro format:
 * - <b>-wrapped chords become inline [Chord] brackets
 * - span.tablatura tab blocks become {start_of_tab}/{end_of_tab}
 * - bare "[Section]" text nodes become {comment: Section} directives
 */

describe('extractChordSheet', () => {
  cleanupDOM();

  it('wraps <b> chord elements as inline ChordPro brackets', () => {
    const mockPreElement = mockElement('pre', {
      children: [
        mockTextNode('   '),
        mockElement('b', { textContent: 'Em7' }),
        mockTextNode('  '),
        mockElement('b', { textContent: 'G' }),
        mockTextNode('\nToday is gonna be the day'),
      ],
    });

    mockDocument((selector: string) => (selector === 'pre' ? [mockPreElement] : []));

    const result: ChordSheet = extractChordSheet();

    expect(result.songChords).toBe('   [Em7]  [G]\nToday is gonna be the day');
  });

  it('trims whitespace inside the chord bracket', () => {
    const mockPreElement = mockElement('pre', {
      children: [mockElement('b', { textContent: '  Em7  ' })],
    });

    mockDocument((selector: string) => (selector === 'pre' ? [mockPreElement] : []));

    const result: ChordSheet = extractChordSheet();

    expect(result.songChords).toBe('[Em7]');
  });

  it('converts a bare "[Section]" text line into a {comment: Section} directive', () => {
    const mockPreElement = mockElement('pre', {
      children: [
        mockTextNode('[Intro]\n'),
        mockElement('b', { textContent: 'Em7' }),
        mockTextNode('  '),
        mockElement('b', { textContent: 'G' }),
      ],
    });

    mockDocument((selector: string) => (selector === 'pre' ? [mockPreElement] : []));

    const result: ChordSheet = extractChordSheet();

    expect(result.songChords).toBe('{comment: Intro}\n[Em7]  [G]');
  });

  it('splits a section label from trailing content on the same source line', () => {
    const mockPreElement = mockElement('pre', {
      children: [mockTextNode('[Intro] '), mockElement('b', { textContent: 'G' })],
    });

    mockDocument((selector: string) => (selector === 'pre' ? [mockPreElement] : []));

    const result: ChordSheet = extractChordSheet();

    // Real CifraClub markup often has a section label followed by chords on
    // the same source line (e.g. "[Intro] Em7  G"). The label still becomes
    // its own {comment: ...} directive, with the trailing content preserved
    // as a normal chord line on the next line.
    expect(result.songChords).toBe('{comment: Intro}\n[G]');
  });

  it('wraps span.tablatura tab blocks in {start_of_tab}/{end_of_tab} directives', () => {
    const tabContent = 'E|----3--x--3--3--x--3-----x----|\nB|----3--x--3--3--x--3--3--x----|';
    const mockPreElement = mockElement('pre', {
      children: [
        mockElement('span', { className: 'tablatura', textContent: tabContent }),
      ],
    });

    mockDocument((selector: string) => (selector === 'pre' ? [mockPreElement] : []));

    const result: ChordSheet = extractChordSheet();

    expect(result.songChords).toBe(`{start_of_tab}\n${tabContent}\n{end_of_tab}\n`);
  });

  it('leaves bracketed lines inside a tab block untouched (whitespace-significant)', () => {
    const tabContent = '[Tab - Intro]\nE|----3--x--3--3--x--3-----x----|';
    const mockPreElement = mockElement('pre', {
      children: [
        mockElement('span', { className: 'tablatura', textContent: tabContent }),
      ],
    });

    mockDocument((selector: string) => (selector === 'pre' ? [mockPreElement] : []));

    const result: ChordSheet = extractChordSheet();

    // The tab content itself is emitted verbatim between the directives —
    // "[Tab - Intro]" is not converted to a {comment: ...} directive because
    // it's inside a tab block.
    expect(result.songChords).toBe(`{start_of_tab}\n${tabContent}\n{end_of_tab}\n`);
  });

  it('extracts a full multi-line chord sheet into ChordPro format', () => {
    const mockPreElement = mockElement('pre', {
      children: [
        mockTextNode('[Intro]\n'),
        mockElement('b', { textContent: 'Em7' }),
        mockTextNode('  '),
        mockElement('b', { textContent: 'G' }),
        mockTextNode('  '),
        mockElement('b', { textContent: 'Dsus4' }),
        mockTextNode('  '),
        mockElement('b', { textContent: 'A7sus4' }),
        mockTextNode('\n\n[Verse 1]\n'),
        mockElement('b', { textContent: 'Em7' }),
        mockTextNode('             '),
        mockElement('b', { textContent: 'G' }),
        mockTextNode('\nToday is gonna be the day'),
      ],
    });

    mockDocument((selector: string) => (selector === 'pre' ? [mockPreElement] : []));

    const result: ChordSheet = extractChordSheet();

    expect(result.songChords).toBe(
      '{comment: Intro}\n[Em7]  [G]  [Dsus4]  [A7sus4]\n\n{comment: Verse 1}\n[Em7]             [G]\nToday is gonna be the day'
    );
  });

  it('should return empty structure when no pre element found', () => {
    mockDocument(() => []); // Element not found

    const result: ChordSheet = extractChordSheet();

    expect(result).toEqual({
      songChords: '',
    });
  });
});
