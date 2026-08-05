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
  it('renders a single chord+lyric line', () => {
    const result = chordProToRawHtml('[G]Saying I love you');

    expect(result).toBe('<b>G</b>Saying I love you');
  });

  it('renders multiple chords per line', () => {
    const result = chordProToRawHtml("Saying I [C]love you [G]but you don't");

    expect(result).toBe('Saying I <b>C</b>love you <b>G</b>but you don&#39;t');
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

    expect(result).toBe('<b>G</b>Hello\n\n<b>C</b>World');
  });

  it('skips unknown directives', () => {
    const result = chordProToRawHtml('{key: G}\n[G]Hello');

    expect(result).toBe('<b>G</b>Hello');
  });

  it('HTML-escapes lyric and chord text to prevent markup injection', () => {
    const result = chordProToRawHtml('[G<script>]Say "hi" <b>now</b> & smile');

    expect(result).not.toContain('<script>');
    expect(result).toBe(
      '<b>G&lt;script&gt;</b>Say &quot;hi&quot; &lt;b&gt;now&lt;/b&gt; &amp; smile'
    );
  });
});
