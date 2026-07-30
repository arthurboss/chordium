import type { ChordSheet, SongMetadata } from "@chordium/types";
import { extractFullChordSheet } from "./extractors";

export type ArrangementVariant = "simplified" | "full" | "regular";

export interface CascadeResult {
  data: ChordSheet & SongMetadata;
  variant: ArrangementVariant;
  hasTabs: boolean;
}

/**
 * Minimal Puppeteer page surface used by the cascade. Both `puppeteer` and
 * `puppeteer-core` Page instances satisfy this, so the cascade works with the
 * Express backend and the Vercel serverless functions alike.
 */
export interface PageLike {
  goto(url: string, opts?: { waitUntil?: string; timeout?: number }): Promise<unknown>;
  url(): string;
  evaluate<T>(fn: () => T): Promise<T>;
  setDefaultNavigationTimeout?(timeout: number): void;
}

interface RouteSpec {
  url: string;
  variant: ArrangementVariant;
  timeout: number;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Loads a single URL and extracts content + metadata in one page evaluation.
 * Returns null when the page redirected away from the requested path (variant
 * not available) or yielded no chord content.
 */
async function tryLoadVariant(
  page: PageLike,
  url: string,
  timeout: number,
  logger?: (msg: string) => void
): Promise<(ChordSheet & SongMetadata) | null> {
  try {
    page.setDefaultNavigationTimeout?.(timeout);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout });
    await delay(1000);

    const expectedPath = new URL(url).pathname.replace(/\/+$/, "").toLowerCase();
    const finalPath = new URL(page.url()).pathname.replace(/\/+$/, "").toLowerCase();
    if (!finalPath.startsWith(expectedPath)) {
      logger?.(`redirected from ${url} to ${page.url()} — variant unavailable`);
      return null;
    }

    const data = await page.evaluate(extractFullChordSheet);
    if (!data?.songChords?.trim()) {
      logger?.(`${url} yielded no chord content`);
      return null;
    }
    return data;
  } catch (error) {
    logger?.(`variant load failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function runCascade(
  page: PageLike,
  routes: RouteSpec[],
  logger?: (msg: string) => void
): Promise<CascadeResult> {
  for (const route of routes) {
    logger?.(`cascade: trying ${route.variant} → ${route.url}`);
    const data = await tryLoadVariant(page, route.url, route.timeout, logger);
    if (data) {
      const hasTabs = data.songChords.includes("[TAB]");
      logger?.(`cascade hit: ${route.variant} (hasTabs=${hasTabs})`);
      return { data, variant: route.variant, hasTabs };
    }
  }
  throw Object.assign(new Error(`No chord sheet found via cascade`), { code: "NOT_FOUND" });
}

/** Normalizes a base song URL (ensures no trailing slash). */
function normalizeBase(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

/**
 * Fetches a song preferring the simplified arrangement, cascading:
 *   1. {base}/simplificada/imprimir.html — simplified print (easy chords, light)
 *   2. {base}/imprimir.html              — full print (light)
 *   3. {base}/                           — regular route (heaviest, most reliable)
 */
export async function fetchPreferredChordSheet(
  page: PageLike,
  baseUrl: string,
  logger?: (msg: string) => void
): Promise<CascadeResult> {
  const base = normalizeBase(baseUrl);
  return runCascade(page, [
    { url: `${base}/simplificada/imprimir.html`, variant: "simplified", timeout: 8000 },
    { url: `${base}/imprimir.html`, variant: "full", timeout: 10000 },
    { url: `${base}/`, variant: "regular", timeout: 20000 },
  ], logger);
}

/**
 * Fetches the full arrangement (with tabs) for the simplified/full toggle.
 * Cascades: full print → regular route.
 */
export async function fetchFullChordSheet(
  page: PageLike,
  baseUrl: string,
  logger?: (msg: string) => void
): Promise<CascadeResult> {
  const base = normalizeBase(baseUrl);
  return runCascade(page, [
    { url: `${base}/imprimir.html`, variant: "full", timeout: 10000 },
    { url: `${base}/`, variant: "regular", timeout: 20000 },
  ], logger);
}
