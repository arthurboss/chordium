import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildPreviewHtml } from './_lib/buildPreviewHtml';

export const config = {
  maxDuration: 10,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const result = buildPreviewHtml('<html></html>', null, 'https://x.com');
  res.status(200).send(`MINIMAL_HANDLER_OK result=${JSON.stringify(result)}`);
}
