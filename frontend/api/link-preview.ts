import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decodeSharedChordSheet } from './_lib/decodeSharedChordSheet';
import { buildPreviewHtml } from './_lib/buildPreviewHtml';

export const config = {
  maxDuration: 10,
};

/**
 * Serves the SPA shell for a shared chord-sheet link, with `og:*`/`twitter:*`
 * tags filled in from the link's embedded payload.
 *
 * Only reached via the `vercel.json` rewrite that matches `/:artist/:song`
 * requests carrying a `d` query param (see `buildJamUrl` in
 * `src/utils/chordSheetQR.ts`); everything else keeps going straight to the
 * static `index.html` as before, so this never runs on the app's regular
 * traffic.
 *
 * The shell is fetched from this deployment's own `/index.html` rather than
 * read off disk: a Serverless Function's bundle doesn't reliably contain
 * build output living outside `api/`, and `includeFiles` path resolution
 * silently fails cold-start-wide instead of erroring per request. Fetching
 * the real static asset has no such assumption to get wrong.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const d = typeof req.query.d === 'string' ? req.query.d : undefined;
  const payload = d ? decodeSharedChordSheet(d) : null;
  const canonicalUrl = `https://${req.headers.host}${req.url ?? ''}`;

  const shellResponse = await fetch(`https://${req.headers.host}/index.html`);
  const template = await shellResponse.text();

  const html = buildPreviewHtml(template, payload, canonicalUrl);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).send(html);
}
