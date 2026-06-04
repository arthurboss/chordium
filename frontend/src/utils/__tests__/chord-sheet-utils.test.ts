import { describe, it, expect } from 'vitest';
import { processContent } from '../chord-sheet-utils';

// ─── helpers ────────────────────────────────────────────────────────────────

const sectionTitles = (sections: ReturnType<typeof processContent>) =>
  sections.map(s => s.title);

const lineTypes = (sections: ReturnType<typeof processContent>, title: string) =>
  sections.find(s => s.title === title)?.lines.map(l => l.type) ?? [];

const allLineTypes = (sections: ReturnType<typeof processContent>) =>
  sections.flatMap(s => s.lines.map(l => l.type));

// ─── TAB block detection ─────────────────────────────────────────────────────

describe('processContent – TAB blocks', () => {
  const TAB_BLOCK = [
    '[TAB]',
    '[Dedilhado - Intro]',
    'Parte 1 de 3',
    '   G        G/B',
    'E|----3--x--3----|',
    'B|----3--x--3----|',
    '      i',
    '[/TAB]',
  ].join('\n');

  it('marks the section inside a TAB block as isTabSection', () => {
    const sections = processContent(TAB_BLOCK);
    const tab = sections.find(s => s.title === 'Dedilhado - Intro');
    expect(tab).toBeDefined();
    expect(tab?.isTabSection).toBe(true);
  });

  it('classifies every non-empty line inside a TAB block as tab', () => {
    const sections = processContent(TAB_BLOCK);
    const types = lineTypes(sections, 'Dedilhado - Intro');
    const nonEmpty = types.filter(t => t !== 'empty');
    expect(nonEmpty.every(t => t === 'tab')).toBe(true);
  });

  it('does NOT mark sections outside TAB blocks as isTabSection', () => {
    const content = [
      '[Verse]',
      'G  C  D',
      'Singing words',
    ].join('\n');
    const sections = processContent(content);
    expect(sections.find(s => s.title === 'Verse')?.isTabSection).toBeFalsy();
  });
});

// ─── [/TAB] reset: content after a tab block stays in its own section ────────

describe('processContent – content after TAB block', () => {
  const MIXED = [
    '[TAB]',
    '[Dedilhado - Intro]',
    'E|----3--x--3----|',
    '[/TAB]',
    '',
    '[Primeira Parte]',
    'G  G/B            C9',
    '       Saying "I love you"',
    'Is not the words',
  ].join('\n');

  it('creates a separate section for content after [/TAB]', () => {
    const sections = processContent(MIXED);
    const primeiraParte = sections.find(s => s.title === 'Primeira Parte');
    expect(primeiraParte).toBeDefined();
    expect(primeiraParte?.isTabSection).toBeFalsy();
  });

  it('lyrics after TAB block are classified as lyrics, not tab', () => {
    const sections = processContent(MIXED);
    const types = lineTypes(sections, 'Primeira Parte');
    expect(types).toContain('lyrics');
    expect(types).not.toContain('tab');
  });

  it('chord lines after TAB block are classified as chord', () => {
    const sections = processContent(MIXED);
    const types = lineTypes(sections, 'Primeira Parte');
    expect(types).toContain('chord');
  });
});

// ─── inline section header + chords (e.g. "[Intro] G  G/B  C9  Am7") ────────

describe('processContent – inline section header with chords', () => {
  const INLINE = '[Intro] G  G/B  C9  Am7 \n        C  D  D4';

  it('does not crash on inline header+chord lines', () => {
    expect(() => processContent(INLINE)).not.toThrow();
  });

  it('inline header line is treated as lyrics (not a section break)', () => {
    const sections = processContent(INLINE);
    // No section with title "Intro" — it wasn't a pure [Header]
    expect(sectionTitles(sections)).not.toContain('Intro');
  });
});

// ─── realistic More Than Words excerpt ───────────────────────────────────────

