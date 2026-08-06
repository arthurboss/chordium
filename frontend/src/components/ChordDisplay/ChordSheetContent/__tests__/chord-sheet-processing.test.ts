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

import { resolveSourceHtml } from '../chord-sheet-processing';

describe('resolveSourceHtml', () => {
  it('prefers rawHtml when present, ignoring songChords entirely', () => {
    const result = resolveSourceHtml('<b>G</b>raw', '[C]ignored');

    expect(result).toBe('<b>G</b>raw');
  });

  it('returns undefined when neither rawHtml nor songChords is provided', () => {
    expect(resolveSourceHtml(undefined, undefined)).toBeUndefined();
  });

  it('converts ChordPro-format songChords directly via the new converter', () => {
    const result = resolveSourceHtml(undefined, '[G]Saying I [C]love you');

    expect(result).toBe('<b>G</b>        <b>C</b>\nSaying I love you');
  });

  it('migrates legacy positional-format songChords to ChordPro before rendering', () => {
    const legacy = ['[Intro]', 'Em7             G', 'Today is gonna be the day'].join('\n');

    const result = resolveSourceHtml(undefined, legacy);

    expect(result).toContain('<span class="section-title">Intro</span>');
    expect(result).toContain('<b>Em7</b>            <b>G</b>\nToday is gonna be the day');
  });
});
