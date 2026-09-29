import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decodeSharedChordSheet } from './_lib/decodeSharedChordSheet';

export const config = {
  maxDuration: 10,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const result = decodeSharedChordSheet('test');
  res.status(200).send(`MINIMAL_HANDLER_OK result=${JSON.stringify(result)}`);
}