describe('processContent – More Than Words excerpt', () => {
  const EXCERPT = [
    '[TAB]',
    '[Dedilhado - Intro e Primeira Parte]',
    'Parte 1 de 3',
    '   G        G/B      C9',
    'E|----3--x--3--3--x--3----|',
    'B|----3--x--3--3--x--3----|',
    '      i        i',
    '[/TAB]',
    '',
    '[Primeira Parte]',
    '',
    'G  G/B            C9',
    '       Saying "I love you"',
    '    Am7             ',
    'Is not the words ',
    '   C       D     D4  G',
    'I want to hear from you',
  ].join('\n');

  it('has exactly two sections', () => {
    const sections = processContent(EXCERPT);
    expect(sections.length).toBe(2);
  });

  it('first section is the tab section', () => {
    const sections = processContent(EXCERPT);
    expect(sections[0].title).toBe('Dedilhado - Intro e Primeira Parte');
    expect(sections[0].isTabSection).toBe(true);
  });

  it('second section is Primeira Parte and is NOT a tab section', () => {
    const sections = processContent(EXCERPT);
    expect(sections[1].title).toBe('Primeira Parte');
    expect(sections[1].isTabSection).toBeFalsy();
  });

  it('Primeira Parte contains both chord and lyrics lines', () => {
    const sections = processContent(EXCERPT);
    const types = new Set(lineTypes(sections, 'Primeira Parte').filter(t => t !== 'empty'));
    expect(types.has('chord')).toBe(true);
    expect(types.has('lyrics')).toBe(true);
  });

  it('no lyrics lines appear inside the tab section', () => {
    const sections = processContent(EXCERPT);
    const tabTypes = lineTypes(sections, 'Dedilhado - Intro e Primeira Parte');
    expect(tabTypes).not.toContain('lyrics');
  });

  it('no tab lines appear inside Primeira Parte', () => {
    const sections = processContent(EXCERPT);
    const types = lineTypes(sections, 'Primeira Parte');
    expect(types).not.toContain('tab');
  });
});

// ─── multiple TAB blocks in a row (each is its own section) ──────────────────

describe('processContent – multiple consecutive TAB blocks', () => {
  const MULTI = [
    '[TAB]',
    'Parte 1 de 3',
    'E|----3--x----|',
    '[/TAB]',
    '[TAB]',
    'Parte 2 de 3',
    'E|----0--x----|',
    '[/TAB]',
    '',
    '[Verse]',
    'G  Am',
    'Some lyrics here',
  ].join('\n');

  it('each TAB block becomes its own section', () => {
    const sections = processContent(MULTI);
    const tabSections = sections.filter(s => s.isTabSection);
    expect(tabSections.length).toBe(2);
  });

  it('verse section after TAB blocks is not a tab section', () => {
    const sections = processContent(MULTI);
    const verse = sections.find(s => s.title === 'Verse');
    expect(verse?.isTabSection).toBeFalsy();
  });

  it('verse has lyrics', () => {
    const sections = processContent(MULTI);
    expect(lineTypes(sections, 'Verse')).toContain('lyrics');
  });
});

// ─── chord/lyric classification outside TAB blocks ───────────────────────────

describe('processContent – chord vs lyric classification', () => {
  const content = [
    '[Verse]',
    'G  G/B  C9  Am7',
    '       Saying "I love you"',
    'Is not the words',
    'C      D  D4  Em',
    'If you only knew',
  ].join('\n');

  it('sparse chord lines are chord type', () => {
    const sections = processContent(content);
    const lines = sections.find(s => s.title === 'Verse')?.lines ?? [];
    const chordLines = lines.filter(l => l.type === 'chord').map(l => l.content.trim());
    expect(chordLines).toContain('G  G/B  C9  Am7');
    expect(chordLines).toContain('C      D  D4  Em');
  });

  it('prose lines are lyrics type', () => {
    const sections = processContent(content);
    const lines = sections.find(s => s.title === 'Verse')?.lines ?? [];
    const lyricLines = lines.filter(l => l.type === 'lyrics').map(l => l.content.trim());
    expect(lyricLines).toContain('Saying "I love you"');
    expect(lyricLines).toContain('Is not the words');
    expect(lyricLines).toContain('If you only knew');
  });
});
