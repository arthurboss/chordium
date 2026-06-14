import { describe, it, expect } from 'vitest';
import { removeTabsFromHtml } from '../../chord-html/remove-tabs-from-html';

describe('removeTabsFromHtml', () => {
  it('strips tablatura spans entirely', () => {
    const input = 'before\n<span class="tablatura">E|---\nB|---</span></span>\nafter';
    const result = removeTabsFromHtml(input);
    expect(result).not.toContain('tablatura');
    expect(result).toContain('before');
    expect(result).toContain('after');
  });

  it('removes zero-width space unicode characters', () => {
    expect(removeTabsFromHtml('a​b')).toBe('ab');
  });

  it('removes &ZeroWidthSpace; entities', () => {
    expect(removeTabsFromHtml('a&ZeroWidthSpace;b')).toBe('ab');
  });

  it('collapses three or more consecutive newlines to two', () => {
    expect(removeTabsFromHtml('a\n\n\n\nb')).toBe('a\n\nb');
  });

  it('removes leading newlines', () => {
    expect(removeTabsFromHtml('\n\nsome content')).not.toMatch(/^\n/);
  });

  it('removes a section title that is immediately followed by end-of-string', () => {
    const input = 'lyric\n<span class="section-title">[Outro]</span>\n';
    expect(removeTabsFromHtml(input)).not.toContain('section-title');
  });

  it('removes a section title immediately followed by another section title', () => {
    const input = '<span class="section-title">[A]</span>\n<span class="section-title">[B]</span>\nlyric';
    const occurrences = (removeTabsFromHtml(input).match(/section-title/g) || []).length;
    expect(occurrences).toBe(1);
  });
});
