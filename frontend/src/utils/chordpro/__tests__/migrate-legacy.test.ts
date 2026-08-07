import { describe, it, expect } from 'vitest';
import { isLegacyPositionalFormat, migrateLegacyToChordPro } from '../migrate-legacy';

describe('isLegacyPositionalFormat', () => {
  it('returns true for text with a section header and a pure chord line', () => {
    const legacy = ['[Intro]', 'Em7             G', 'Today is gonna be the day'].join('\n');

    expect(isLegacyPositionalFormat(legacy)).toBe(true);
  });

  it('returns false for already-ChordPro inline-bracket text', () => {
    expect(isLegacyPositionalFormat('[Em7]Today is [G]gonna be the day')).toBe(false);
  });

  it('returns false for text containing a ChordPro directive', () => {
    expect(isLegacyPositionalFormat('{comment: Intro}\nEm7  G')).toBe(false);
  });

  it('returns false for plain lyrics with no chord lines at all', () => {
    expect(isLegacyPositionalFormat('Just some plain lyrics with no chords at all')).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(isLegacyPositionalFormat('')).toBe(false);
  });
});

describe('migrateLegacyToChordPro', () => {
  it('merges a chord line into the following lyrics line at matching columns', () => {
    const FIXTURE = ['[Intro]', 'Em7             G', 'Today is gonna be the day', '', 'Em7  G  D'].join('\n');

    const result = migrateLegacyToChordPro(FIXTURE);

    expect(result).toBe('{comment: Intro}\n\n[Em7]Today is gonna [G]be the day\n\n[Em7] [G] [D]');
  });

  it('clamps a chord column beyond the lyric line length to the end of the line', () => {
    const FIXTURE = ['C                    G', 'short'].join('\n');

    const result = migrateLegacyToChordPro(FIXTURE);

    expect(result).toBe('[C]short[G]');
  });

  it('emits each chord in its own bracket for an instrumental line with no following lyrics', () => {
    const FIXTURE = ['[Intro]', 'Em7  G  D4  A7', 'Em7  G  D4  A7'].join('\n');

    const result = migrateLegacyToChordPro(FIXTURE);

    expect(result).toBe('{comment: Intro}\n\n[Em7] [G] [D4] [A7]\n[Em7] [G] [D4] [A7]');
  });

  it('wraps a contiguous tab run in {start_of_tab}/{end_of_tab} once', () => {
    const FIXTURE = ['[TAB]', '[Dedilhado - Intro]', 'E|----3--x--3----|', 'B|----3--x--3----|', '[/TAB]'].join('\n');

    const result = migrateLegacyToChordPro(FIXTURE);

    expect(result).toBe(
      '{comment: Dedilhado - Intro}\n\n{start_of_tab}\nE|----3--x--3----|\nB|----3--x--3----|\n{end_of_tab}'
    );
  });

  it('passes through pure lyric-only lines unchanged', () => {
    const FIXTURE = 'Just some plain lyrics with no chords at all';

    const result = migrateLegacyToChordPro(FIXTURE);

    expect(result).toBe('Just some plain lyrics with no chords at all');
  });

  it('splits a section title from trailing chords on the same line (real scraped shape)', () => {
    const FIXTURE = ['[Intro] Em  G  D  A', '        Em  G  D  A'].join('\n');

    const result = migrateLegacyToChordPro(FIXTURE);

    expect(result).toBe('{comment: Intro}\n\n[Em] [G] [D] [A]\n[Em] [G] [D] [A]');
  });

  it('snaps a chord column that falls mid-word to the start of that word instead of splitting it', () => {
    // Source column for "C9" (col 6) falls inside "love" (starts at col 4),
    // not at a word boundary -- the bracket must move to the start of "love".
    const FIXTURE = ['G           C9', '  Saying "I love you"'].join('\n');

    const result = migrateLegacyToChordPro(FIXTURE);

    expect(result).toBe('  [G]Saying "I [C9]love you"');
  });
});
