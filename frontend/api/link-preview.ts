import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { decodeSharedChordSheet } from './_lib/decodeSharedChordSheet';
import { buildPreviewHtml } from './_lib/buildPreviewHtml';

export const config = {
  maxDuration: 10,
};

// Read once per cold start rather than per request; the built shell doesn't
// change until the next deploy.
const template = readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');

/**
 * Serves the SPA shell for a shared chord-sheet link, with `og:*`/`twitter:*`
 * tags filled in from the link's embedded payload.
 *
 * Only reached via the `vercel.json` rewrite that matches `/:artist/:song`
 * requests carrying a `d` query param (see `buildJamUrl` in
 * `src/utils/chordSheetQR.ts`); everything else keeps going straight to the
 * static `index.html` as before, so this never runs on the app's regular
 * traffic.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const d = typeof req.query.d === 'string' ? req.query.d : undefined;
  const payload = d ? decodeSharedChordSheet(d) : null;
  const canonicalUrl = `https://${req.headers.host}${req.url ?? ''}`;

  const html = buildPreviewHtml(template, payload, canonicalUrl);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).send(html);
}
