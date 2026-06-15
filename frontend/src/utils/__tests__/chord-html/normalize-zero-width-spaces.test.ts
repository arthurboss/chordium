import { describe, it, expect } from 'vitest';
import { normalizeZeroWidthSpaces } from '../../chord-html/normalize-zero-width-spaces';

describe('normalizeZeroWidthSpaces', () => {
  it('is a no-op on plain text with no special markers', () => {
    const input = 'hello\nworld';
    expect(normalizeZeroWidthSpaces(input)).toBe(input);
  });

  it('collapses consecutive ZWS unicode characters into one', () => {
    const zws = '​';
    const input = `a${zws}${zws}${zws}b`;
    expect(normalizeZeroWidthSpaces(input)).toBe(`a${zws}b`);
  });

  it('collapses consecutive &ZeroWidthSpace; entities into one', () => {
    const input = 'a&ZeroWidthSpace;&ZeroWidthSpace;&ZeroWidthSpace;b';
    expect(normalizeZeroWidthSpaces(input)).toBe('a&ZeroWidthSpace;b');
  });

  it('merges adjacent tablatura spans separated by a single newline', () => {
    const input = '</span></span>\n<span class="tablatura">next';
    expect(normalizeZeroWidthSpaces(input)).toContain('</span></span>​<span class="tablatura">next');
  });

  it('merges adjacent tablatura spans separated by a blank line', () => {
    const input = '</span></span>\n\n<span class="tablatura">next';
    expect(normalizeZeroWidthSpaces(input)).toContain('</span></span>​<span class="tablatura">next');
  });

  it('removes newlines immediately before a cnt span', () => {
    const input = 'line\n<span class="cnt">content</span>';
    expect(normalizeZeroWidthSpaces(input)).toBe('line<span class="cnt">content</span>');
  });
});
