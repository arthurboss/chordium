import { describe, it, expect } from 'vitest';
import { gzipSync } from 'node:zlib';
import { decodeSharedChordSheet } from '../decodeSharedChordSheet';

function encode(payload: unknown): string {
  const json = JSON.stringify(payload);
  return gzipSync(json).toString('base64url');
}

const VALID_PAYLOAD = {
  title: 'Neon',
  artist: 'John Mayer',
  songKey: 'C',
  guitarCapo: 0,
  guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  songChords: '[Verse]\nC D Em G',
};

describe('decodeSharedChordSheet', () => {
  it('decodes a gzip+base64url payload produced the same way the browser encodes it', () => {
    const result = decodeSharedChordSheet(encode(VALID_PAYLOAD));
    expect(result).toEqual(VALID_PAYLOAD);
  });

  it('returns null when songChords is missing', () => {
    const { songChords, ...rest } = VALID_PAYLOAD;
    expect(decodeSharedChordSheet(encode(rest))).toBeNull();
  });

  it('returns null for garbage input instead of throwing', () => {
    expect(decodeSharedChordSheet('not-a-valid-payload')).toBeNull();
  });

  it('returns null for a value that is not gzip data', () => {
    expect(decodeSharedChordSheet(Buffer.from('plain text').toString('base64url'))).toBeNull();
  });
});
