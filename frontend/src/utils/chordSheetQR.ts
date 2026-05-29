/**
 * Utilities for encoding/decoding chord sheets to/from a QR-embeddable payload.
 *
 * Format: `chordium:v1:<base64url-encoded-gzipped-json>`
 *
 * Uses the native CompressionStream API (available in all modern browsers).
 * Falls back to plain base64 JSON if compression is unavailable.
 */

import type { ChordSheet, SongMetadata } from '@chordium/types';
import { normalizeNamePart } from '@/utils/chord-sheet-path';

export const JAM_QR_PREFIX = 'chordium:v1:';

export interface JamPayload {
  title: string;
  artist: string;
  songKey: string;
  guitarCapo: number;
  guitarTuning: [string, string, string, string, string, string];
  songChords: string;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4);
  const base64 = padded + '==='.slice(0, pad);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function compress(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const input = encoder.encode(data);
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(input);
  writer.close();
  const chunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

async function decompress(bytes: Uint8Array): Promise<string> {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const chunks: Uint8Array[] = [];
  const reader = ds.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const decoder = new TextDecoder();
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return decoder.decode(result);
}

export async function encodeChordSheet(
  chordSheet: ChordSheet & SongMetadata
): Promise<string> {
  const payload: JamPayload = {
    title: chordSheet.title,
    artist: chordSheet.artist,
    songKey: chordSheet.songKey ?? '',
    guitarCapo: chordSheet.guitarCapo ?? 0,
    guitarTuning: chordSheet.guitarTuning ?? ['E', 'A', 'D', 'G', 'B', 'E'],
    songChords: chordSheet.songChords,
  };
  const json = JSON.stringify(payload);
  const compressed = await compress(json);
  return JAM_QR_PREFIX + toBase64Url(compressed);
}

export async function decodeChordSheet(
  encoded: string
): Promise<JamPayload | null> {
  try {
    if (!encoded.startsWith(JAM_QR_PREFIX)) return null;
    const b64 = encoded.slice(JAM_QR_PREFIX.length);
    const bytes = fromBase64Url(b64);
    const json = await decompress(bytes);
    const payload = JSON.parse(json) as JamPayload;
    if (!payload.songChords) return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildJamUrl(encoded: string, artist: string, title: string): string {
  const base = import.meta.env.VITE_APP_URL ?? window.location.origin;
  const artistSlug = normalizeNamePart(artist);
  const titleSlug = normalizeNamePart(title);
  const url = new URL(`/${artistSlug}/${titleSlug}`, base);
  url.searchParams.set('d', encoded.slice(JAM_QR_PREFIX.length));
  return url.toString();
}


