import { describe, it, expect, vi } from 'vitest';

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'sectionTitles.intro': 'Intro',
        'sectionTitles.verse': 'Verse',
        'sectionTitles.chorus': 'Chorus',
        'sectionTitles.preChorus': 'Pre-Chorus',
        'sectionTitles.bridge': 'Bridge',
        'sectionTitles.outro': 'Outro',
        'sectionTitles.solo': 'Solo',
        'sectionTitles.interlude': 'Interlude',
      };
      return translations[key];
    },
  },
}));

import { chordProToRawHtml } from '../chordpro-to-raw-html';

describe('chordProToRawHtml', () => {
  it('renders a single chord+lyric line with the chord on its own line above the lyric', () => {
    const result = chordProToRawHtml('[G]Saying I love you');

    expect(result).toBe('<b>G</b>\nSaying I love you');
  });

  it('renders multiple chords per line, each above the syllable it annotates', () => {
    const result = chordProToRawHtml("Saying I [C]love you [G]but you don't");

    expect(result).toBe(
      '         <b>C</b>        <b>G</b>\nSaying I love you but you don&#39;t'
    );
  });

  it('renders a lyric line with no chords as plain text, unchanged', () => {
    const result = chordProToRawHtml('Just some plain lyrics');

    expect(result).toBe('Just some plain lyrics');
  });

  it('renders a comment as a translated section-title span', () => {
    const result = chordProToRawHtml('{comment: Intro}');

    expect(result).toBe('<span class="section-title">Intro</span>');
  });

  it('wraps a tab block in tablatura/cnt spans', () => {
    const tab = ['{start_of_tab}', 'E|-0-1-2-|', 'B|-0-1-2-|', '{end_of_tab}'].join('\n');
    const result = chordProToRawHtml(tab);

    expect(result).toBe(
      '<span class="tablatura"><span class="cnt">E|-0-1-2-|\nB|-0-1-2-|</span></span>'
    );
  });

  it('preserves empty lines', () => {
    const result = chordProToRawHtml('[G]Hello\n\n[C]World');

    expect(result).toBe('<b>G</b>\nHello\n\n<b>C</b>\nWorld');
  });

  it('skips unknown directives', () => {
    const result = chordProToRawHtml('{key: G}\n[G]Hello');

    expect(result).toBe('<b>G</b>\nHello');
  });

  it('HTML-escapes lyric and chord text to prevent markup injection', () => {
    const result = chordProToRawHtml('[G<script>]Say "hi" <b>now</b> & smile');

    expect(result).not.toContain('<script>');
    expect(result).toBe(
      '<b>G&lt;script&gt;</b>\nSay &quot;hi&quot; &lt;b&gt;now&lt;/b&gt; &amp; smile'
    );
  });

  it('renders a chord-only line (no real lyric text) as just the chord row, with no blank line beneath it', () => {
    const result = chordProToRawHtml('[G]  [C9]  [Am7]');

    expect(result).toBe('<b>G</b> <b>C9</b> <b>Am7</b>');
  });

  it('renders a chord-only line right after a section title with no blank line between them', () => {
    const result = chordProToRawHtml('{comment: Intro}\n[G]  [C9]  [Am7]');

    expect(result).toBe(
      '<span class="section-title">Intro</span>\n<b>G</b> <b>C9</b> <b>Am7</b>'
    );
  });
});
