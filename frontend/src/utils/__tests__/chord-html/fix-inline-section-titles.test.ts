import { describe, it, expect } from 'vitest';
import { fixInlineSectionTitles } from '../../chord-html/fix-inline-section-titles';

describe('fixInlineSectionTitles', () => {
  it('inserts a newline when a section title is followed by inline content', () => {
    const input = '<span class="section-title">[Verse]</span> some lyric';
    expect(fixInlineSectionTitles(input)).toBe('<span class="section-title">[Verse]</span>\nsome lyric');
  });

  it('leaves a section title that already has a trailing newline unchanged', () => {
    const input = '<span class="section-title">[Verse]</span>\nsome lyric';
    expect(fixInlineSectionTitles(input)).toBe(input);
  });

  it('handles multiple sections with inline content', () => {
    const input = [
      '<span class="section-title">[Chorus]</span> C  G',
      '<span class="section-title">[Bridge]</span> Am',
    ].join('\n');
    const result = fixInlineSectionTitles(input);
    expect(result).toContain('<span class="section-title">[Chorus]</span>\nC  G');
    expect(result).toContain('<span class="section-title">[Bridge]</span>\nAm');
  });
});
