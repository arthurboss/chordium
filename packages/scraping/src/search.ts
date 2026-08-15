import type { Artist, SearchHit, Song, SongMatch } from "@chordium/types";

/**
 * The source's song index. Unlike the index behind its own search box, this one
 * honours a row limit, so a search can be answered properly rather than with the
 * first handful.
 */
export const SONG_SEARCH_URL = "https://solr.sscdn.co/cc/c7/";

/**
 * The artist index, which ranks by relevance and popularity. It caps its own
 * response at a dozen or so and ignores any attempt to page past that.
 */
export const ARTIST_SEARCH_URL = "https://solr.sscdn.co/letras/artist/";

/**
 * Rows asked for on the first attempt.
 *
 * Most searches are answered by this alone: a query naming a song is met by songs
 * of that name, which the source ranks first. Only a query that turns out to be
 * mostly one artist's catalogue needs more, and it asks for more only then.
 */
const FIRST_ROWS = 50;

/**
 * The most rows ever asked for. The source reports tens of thousands of matches
 * for an ordinary word - a hundred thousand for "love" - and every row costs
 * about three quarters of a kilobyte whether it is wanted or not, so the window
 * is bounded rather than following whatever total is reported.
 */
const MAX_ROWS = 500;

/**
 * How many songs matched through their words are kept. These are the weakest
 * results and the longest tail, so the section is trimmed to a browsable few
 * while songs named by the search are all kept.
 */
export const LYRICS_LIMIT = 25;

