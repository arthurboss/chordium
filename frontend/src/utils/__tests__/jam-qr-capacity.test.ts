import { describe, it, expect } from 'vitest';
import { chooseJamShare, QR_URL_CHAR_LIMIT } from '../jam-qr-capacity';

/**
 * A QR code cannot hold an arbitrarily long song. Handing the encoder too much
 * throws `RangeError: Data too long`, which took the whole page down when
 * sharing a full arrangement with tabs, so the payload degrades instead.
 */

const short = (n = 500) => 'https://x.test/a/b?d=' + 'x'.repeat(n);
const long = (n = QR_URL_CHAR_LIMIT + 500) => 'https://x.test/a/b?d=' + 'y'.repeat(n);
const plain = 'https://x.test/extreme/more-than-words';

describe('chooseJamShare — degrading the payload to fit a QR code', () => {
  it('embeds the displayed arrangement when it fits', () => {
    const displayedUrl = short();

    expect(chooseJamShare({ displayedUrl, simplifiedUrl: short(100), plainUrl: plain })).toEqual({
      mode: 'displayed',
      url: displayedUrl,
    });
  });

  it('falls back to the simplified arrangement when the displayed one is too big', () => {
    const simplifiedUrl = short();

    const choice = chooseJamShare({ displayedUrl: long(), simplifiedUrl, plainUrl: plain });

    expect(choice).toEqual({ mode: 'simplified', url: simplifiedUrl });
  });

  it('falls back to a plain link when neither arrangement fits', () => {
    const choice = chooseJamShare({
      displayedUrl: long(),
      simplifiedUrl: long(QR_URL_CHAR_LIMIT + 10),
      plainUrl: plain,
    });

    expect(choice).toEqual({ mode: 'link', url: plain });
  });

  it('falls back to a plain link when the song has no separate simplified version', () => {
    const choice = chooseJamShare({ displayedUrl: long(), plainUrl: plain });

    expect(choice).toEqual({ mode: 'link', url: plain });
  });

  it('does not offer the simplified arrangement when it is the one already shown', () => {
    // Same URL means the simplified arrangement IS the displayed one, so
    // "share the simplified version instead" would be a meaningless message.
    const displayedUrl = long();

    const choice = chooseJamShare({ displayedUrl, simplifiedUrl: displayedUrl, plainUrl: plain });

    expect(choice.mode).toBe('link');
  });

  it('accepts a payload exactly at the limit', () => {
    const displayedUrl = 'z'.repeat(QR_URL_CHAR_LIMIT);

    expect(chooseJamShare({ displayedUrl, plainUrl: plain }).mode).toBe('displayed');
  });

  it('rejects a payload one character over the limit', () => {
    const displayedUrl = 'z'.repeat(QR_URL_CHAR_LIMIT + 1);

    expect(chooseJamShare({ displayedUrl, plainUrl: plain }).mode).toBe('link');
  });

  it('keeps the limit below the level-M QR capacity, leaving room for the origin', () => {
    // Level M tops out near 2331 bytes; the margin absorbs the host and path
    // that get prepended, which are far longer on preview URLs.
    expect(QR_URL_CHAR_LIMIT).toBeLessThan(2331);
  });
});
