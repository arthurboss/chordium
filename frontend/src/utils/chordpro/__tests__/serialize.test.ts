import { describe, it, expect } from 'vitest';
import { parseChordPro } from '../parse';
import { serializeChordPro } from '../serialize';
import type { ChordProDocument } from '../types';

describe('serializeChordPro', () => {
  it('serializes a lyrics line with no chord back to plain text', () => {
    const doc: ChordProDocument = {
      lines: [{ type: 'lyrics', segments: [{ chord: undefined, lyric: 'Pai eu quero te amar' }] }],
    };

    expect(serializeChordPro(doc)).toBe('Pai eu quero te amar');
  });

  it('serializes multiple chord segments back into inline bracket form', () => {
    const doc: ChordProDocument = {
      lines: [
        {
          type: 'lyrics',
          segments: [
            { lyric: 'Saying I ' },
            { chord: 'C', lyric: 'love you ' },
            { chord: 'G', lyric: "but you don't" },
          ],
        },
      ],
    };

    expect(serializeChordPro(doc)).toBe("Saying I [C]love you [G]but you don't");
  });

  it('serializes a comment directive', () => {
    const doc: ChordProDocument = { lines: [{ type: 'comment', text: 'Intro' }] };

    expect(serializeChordPro(doc)).toBe('{comment: Intro}');
  });

  it('serializes a passthrough directive with and without a value', () => {
    const doc: ChordProDocument = {
      lines: [
        { type: 'directive', name: 'title', value: 'Wonderwall' },
        { type: 'directive', name: 'soc', value: undefined },
      ],
    };

    expect(serializeChordPro(doc)).toBe('{title: Wonderwall}\n{soc}');
  });

  it('serializes an empty line as a blank line', () => {
    const doc: ChordProDocument = { lines: [{ type: 'empty' }] };

    expect(serializeChordPro(doc)).toBe('');
  });

  it('wraps consecutive tab lines once in {start_of_tab}/{end_of_tab}', () => {
    const doc: ChordProDocument = {
      lines: [
        { type: 'tab', content: 'E|--0--|' },
        { type: 'tab', content: 'B|--1--|' },
      ],
    };

    expect(serializeChordPro(doc)).toBe(['{start_of_tab}', 'E|--0--|', 'B|--1--|', '{end_of_tab}'].join('\n'));
  });

  it('closes a still-open tab run at the end of the document', () => {
    const doc: ChordProDocument = { lines: [{ type: 'tab', content: 'E|--0--|' }] };

    expect(serializeChordPro(doc)).toBe(['{start_of_tab}', 'E|--0--|', '{end_of_tab}'].join('\n'));
  });

  it('round-trips parse -> serialize for a simple inline-chord line', () => {
    const text = '[Em7]Today is [G]gonna be the day';
    expect(serializeChordPro(parseChordPro(text))).toBe(text);
  });

  it('round-trips parse -> serialize for a comment directive', () => {
    const text = '{comment: Intro}';
    expect(serializeChordPro(parseChordPro(text))).toBe(text);
  });

  it('round-trips parse -> serialize for a tab block', () => {
    const text = ['{start_of_tab}', 'E|--0--|', 'B|--1--|', '{end_of_tab}'].join('\n');
    expect(serializeChordPro(parseChordPro(text))).toBe(text);
  });

  it('round-trips parse -> serialize for a realistic multi-line chord sheet excerpt', () => {
    const text = [
      '{comment: Intro}',
      '[Em7]Today is [G]gonna be the day',
      '',
      'Plain lyric line',
    ].join('\n');
    expect(serializeChordPro(parseChordPro(text))).toBe(text);
  });
});