/** A song exactly as the source returns it. */
interface SourceSongDoc {
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
  art?: string;
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
  /** Omitted when no database is configured; the search then runs on the source alone. */
  sql?: SqlTag;
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

/** Words, lowercased and stripped of accents so "Legiao" reaches "Legião". */
function tokenize(text: string): string[] {
  return (text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Whether a word from the query is answered by one of these words. Either being a
 * prefix of the other lets "eagles" reach "Eagle's Wings".
 */
function answers(queryWord: string, words: string[]): boolean {
  return words.some((word) => word.startsWith(queryWord) || queryWord.startsWith(word));
}

/**
 * Why a song came back, worked out from its title and artist.
 *
 * The source gives no field for this: it matches titles, artist names and the
 * words of a song alike, and the scoring features it returns describe how a
 * result was ranked rather than why it was included.
 *
 * Returns null for a song reached only through its artist. Those are left out:
 * the artist is listed in their own right, and opening them is how their songs
 * are meant to be reached.
 */
function classifySong(query: string, title: string, artist: string): SongMatch | null {
  const queryWords = tokenize(query);
  const titleWords = tokenize(title);
  const artistWords = tokenize(artist);

  if (!queryWords.every((word) => answers(word, [...titleWords, ...artistWords]))) {
    return "lyrics";
  }
  return queryWords.some((word) => answers(word, titleWords)) ? "title" : null;
}

interface SongPage {
  titled: SearchHit[];
  lyrical: SearchHit[];
  /** Rows the source holds in total, which is far more than is ever asked for. */
  total: number;
  fetched: number;
}

async function fetchSongPage(query: string, rows: number): Promise<SongPage> {
  const url = `${SONG_SEARCH_URL}?search=2&q=${encodeURIComponent(query)}&limit=${rows}`;
  const body = await fetchSolr<SourceSongDoc>(url);
  const docs = body.response?.docs ?? [];

  const titled: SearchHit[] = [];
  const lyrical: SearchHit[] = [];
  for (const doc of docs) {
    if (!doc.txt || !doc.dns || !doc.url) continue;
    const match = classifySong(query, doc.txt, doc.art ?? "");
    if (!match) continue;
    const hit: SearchHit = {
      type: "song",
      title: doc.txt,
      artist: doc.art ?? "",
      path: `${doc.dns}/${doc.url}`,
      match,
    };
    (match === "title" ? titled : lyrical).push(hit);
  }

  return { titled, lyrical, total: body.response?.numFound ?? docs.length, fetched: docs.length };
}

/**
 * The songs for a query, asking for as few rows as will do.
 *
 * A first small request answers most searches outright. It falls short only when
 * the results turn out to be mostly one artist's catalogue, which is discarded,
 * and that shows up as too few songs to fill the sections; then, and only then,
 * a wider request is made.
 */
export async function fetchSourceSongs(query: string): Promise<SongPage> {
  const first = await fetchSongPage(query, FIRST_ROWS);

  const exhausted = first.fetched >= first.total;
  const enough = first.lyrical.length >= LYRICS_LIMIT;
  if (exhausted || enough) return first;

  return fetchSongPage(query, Math.min(first.total, MAX_ROWS));
}

/**
 * The songs the source holds for one artist, found by searching their name and
 * keeping only what belongs to them.
 *
 * Deliberately separate from the search proper, which discards songs reached
 * through their artist: here that is precisely what is wanted. A last resort for
 * when the artist's own page cannot be read.
 */
export async function fetchSongsForArtist(artistPath: string): Promise<Song[]> {
  const name = artistPath.replace(/-/g, " ");
  const url = `${SONG_SEARCH_URL}?search=2&q=${encodeURIComponent(name)}&limit=${MAX_ROWS}`;
  const body = await fetchSolr<SourceSongDoc>(url);

  return (body.response?.docs ?? []).flatMap((doc): Song[] => {
    // Searched by name, so anything belonging to another artist is dropped.
    if (!doc.txt || !doc.url || doc.dns !== artistPath) return [];
    return [{ title: doc.txt, artist: doc.art ?? "", path: `${doc.dns}/${doc.url}` }];
  });
}

/** The artists the source considers the best answers to a query, in its order. */
export async function fetchSourceArtists(query: string): Promise<SearchHit[]> {
  const url = `${ARTIST_SEARCH_URL}?q=${encodeURIComponent(query)}&wt=json&callback=LetrasArtists`;
  const body = await fetchSolr<SourceArtistDoc>(url);

  return (body.response?.docs ?? []).flatMap((doc) =>
    doc.art && doc.dns
      ? [{ type: "artist", displayName: doc.art, path: doc.dns, songCount: null } as SearchHit]
      : []
  );
}

/** `%` and `_` are wildcards to ILIKE, so a query containing them is escaped. */
function escapeForLike(query: string): string {
  return query.replace(/[%_]/g, "\\$&");
}

/**
 * Artists held in our own tables whose name contains the query anywhere.
 *
 * Worth reading alongside the source rather than only when it fails: the source
 * matches the starts of words, so "eagle" reaches "Eagle-Eye Cherry" but never
 * "Beagles", and it holds nothing for acts the mirror has picked up since. A
 * plain substring match finds both.
 */
async function fetchStoredArtists(sql: SqlTag, query: string, limit = 100): Promise<SearchHit[]> {
  const { rows } = await sql<Artist>`
    SELECT "displayName", path, "songCount"
    FROM artists
    WHERE "displayName" ILIKE ${`%${escapeForLike(query)}%`}
    ORDER BY "displayName"
    LIMIT ${limit}
  `;
  return rows.map((artist): SearchHit => ({ ...artist, type: "artist" }));
}

async function fetchStoredSongs(sql: SqlTag, query: string, limit = 200): Promise<SearchHit[]> {
  const pattern = `%${escapeForLike(query)}%`;
  const { rows } = await sql<Song>`
    SELECT title, artist, path
    FROM songs
    WHERE title ILIKE ${pattern} OR artist ILIKE ${pattern}
    ORDER BY title
    LIMIT ${limit}
  `;
  return rows.flatMap((song): SearchHit[] => {
    const match = classifySong(query, song.title, song.artist);
    return match ? [{ ...song, type: "song", match }] : [];
  });
}

/**
 * Merges two lists of the same kind, keeping the first one's order and adding only
 * what the second holds that the first does not.
 *
 * The database mirrors the source, so most of what comes back appears in both.
 * The source is ranked and goes first; our own rows follow, contributing whatever
 * it did not know about.
 */
function mergeByPath(ranked: SearchHit[], extra: SearchHit[]): SearchHit[] {
  const seen = new Set(ranked.map((hit) => `${hit.type}:${hit.path}`));
  const merged = [...ranked];
  for (const hit of extra) {
    const key = `${hit.type}:${hit.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(hit);
  }
  return merged;
}

export async function unifiedSearch({
  query,
  sql,
}: UnifiedSearchOptions): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const [songsResult, artistsResult, storedArtistsResult, storedSongsResult] =
    await Promise.allSettled([
      fetchSourceSongs(trimmed),
      fetchSourceArtists(trimmed),
      sql ? fetchStoredArtists(sql, trimmed) : Promise.resolve([]),
      sql ? fetchStoredSongs(sql, trimmed) : Promise.resolve([]),
    ]);

  const songs: SongPage =
    songsResult.status === "fulfilled"
      ? songsResult.value
      : { titled: [], lyrical: [], total: 0, fetched: 0 };
  const sourceArtists = artistsResult.status === "fulfilled" ? artistsResult.value : [];
  const storedArtists = storedArtistsResult.status === "fulfilled" ? storedArtistsResult.value : [];
  const storedSongs = storedSongsResult.status === "fulfilled" ? storedSongsResult.value : [];

  const bothSourcesFailed =
    songsResult.status === "rejected" && artistsResult.status === "rejected";
  if (bothSourcesFailed && storedArtists.length === 0 && storedSongs.length === 0) {
    // Nothing answered and nothing held: a failed search, not an empty one.
    throw songsResult.reason;
  }

  const artists = mergeByPath(sourceArtists, storedArtists);
  const titled = mergeByPath(
    songs.titled,
    storedSongs.filter((hit) => hit.type === "song" && hit.match === "title")
  );
  const lyrical = mergeByPath(
    songs.lyrical,
    storedSongs.filter((hit) => hit.type === "song" && hit.match === "lyrics")
  );

  // Artists first: a query matches far fewer acts than songs, so the short list
  // reads as a way to narrow down. Songs the search names come before songs that
  // merely mention it, which the list itself trims to a browsable few while still
  // reporting how many were found.
  const hits = [...artists, ...titled, ...lyrical];

  if (sql) {
    void seedStoredRows({ sql, hits });
  }

  return hits;
}

interface SeedStoredRowsInput {
  sql: SqlTag;
  hits: SearchHit[];
}

/**
 * Records what the source knew, so a later search can still be answered if it
 * becomes unreachable. Deliberately not awaited and individually caught: seeding
 * is a side benefit, never a reason to fail a search.
 */
function seedStoredRows({ sql, hits }: SeedStoredRowsInput): void {
  const writes = hits.map((hit) =>
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
