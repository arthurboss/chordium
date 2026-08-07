import { describe, it, expect } from 'vitest';
import { parseChordPro } from '../parse';

describe('parseChordPro', () => {
  it('parses a lyrics line with no chords into a single segment', () => {
    const doc = parseChordPro('Pai eu quero te amar');

    expect(doc.lines).toEqual([
      { type: 'lyrics', segments: [{ chord: undefined, lyric: 'Pai eu quero te amar' }] },
    ]);
  });

  it('parses a single inline chord followed by lyric', () => {
    const doc = parseChordPro('[G]Saying I love you');

    expect(doc.lines).toEqual([
      { type: 'lyrics', segments: [{ chord: 'G', lyric: 'Saying I love you' }] },
    ]);
  });

  it('parses multiple chords per line, including leading text before the first chord', () => {
    const doc = parseChordPro('Saying I [C]love you [G]but you don\'t');

    expect(doc.lines).toEqual([
      {
        type: 'lyrics',
        segments: [
          { lyric: 'Saying I ' },
          { chord: 'C', lyric: 'love you ' },
          { chord: 'G', lyric: "but you don't" },
        ],
      },
    ]);
  });

  it('parses a line that is entirely chords with empty lyric segments', () => {
    const doc = parseChordPro('[Em7][G][D4]');

    expect(doc.lines).toEqual([
      {
        type: 'lyrics',
        segments: [
          { chord: 'Em7', lyric: '' },
          { chord: 'G', lyric: '' },
          { chord: 'D4', lyric: '' },
        ],
      },
    ]);
  });

  it('parses {comment: ...} directives', () => {
    const doc = parseChordPro('{comment: Intro}');

    expect(doc.lines).toEqual([{ type: 'comment', text: 'Intro' }]);
  });

  it('parses the short {c: ...} comment alias', () => {
    const doc = parseChordPro('{c: Verse 1}');

    expect(doc.lines).toEqual([{ type: 'comment', text: 'Verse 1' }]);
  });

  it('parses unknown directives as passthrough', () => {
    const doc = parseChordPro('{title: Wonderwall}');

    expect(doc.lines).toEqual([{ type: 'directive', name: 'title', value: 'Wonderwall' }]);
  });

  it('parses a directive with no value', () => {
    const doc = parseChordPro('{soc}');

    expect(doc.lines).toEqual([{ type: 'directive', name: 'soc', value: undefined }]);
  });

  it('parses empty/whitespace-only lines as empty', () => {
    const doc = parseChordPro('   ');

    expect(doc.lines).toEqual([{ type: 'empty' }]);
  });

  it('parses a {start_of_tab}/{end_of_tab} block into verbatim tab lines, preserving whitespace', () => {
    const text = ['{start_of_tab}', 'E|--0--|', '', 'B|--1--|', '{end_of_tab}'].join('\n');
    const doc = parseChordPro(text);

    expect(doc.lines).toEqual([
      { type: 'tab', content: 'E|--0--|' },
      { type: 'tab', content: '' },
      { type: 'tab', content: 'B|--1--|' },
    ]);
  });

  it('does not treat directive-looking text inside a tab block as a directive', () => {
    const text = ['{start_of_tab}', '{comment: not a real comment inside a tab}', '{end_of_tab}'].join('\n');
    const doc = parseChordPro(text);

    expect(doc.lines).toEqual([{ type: 'tab', content: '{comment: not a real comment inside a tab}' }]);
  });

  it('is case-insensitive for start_of_tab/end_of_tab markers', () => {
    const text = ['{START_OF_TAB}', 'E|--0--|', '{END_OF_TAB}'].join('\n');
    const doc = parseChordPro(text);

    expect(doc.lines).toEqual([{ type: 'tab', content: 'E|--0--|' }]);
  });

  it('parses a full multi-line document with mixed line types', () => {
    const text = [
      '{comment: Intro}',
      '[Em7]Today is [G]gonna be the day',
      '',
      '{start_of_tab}',
      'E|--0--|',
      '{end_of_tab}',
      'Plain lyric line',
    ].join('\n');

    const doc = parseChordPro(text);

    expect(doc.lines).toEqual([
      { type: 'comment', text: 'Intro' },
      {
        type: 'lyrics',
        segments: [
          { chord: 'Em7', lyric: 'Today is ' },
          { chord: 'G', lyric: 'gonna be the day' },
        ],
      },
      { type: 'empty' },
      { type: 'tab', content: 'E|--0--|' },
      { type: 'lyrics', segments: [{ chord: undefined, lyric: 'Plain lyric line' }] },
    ]);
  });
});
