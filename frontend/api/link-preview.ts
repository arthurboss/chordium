import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 10,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).send('MINIMAL_HANDLER_OK_V2');
}
