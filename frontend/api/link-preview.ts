import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decodeSharedChordSheet } from './_lib/decodeSharedChordSheet';
import { buildPreviewHtml } from './_lib/buildPreviewHtml';

export const config = {
  maxDuration: 10,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const d = typeof req.query.d === 'string' ? req.query.d : undefined;
    const payload = d ? decodeSharedChordSheet(d) : null;
    const canonicalUrl = `https://${req.headers.host}${req.url ?? ''}`;

    const shellResponse = await fetch(`https://${req.headers.host}/index.html`);
    const template = await shellResponse.text();

    const html = buildPreviewHtml(template, payload, canonicalUrl);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.status(200).send(html);
  } catch (err) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send(`DEBUG_ERROR: ${(err as Error)?.name}: ${(err as Error)?.message}\n${(err as Error)?.stack}`);
  }
}
