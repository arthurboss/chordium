import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decodeSharedChordSheet } from './_lib/decodeSharedChordSheet';
import { buildPreviewHtml } from './_lib/buildPreviewHtml';

export const config = {
  maxDuration: 10,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const payload = decodeSharedChordSheet('test');
  const html = buildPreviewHtml('<html></html>', payload, 'https://x.com');
  res.status(200).send(`MINIMAL_HANDLER_OK result=${JSON.stringify(html)}`);
}
