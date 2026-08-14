import type { SqlTag } from "@chordium/scraping";

let resolved: SqlTag | null | undefined;

/**
 * The database connection, when one is configured.
 *
 * Production runs on Vercel, which injects `POSTGRES_URL`. A local checkout
 * usually has no connection string, and search still has to work there, so this
 * returns nothing rather than throwing and the search falls back to the source
 * alone.
 */
export async function getSql(): Promise<SqlTag | undefined> {
  if (resolved !== undefined) return resolved ?? undefined;

  if (!process.env.POSTGRES_URL) {
    resolved = null;
    return undefined;
  }

  const { sql } = await import("@vercel/postgres");
  resolved = sql as unknown as SqlTag;
  return resolved;
}
