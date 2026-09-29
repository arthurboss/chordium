import { gunzipSync } from 'node:zlib';
import type { JamPayload } from './types';

/**
 * Server-side counterpart to `encodeChordSheet`/`buildJamUrl` in
 * `src/utils/chordSheetQR.ts`. The `d` query param on a shared link is the
 * same gzip+base64url payload minus the `chordium:v1:` prefix (stripped by
 * `buildJamUrl` before it goes in the URL), so this only has to reverse the
 * gzip/base64url step, not re-add the prefix.
 *
 * Bounded to 1 MB decompressed so a crafted `d` value can't zip-bomb the
 * function; real payloads are a few KB at most.
 */
const MAX_DECOMPRESSED_BYTES = 1024 * 1024;

export function decodeSharedChordSheet(d: string): JamPayload | null {
  try {
    const bytes = Buffer.from(d, 'base64url');
    const json = gunzipSync(bytes, { maxOutputLength: MAX_DECOMPRESSED_BYTES }).toString('utf8');
    const payload = JSON.parse(json) as JamPayload;
    if (!payload.songChords || !payload.title || !payload.artist) return null;
    return payload;
  } catch {
    return null;
  }
}
