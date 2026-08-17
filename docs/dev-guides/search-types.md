# 🔍 Search & Artist-Songs Requests

A single query is matched against artists and songs at once; the backend tags each hit with which kind it is.

## 💾 IndexedDB Store: [searchCache](../../frontend/src/storage/types/search-cache.ts)

### 🔎 UNIFIED SEARCH

- **Search input:** `"hillsong"`: one field, whatever the user typed

- **API endpoint:** `/api/search`
- **Request URL path:** `/api/search?q=hillsong`
- **Response type:** [`SearchHit[]`](../../packages/types/src/search.ts). Each item is a [`Song`](../../packages/types/src/domain/song.ts) or an [`Artist`](../../packages/types/src/domain/artist.ts), tagged `type: 'song' | 'artist'`; a song additionally carries `match: 'title' | 'lyrics'` when it wasn't matched by title.
- **Frontend URL path:** `/search?q=hillsong` (adds `&section=artists|songs|lyrics` once a section is drilled into; client-side only, no new request)
- **Cache key:** the normalized query, kind `"search"`; see [`getNormalizedSearchCacheKey`](../../frontend/src/search/utils/normalization/getNormalizedSearchCacheKey.ts)

The frontend splits the response into up to three sections for display: **Artists** (`type === 'artist'`), **Songs** (`type === 'song' && match !== 'lyrics'`), and **Lyrics matches** (`type === 'song' && match === 'lyrics'`). A section with no matches isn't shown. See [Search Guide](../search-guide.md) for the resulting UX.

---

### 🎵 SONGS BY ARTIST

> Reached by opening an artist from the Artists section, the only place a single artist's own card appears.

- **API endpoint:** `/api/artist-songs`
- **Request URL path:** `/api/artist-songs?artistPath=hillsong-united`
- **Response type:** [`Song[]`](../../packages/types/src/domain/song.ts)
- **Frontend URL path:** `/hillsong-united` (`:artist`): a page of its own, not a `/search` query param
- **Cache key:** the artist's path, kind `"artist-songs"`

The artist's `displayName` (as returned by the search response, or a source-scraped song's own artist name once songs load) is cached separately so `/:artist` can show it without re-deriving a slug guess; see [`artist-display-name-cache.ts`](../../frontend/src/search/utils/artist/artist-display-name-cache.ts).

---

## 💾 IndexedDB Store: [chordSheets](../../frontend/src/storage/types/stored-chord-sheet.ts) / [metadata](../../frontend/src/storage/types/stored-song-metadata.ts)

### 🎼 CHORD SHEET

> Reached by picking a song from any songs list (a search's own, an artist's, or lyrics matches), or by landing directly on a song page (e.g. `/radiohead/creep`).

- **Path:** `"radiohead/creep"`: artist path plus song path, exactly as used in the frontend URL

- **API endpoints (same path in production and local dev):**
  - `/api/cifraclub-song?url=<path>`: metadata plus the preferred (simplified where available) chord sheet, in one request. Production is a Vercel function ([`frontend/api/cifraclub-song.ts`](../../frontend/api/cifraclub-song.ts)); local dev is the equivalent Express route in [`backend/routes/api.ts`](../../backend/routes/api.ts), explicitly commented as mirroring it.
  - `/api/cifraclub-song-full?url=<path>`: the full (tabbed) arrangement, fetched when the simplified/full toggle is used. Same production/dev split as above ([`frontend/api/cifraclub-song-full.ts`](../../frontend/api/cifraclub-song-full.ts)).
- **Frontend URL path:** `/radiohead/creep` (`:artist/:song`, plus `/letra` or `/simplificada` suffixes for the lyrics/simplified views)

`backend/routes/api.ts` also registers `/api/cifraclub-song-metadata` and `/api/cifraclub-chord-sheet` as separate endpoints (metadata and chord sheet content independently). These exist in the local Express backend only, with no equivalent Vercel function; the frontend always uses the combined `/api/cifraclub-song[-full]` above instead.

A song selected from a list navigates with `{ state: { song } }` so the target page has the song's basic identity immediately. The chord content itself is still fetched, or read from the `chordSheets` store if already cached; see [`frontend/src/storage/README.md`](../../frontend/src/storage/README.md).
