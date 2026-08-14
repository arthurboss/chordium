import type { Artist, SearchHit, Song, SongMatch } from "@chordium/types";

/**
 * The source's song index. Unlike the index behind its own search box, this one
 * honours a row limit, so a search can be answered completely rather than with
 * the first handful.
 */
export const SONG_SEARCH_URL = "https://solr.sscdn.co/cc/c7/";

/**
 * The artist index, which ranks by relevance and popularity. It caps its own
 * response at a dozen or so and ignores any attempt to page past that, which is
 * fine: a dozen well-ranked acts answers "who did I mean" better than hundreds
 * of substring matches would.
 */
export const ARTIST_SEARCH_URL = "https://solr.sscdn.co/letras/artist/";

/**
 * Rows asked for on the first attempt. Chosen to answer most searches in a
 * single request; the few that have more are asked for again in full.
 */
const SONG_ROWS = 500;

/** A song exactly as the source returns it. */
interface SourceSongDoc {
  /** "2" for a song. */
  tipo?: string;
  /** Song title. */
  txt?: string;
  /** Artist name. */
  art?: string;
  /** Artist slug. */
  dns?: string;
  /** Song slug. */
  url?: string;
}

/** An artist exactly as the source returns it. */
interface SourceArtistDoc {
  /** Artist name. */
  art?: string;
  /** Artist slug, shared with the chord sheet site. */
  dns?: string;
}

interface SolrResponse<T> {
  response?: { numFound?: number; docs?: T[] };
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
  /** Rows requested from the song index before asking for the rest. */
  rows?: number;
}

