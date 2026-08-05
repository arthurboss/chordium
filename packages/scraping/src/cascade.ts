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
  /**
   * Disabled before navigating: the source's print pages ship a script that
   * paginates the sheet and deletes overflow content from the DOM.
   */
  setJavaScriptEnabled?(enabled: boolean): Promise<void>;
}

interface RouteSpec {
  url: string;
  variant: ArrangementVariant;
  timeout: number;
}

/**
 * The source's print pages are fully server-rendered, but they also load a
 * script that paginates the sheet to the selected paper size and DELETES the
 * overflow from the DOM. Extracting after it runs yields a silently truncated
 * song, so JavaScript is disabled for the whole cascade.
 *
 * Measured on /oficina-g3/incondicional/simplificada/imprimir.html:
 *   JS enabled  -> pre.textContent = 1006 chars (truncated mid-song)
 *   JS disabled -> pre.textContent = 1266 chars (complete)
 *
 * This was previously environment-dependent: the extraction raced that script,
 * so slower networks happened to win and fast ones (serverless) lost.
 */
async function disablePageScripts(page: PageLike, logger?: (msg: string) => void): Promise<void> {
  if (!page.setJavaScriptEnabled) {
    logger?.("page cannot disable JavaScript — content may be truncated by the source's print script");
    return;
  }
  await page.setJavaScriptEnabled(false);
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
    await disablePageScripts(page, logger);
    // With scripts disabled the markup is complete at `domcontentloaded`, and
    // there is deliberately no settle delay: waiting would only give the
    // source's pagination script a chance to run and trim the sheet.
    await page.goto(url, { waitUntil: "domcontentloaded", timeout });

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
      const hasTabs = data.songChords.includes("{start_of_tab}");
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
