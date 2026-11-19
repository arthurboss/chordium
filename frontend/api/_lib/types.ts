/**
 * Mirrors `JamPayload` in `src/utils/chordSheetQR.ts` — the shape encoded
 * into a shared link's `d` query param. Duplicated rather than imported so
 * this serverless function has no dependency on the browser-side app code
 * (which assumes DOM/vite types the Node function runtime doesn't have).
 */
export interface JamPayload {
  title: string;
  artist: string;
  songKey: string;
  guitarCapo: number;
  guitarTuning: [string, string, string, string, string, string];
  songChords: string;
}