async function fetchSolr<T>(url: string): Promise<SolrResponse<T>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Search source responded ${response.status}`);
  }

  const body = (await response.text()).trim();
  // The artist index only speaks JSONP, so any padding comes off before parsing.
  const unpadded = body.replace(/^[A-Za-z_$][\w$]*\(/, "").replace(/\);?$/, "");
  return JSON.parse(unpadded);
}

function songUrl(query: string, rows: number): string {
  return `${SONG_SEARCH_URL}?search=2&q=${encodeURIComponent(query)}&limit=${rows}`;
}

function toSongHit(doc: SourceSongDoc): SearchHit | null {
  if (!doc.txt || !doc.dns || !doc.url) return null;
  return { type: "song", title: doc.txt, artist: doc.art ?? "", path: `${doc.dns}/${doc.url}` };
}

function toArtistHit(doc: SourceArtistDoc): SearchHit | null {
  if (!doc.art || !doc.dns) return null;
  return { type: "artist", displayName: doc.art, path: doc.dns, songCount: null };
}

/**
 * Every song the source has for a query.
 *
 * Asked for in one request where possible. The response reports how many exist
 * in total, so a query with more than the first request asked for is asked again
 * for exactly that many, rather than being silently cut short.
 */
export async function fetchSourceSongs(query: string, rows = SONG_ROWS): Promise<SearchHit[]> {
  let body = await fetchSolr<SourceSongDoc>(songUrl(query, rows));

  const total = body.response?.numFound ?? 0;
  const returned = body.response?.docs?.length ?? 0;
  if (total > returned) {
    body = await fetchSolr<SourceSongDoc>(songUrl(query, total));
  }

  return (body.response?.docs ?? []).flatMap((doc) => {
    const hit = toSongHit(doc);
    return hit ? [hit] : [];
  });
}

/** The artists the source considers the best answers to a query, in its order. */
export async function fetchSourceArtists(query: string): Promise<SearchHit[]> {
  const url = `${ARTIST_SEARCH_URL}?q=${encodeURIComponent(query)}&wt=json&callback=LetrasArtists`;
  const body = await fetchSolr<SourceArtistDoc>(url);

  return (body.response?.docs ?? []).flatMap((doc) => {
    const hit = toArtistHit(doc);
    return hit ? [hit] : [];
  });
}

/** Words, lowercased and stripped of accents so "Legiao" reaches "Legião". */
function tokenize(text: string): string[] {
  return (text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Whether a word from the query is answered by one of these words. Either being a
 * prefix of the other lets "eagles" reach "Eagle's Wings", which is the kind of
 * near-miss the source itself matches on.
 */
function answers(queryWord: string, words: string[]): boolean {
  return words.some((word) => word.startsWith(queryWord) || queryWord.startsWith(word));
}

/**
 * Why a song came back, worked out from its title and artist.
 *
 * The source gives no field for this: it matches titles, artist names and the
 * words of a song alike, and the scoring features it returns describe how a
 * result was ranked rather than why it was included. So the answer is derived
 * from the only two pieces of text it does give.
 *
 * - Every word of the query accounted for, at least one of them by the title:
 *   the search names this song. "eagles hotel california" lands here, its title
 *   carrying two words and the artist the third.
 * - Every word accounted for but none by the title: the song is here only because
 *   its artist matched. Those are left out entirely, since the artist is already
 *   listed and opening them is how their songs are meant to be reached.
 * - Anything else: the query is somewhere in the words of the song.
 */
function classifySong(query: string, hit: SearchHit & { type: "song" }): SongMatch | null {
  const queryWords = tokenize(query);
  const titleWords = tokenize(hit.title);
  const artistWords = tokenize(hit.artist);

  const accountedFor = queryWords.every((word) => answers(word, [...titleWords, ...artistWords]));
  if (!accountedFor) return "lyrics";

  return queryWords.some((word) => answers(word, titleWords)) ? "title" : null;
}

function keyOf(hit: SearchHit): string {
  return `${hit.type}:${hit.path}`;
}

/** `%` and `_` are wildcards to ILIKE, so a query containing them is escaped. */
function escapeForLike(query: string): string {
  return query.replace(/[%_]/g, "\\$&");
}

/**
 * Searches artists and songs together from one query string.
 *
 * The source answers both, and our own tables stand behind it: they are read only
 * when the source cannot be reached, since it returns every song it has for a
 * query and ranks artists properly, whereas a substring match over our own rows
 * has no notion of relevance and would offer "Beagles" for "eagles".
 *
 * Artists come first in the returned list, songs after.
 */
export async function unifiedSearch({
  query,
  sql,
  rows = SONG_ROWS,
}: UnifiedSearchOptions): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const [songsResult, artistsResult] = await Promise.allSettled([
    fetchSourceSongs(trimmed, rows),
    fetchSourceArtists(trimmed),
  ]);

  let songs = songsResult.status === "fulfilled" ? songsResult.value : [];
  let artists = artistsResult.status === "fulfilled" ? artistsResult.value : [];

  const songsFailed = songsResult.status === "rejected";
  const artistsFailed = artistsResult.status === "rejected";

  // Whatever the source could not answer for, fall back to what we hold.
  if (sql && (songsFailed || artistsFailed)) {
    const stored = await fetchStored({ sql, query: trimmed, songs: songsFailed, artists: artistsFailed });
    if (songsFailed) songs = stored.songs;
    if (artistsFailed) artists = stored.artists;
  }

  // Both sides unreachable with nothing held back is a failed search, not an
  // empty one: saying so is the difference between "no such song" and "we could
  // not look".
  if (songsFailed && artistsFailed && songs.length === 0 && artists.length === 0) {
    throw songsResult.reason;
  }

  // A song reached only through its artist is left out: that artist is already in
  // the list above, and opening them is how their songs are meant to be reached.
  const classified = songs.flatMap((hit): SearchHit[] => {
    if (hit.type !== "song") return [hit];
    const match = classifySong(trimmed, hit);
    return match ? [{ ...hit, match }] : [];
  });

  // Artists first, always. A query matches far fewer acts than songs, so the
  // shorter list reads as a way to narrow down rather than as something in the
  // way, and the act someone named stays visible without scrolling past their
  // back catalogue. Songs the search names come before songs that merely contain
  // it, so the weaker kind cannot crowd out the stronger.
  const ordered = [
    ...artists,
    ...classified.filter((hit) => hit.type === "song" && hit.match === "title"),
    ...classified.filter((hit) => hit.type === "song" && hit.match === "lyrics"),
  ];

  const seen = new Set<string>();
  const merged = ordered.filter((hit) => {
    const key = keyOf(hit);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (sql) {
    void seedStoredRows({ sql, merged });
  }

  return merged;
}

interface FetchStoredInput {
  sql: SqlTag;
  query: string;
  songs: boolean;
  artists: boolean;
}

async function fetchStored({
  sql,
  query,
  songs,
  artists,
}: FetchStoredInput): Promise<{ songs: SearchHit[]; artists: SearchHit[] }> {
  const pattern = `%${escapeForLike(query)}%`;

  const [songRows, artistRows] = await Promise.allSettled([
    songs
      ? sql<Song>`
          SELECT title, artist, path
          FROM songs
          WHERE title ILIKE ${pattern} OR artist ILIKE ${pattern}
          ORDER BY title
          LIMIT 200
        `
      : Promise.resolve({ rows: [] as Song[] }),
    artists
      ? sql<Artist>`
          SELECT "displayName", path, "songCount"
          FROM artists
          WHERE "displayName" ILIKE ${pattern}
          LIMIT 50
        `
      : Promise.resolve({ rows: [] as Artist[] }),
  ]);

  return {
    songs:
      songRows.status === "fulfilled"
        ? songRows.value.rows.map((song): SearchHit => ({ ...song, type: "song" }))
        : [],
    artists:
      artistRows.status === "fulfilled"
        ? artistRows.value.rows.map((artist): SearchHit => ({ ...artist, type: "artist" }))
        : [],
  };
}

interface SeedStoredRowsInput {
  sql: SqlTag;
  merged: SearchHit[];
}

/**
 * Records what the source knew, so a later search can still be answered if it
 * becomes unreachable. Deliberately not awaited and individually caught: seeding
 * is a side benefit, never a reason to fail a search.
 */
function seedStoredRows({ sql, merged }: SeedStoredRowsInput): void {
  const writes = merged.map((hit) =>
    hit.type === "artist"
      ? sql`
          INSERT INTO artists ("displayName", path, "songCount")
          VALUES (${hit.displayName}, ${hit.path}, ${hit.songCount})
          ON CONFLICT (path) DO NOTHING
        `.catch(() => undefined)
      : sql`
          INSERT INTO songs (title, artist, path)
          VALUES (${hit.title}, ${hit.artist}, ${hit.path})
          ON CONFLICT (path) DO NOTHING
        `.catch(() => undefined)
  );

  void Promise.all(writes).catch(() => undefined);
}
