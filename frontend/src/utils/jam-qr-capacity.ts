/**
 * How much a QR code can hold, and which arrangement therefore fits.
 *
 * A QR code in byte mode tops out at 2953 bytes at the lowest error-correction
 * level and 2331 at level M, which is what we render. Handing the encoder more
 * than that makes it throw `RangeError: Data too long`, so callers pick a
 * strategy up front rather than letting the render blow up.
 */

/**
 * Usable characters in a level-M QR code, minus a safety margin.
 *
 * The margin absorbs the origin and song path that `buildJamUrl` prepends to
 * the payload, which vary by host (a preview URL is far longer than the
 * production domain) and by song title.
 */
export const QR_URL_CHAR_LIMIT = 2200;

export type JamShareMode =
  /** The arrangement on screen fits, so the code carries it verbatim. */
  | 'displayed'
  /** The displayed arrangement is too big, but the simplified one fits. */
  | 'simplified'
  /** Neither fits: the code carries a plain link with no embedded song. */
  | 'link';

export interface JamShareChoice {
  mode: JamShareMode;
  url: string;
}

/**
 * Picks the largest payload that still fits in a QR code.
 *
 * Order matters: the arrangement on screen is preferred so a scan reproduces
 * what the sharer sees, falling back to the simplified arrangement, and finally
 * to a bare link that needs a connection but always fits.
 */
export function chooseJamShare(candidates: {
  displayedUrl: string;
  simplifiedUrl?: string;
  plainUrl: string;
}): JamShareChoice {
  const { displayedUrl, simplifiedUrl, plainUrl } = candidates;

  if (displayedUrl.length <= QR_URL_CHAR_LIMIT) {
    return { mode: 'displayed', url: displayedUrl };
  }
  // Only worth offering when it is genuinely a different, smaller payload.
  if (
    simplifiedUrl &&
    simplifiedUrl !== displayedUrl &&
    simplifiedUrl.length <= QR_URL_CHAR_LIMIT
  ) {
    return { mode: 'simplified', url: simplifiedUrl };
  }
  return { mode: 'link', url: plainUrl };
}
