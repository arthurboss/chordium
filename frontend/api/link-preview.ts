import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decodeSharedChordSheet } from './_lib/decodeSharedChordSheet';

export const config = {
  maxDuration: 10,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const d = typeof req.query.d === 'string' ? req.query.d : undefined;
    const payload = d ? decodeSharedChordSheet(d) : null;
    res.status(200).send(`DECODE_RESULT: ${JSON.stringify(payload)}`);
  } catch (err) {
    res.status(200).send(`DECODE_THREW: ${(err as Error)?.name}: ${(err as Error)?.message}`);
  }
}
