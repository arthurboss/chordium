# Chordium Cache Architecture

## Overview

Chordium caches on the frontend only, entirely in **IndexedDB** (one database, `chordium-v1`), to cut down on redundant network requests and keep already-viewed content available offline. There's no `localStorage`-based cache and no separate in-memory cache layer: everything reads and writes through the stores under `frontend/src/storage/`.

For the user-facing behavior (what's kept, for how long, and why), see [`frontend/src/storage/README.md`](../frontend/src/storage/README.md); this document covers the technical layout underneath it, scoped to how it relates to search and chord sheet retrieval. See [Search & Artist-Songs Requests](./dev-guides/search-types.md) for which request maps to which cache entry.

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│              IndexedDB: "chordium-v1"                    │
├───────────────────────────┬────────────────────────────────┤
│      searchCache store    │       chordSheets store        │
│                           │                                 │
│ • keyed by normalized     │ • keyed by "artist/song" path   │
│   query or artist path    │ • saved sheets never expire     │
│ • 30-day TTL              │ • unsaved: 7-day TTL            │
└───────────────────────────┴────────────────────────────────┘
                              │
                     cleanup service (below)
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│                          Backend                          │
│  /api/search · /api/artist-songs · /api/cifraclub-song*   │
│  No caching on this side: every request scrapes fresh.    │
└──────────────────────────────────────────────────────────┘
```

## File Structure

```
frontend/src/storage/
├── core/
│   ├── config/database.ts     # DB_NAME ("chordium-v1"), DB_VERSION
│   └── ttl/
│       ├── constants.ts       # TTL and LIMITS constants (see below)
│       ├── cache-expiration.ts
│       ├── limits.ts
│       └── validation.ts
├── types/                     # StoredRecord, StoredSongMetadata, StoredChordSheet, SearchCacheItem, schema
├── services/
│   ├── search-cache/
│   │   └── search-cache-service.ts   # get()/storeResults() - what useSearchFetch.ts and fetch-artist-songs.ts call
│   └── cleanup/                       # see "Cleanup" below
├── stores/
│   ├── search-cache/operations/       # low-level IndexedDB reads/writes for the searchCache store
│   └── chord-sheets/operations/       # low-level IndexedDB reads/writes for the chordSheets store
└── hooks/                      # React hooks (e.g. use-lazy-chord-sheet.ts) built on the above
```

## Search Cache

**Purpose:** cache the results of `/api/search` (unified artist and song search) and `/api/artist-songs` (one artist's own songs), so repeating the same query or reopening an already-fetched artist doesn't hit the network again.

**TTL:** 30 days, for both data sources (`TTL.SEARCH_CACHE.CIFRACLUB` / `.NEON` / `.DEFAULT` in [`core/ttl/constants.ts`](../frontend/src/storage/core/ttl/constants.ts): currently identical, kept distinct in case data sources ever need different lifetimes).

**Cache key:** the normalized query text for a search, or the artist's path for an artist's songs; see [`getNormalizedSearchCacheKey`](../frontend/src/search/utils/normalization/getNormalizedSearchCacheKey.ts). A search and an artist-songs fetch are different `kind`s and never collide, even if the strings happen to match.

**Read/write path:**
- [`useSearchFetch.ts`](../frontend/src/search/hooks/useSearchReducer/handlers/useSearchFetch.ts) checks `searchCacheService.get(key)` before calling `/api/search`, and stores a non-empty response afterward via `storeResults()`.
- [`fetch-artist-songs.ts`](../frontend/src/search/utils/artist/fetch-artist-songs.ts) does the same for `/api/artist-songs`.
- Both go through [`search-cache-service.ts`](../frontend/src/storage/services/search-cache/search-cache-service.ts), which wraps the lower-level [`stores/search-cache/operations/`](../frontend/src/storage/stores/search-cache/operations/) reads/writes and validates the TTL on read (`validateTTL` can be turned off, e.g. to inspect an expired entry deliberately).

An empty search result is deliberately **not** cached: an empty response is as likely to mean the source had a bad moment as it is to mean there's genuinely nothing to find, so it isn't worth remembering for 30 days.

## Chord Sheets

**Purpose:** cache a chord sheet's metadata and content (both the primary/simplified arrangement and, once fetched, the full/tabbed one) so revisiting a song, including via the search flow's own back-navigation, doesn't re-scrape it.

**TTL:** 7 days for a chord sheet that was only viewed, not saved ([`TTL.CHORD_SHEETS`](../frontend/src/storage/core/ttl/constants.ts)). A chord sheet the user explicitly saved to "My Chord Sheets" **never** expires automatically; only the user removing it does.

**Read/write path:** [`useChordSheetWithFallback.ts`](../frontend/src/hooks/useChordSheetWithFallback.ts) checks the `chordSheets` store (`getChordSheetMetadata` / `getChordSheetContent` / `getFullChordSheetContent`) before the chord-viewer page decides whether to call `loadFromAPI()` at all; see the guard in `pages/chord-viewer/index.tsx`. This cache hit is why reopening a song already viewed this session, including right after visiting its chord sheet and going back, produces no network requests.

## Storage Limits & Cleanup

- **Total storage target:** 100MB (`LIMITS.TOTAL_STORAGE_TARGET`).
- **Cleanup threshold:** triggered once usage crosses 80% of that target (`LIMITS.CLEANUP_THRESHOLD`).
- **Triggers** ([`services/cleanup/triggers/`](../frontend/src/storage/services/cleanup/triggers/)): on app start, before a write that would push usage over the threshold, and periodically in the background.
- **Priority** ([`services/cleanup/strategy/`](../frontend/src/storage/services/cleanup/strategy/)): saved chord sheets are never automatically removed. Cleanup only ever considers unsaved (cached) chord sheets and search cache entries, prioritized by a mix of recency and access frequency, so an old, rarely-reopened entry goes before a recent or frequently-revisited one.

## What's Deliberately Not Cached

- The backend does no caching of its own: every request to `/api/search`, `/api/artist-songs`, or `/api/cifraclub-song*` re-scrapes CifraClub. Freshness there is left to a future backend-side job, not this frontend cache.
- An empty search result (see above).
