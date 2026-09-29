import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 10,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const r = await fetch(`https://${req.headers.host}/index.html`);
    const text = await r.text();
    res.status(200).send(`FETCH_OK status=${r.status} len=${text.length}`);
  } catch (err) {
    res.status(200).send(`FETCH_THREW: ${(err as Error)?.name}: ${(err as Error)?.message}`);
  }
}
