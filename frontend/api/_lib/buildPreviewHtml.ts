import type { JamPayload } from './types';
import { escapeHtml } from './escapeHtml';

const DESCRIPTION_META = /<meta name="description" content="[^"]*"\s*\/>/;
const TITLE_TAG = /<title>[^<]*<\/title>/;

/**
 * Injects per-song `og:*`/`twitter:*` tags (and the document title) into the
 * static SPA shell, so crawlers that never run the app's JS still see the
 * real song instead of the generic app description.
 *
 * `payload` is `null` when the shared link has no `d` param (e.g. a song too
 * large to embed, per `chooseJamShare`'s `'link'` fallback) or the value
 * failed to decode; the template is returned unchanged in that case since
 * there is nothing accurate to show.
 */
export function buildPreviewHtml(
  template: string,
  payload: JamPayload | null,
  canonicalUrl: string
): string {
  if (!payload) return template;

  const title = `${payload.title} — ${payload.artist} | Chordium`;
  const description = `Chords for "${payload.title}" by ${payload.artist} on Chordium.`;
  const ogImageUrl = new URL(
    `/api/og-image?${new URLSearchParams({ title: payload.title, artist: payload.artist })}`,
    canonicalUrl
  ).toString();

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonicalUrl = escapeHtml(canonicalUrl);
  const safeOgImageUrl = escapeHtml(ogImageUrl);

  const metaBlock = [
    `<meta name="description" content="${safeDescription}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDescription}" />`,
    `<meta property="og:url" content="${safeCanonicalUrl}" />`,
    `<meta property="og:image" content="${safeOgImageUrl}" />`,
    `<meta property="og:type" content="music.song" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDescription}" />`,
    `<meta name="twitter:image" content="${safeOgImageUrl}" />`,
  ].join('\n  ');

  return template
    .replace(TITLE_TAG, `<title>${safeTitle}</title>`)
    .replace(DESCRIPTION_META, metaBlock);
}
