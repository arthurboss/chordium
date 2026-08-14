import type { Artist, SearchHit, Song } from "@chordium/types";

/**
 * The source's own instant-search index. One query returns artists and songs
 * ranked against each other in a single response, which is why the app needs
 * only one search box rather than one field per kind.
 */
export const SOURCE_SEARCH_URL = "https://solr.sscdn.co/cc/h2/";

/** A document exactly as the source returns it. */
interface SourceDoc {
  /** "1" for an artist, "2" for a song. */
  t: "1" | "2";
  /** Artist name for an artist, song title for a song. */
  m: string;
  /** Artist name. */
  a: string;
  /** Artist slug. */
  d: string;
  /** Song slug. Songs only. */
  u?: string;
}

/**
 * A tagged-template SQL function, as both `@vercel/postgres` and a plain Neon
 * client expose. Taking it as an argument keeps this package free of a database
 * dependency and lets the same search run in the serverless functions and in the
 * local dev server.
 */
export type SqlTag = <T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<{ rows: T[] }>;

export interface UnifiedSearchOptions {
  query: string;
  /**
   * Omitted when no database is configured, in which case the search runs
   * against the source alone rather than failing.
   */
  sql?: SqlTag;
  limit?: number;
}

export async function fetchSourceDocs(query: string): Promise<SourceDoc[]> {
  const url = `${SOURCE_SEARCH_URL}?q=${encodeURIComponent(query)}&callback=x`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Search source responded ${response.status}`);
  }
  // The endpoint only speaks JSONP, so the padding comes off before parsing.
  const padded = (await response.text()).trim();
  const json = padded.replace(/^x\(/, "").replace(/\)$/, "");
  return JSON.parse(json).response?.docs ?? [];
}

/** Reads the source's documents as hits, keeping the order it ranked them in. */
export function toSearchHits(docs: SourceDoc[]): SearchHit[] {
  const hits: SearchHit[] = [];
  for (const doc of docs) {
    if (doc.t === "1" && doc.d) {
      hits.push({ type: "artist", displayName: doc.m, path: doc.d, songCount: null });
    } else if (doc.t === "2" && doc.d && doc.u) {
      hits.push({ type: "song", title: doc.m, artist: doc.a, path: `${doc.d}/${doc.u}` });
    }
  }
  return hits;
}

function keyOf(hit: SearchHit): string {
  return `${hit.type}:${hit.path}`;
}

/** `%` and `_` are wildcards to ILIKE, so a query containing them is escaped. */
function escapeForLike(query: string): string {
  return query.replace(/[%_]/g, "\\$&");
}

export interface MergeSearchHitsInput {
  /** The source's hits, in the order it ranked them. */
  ranked: SearchHit[];
  storedArtists: Artist[];
  storedSongs: Song[];
}

/**
 * Builds one list out of the source's ranking and our own stored rows.
 *
 * The source's order is the spine: it is the only one of the two that ranks by
 * relevance, whereas our own rows come back from a substring match sorted by
 * title, so leading with them would bury the best answer under whatever happens
 * to start with an early letter. Stored rows still follow as a long tail, so a
 * query that the source misses is not left with nothing.
 */
export function mergeSearchHits({
  ranked,
  storedArtists,
  storedSongs,
}: MergeSearchHitsInput): SearchHit[] {
  const storedArtistsByPath = new Map(storedArtists.map((artist) => [artist.path, artist]));

  const merged: SearchHit[] = ranked.map((hit) => {
    if (hit.type !== "artist") return hit;
    // The source never says how many songs an artist has, but our own row does
    // once that artist's page has been opened, so the count is worth keeping.
    const stored = storedArtistsByPath.get(hit.path);
    return stored?.songCount != null ? { ...hit, songCount: stored.songCount } : hit;
  });

  const seen = new Set(merged.map(keyOf));
  const appendUnseen = (hit: SearchHit) => {
    if (seen.has(keyOf(hit))) return;
    seen.add(keyOf(hit));
    merged.push(hit);
  };

  for (const song of storedSongs) appendUnseen({ ...song, type: "song" });
  for (const artist of storedArtists) appendUnseen({ ...artist, type: "artist" });

  return merged;
}

/**
 * Searches artists and songs together from one query string.
 *
 * The source and our own tables are read at the same time and neither is allowed
 * to fail the request: whichever answers contributes what it has.
 */
export async function unifiedSearch({
  query,
  sql,
  limit = 50,
}: UnifiedSearchOptions): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const pattern = `%${escapeForLike(trimmed)}%`;

  const [sourceResult, artistsResult, songsResult] = await Promise.allSettled([
    fetchSourceDocs(trimmed),
    sql
      ? sql<Artist>`
          SELECT "displayName", path, "songCount"
          FROM artists
          WHERE "displayName" ILIKE ${pattern}
          LIMIT ${limit}
        `
      : Promise.resolve({ rows: [] as Artist[] }),
    sql
      ? sql<Song>`
          SELECT title, artist, path
          FROM songs
          WHERE title ILIKE ${pattern} OR artist ILIKE ${pattern}
          ORDER BY title
          LIMIT ${limit}
        `
      : Promise.resolve({ rows: [] as Song[] }),
  ]);

  const ranked = sourceResult.status === "fulfilled" ? toSearchHits(sourceResult.value) : [];
  const storedArtists = artistsResult.status === "fulfilled" ? artistsResult.value.rows : [];
  const storedSongs = songsResult.status === "fulfilled" ? songsResult.value.rows : [];

  const merged = mergeSearchHits({ ranked, storedArtists, storedSongs });

  // An unreachable source with nothing stored to fall back on is a failed search,
  // not an empty one, and saying so is the difference between "no such song" and
  // "we could not look". Stored rows, when there are any, still count as an answer.
  if (sourceResult.status === "rejected" && merged.length === 0) {
    throw sourceResult.reason;
  }

  if (sql) {
    void seedStoredRows({ sql, merged, storedArtists, storedSongs });
  }

  return merged;
}

interface SeedStoredRowsInput {
  sql: SqlTag;
  merged: SearchHit[];
  storedArtists: Artist[];
  storedSongs: Song[];
}

/**
 * Records what the source knew and we did not, so a later search can answer from
 * our own tables even if the source is unreachable. Deliberately not awaited and
 * individually caught: seeding is a side benefit, never a reason to fail a search.
 */
function seedStoredRows({ sql, merged, storedArtists, storedSongs }: SeedStoredRowsInput): void {
  const knownArtists = new Set(storedArtists.map((artist) => artist.path));
  const knownSongs = new Set(storedSongs.map((song) => song.path));

  const writes = merged.flatMap((hit) => {
    if (hit.type === "artist") {
      if (knownArtists.has(hit.path)) return [];
      return [
        sql`
          INSERT INTO artists ("displayName", path, "songCount")
          VALUES (${hit.displayName}, ${hit.path}, ${hit.songCount})
          ON CONFLICT (path) DO NOTHING
        `.catch(() => undefined),
      ];
    }
    if (knownSongs.has(hit.path)) return [];
    return [
      sql`
        INSERT INTO songs (title, artist, path)
        VALUES (${hit.title}, ${hit.artist}, ${hit.path})
        ON CONFLICT (path) DO NOTHING
      `.catch(() => undefined),
    ];
  });

  void Promise.all(writes).catch(() => undefined);
}
