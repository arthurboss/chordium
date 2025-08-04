# 🔍 Search Types

## 💾 IndexedDB Store: [searchCache](../../frontend/src/storage/types/search-cache.ts)

### 👤 ARTIST-ONLY SEARCH

- **Artist search input:** `"hillsong"`
- **Song search input:** `null`

- **API endpoint:** `/api/artists`
- **Request URL path:** `/api/artists?artist=hillsong&song=`
- **Response example:** [`hillsong.json`](../../shared/fixtures/artists/hillsong.json)
- **Response type:** [`Artist[]`](../../packages/types/src/domain/artist.ts)
- **Frontend URL path:** `/search?artist=hillsong`

---

### 👤➕🎵 ARTIST + SONG SEARCH

> Behaves just like an artist search, but the song search input will serve for pre-filtering of results once the user selects an artist. The song search input is not used in the initial request to the artist search endpoint, so it is be used later to refine results, therefore, only UI logic handles this.

- **Artist search input:** `"hillsong"`
- **Song search input:** `"oceans"`

- **API endpoint:** `/api/artists`
- **Request URL path:** `/api/artists?artist=hillsong&song=oceans`
- **Response example:** [`hillsong.json`](../../shared/fixtures/artists/hillsong.json)
- **Response type:** [`Artist[]`](../../packages/types/src/domain/artist.ts)
- **Frontend URL path:** `/search?artist=hillsong&song=oceans`

---

### 🎵 SONGS BY ARTIST

> Artist selection from artist list

- **Artist search input:** `"hillsong"` _(not altered. Value selected in the list of results from previous response)_
- **Song search input:** `null` _(not altered as well)_

- **API endpoint:** `/api/artist-songs`
- **Request URL path:** `/api/artist-songs?artistPath=hillsong-united`
- **Response example:** [`hillsong-united.json`](../../shared/fixtures/artist-songs/hillsong-united.json)
- **Response type:** [`Song[]`](../../packages/types/src/domain/song.ts)
- **Frontend URL path:** `/hillsong-united` _(:artist)_

---

### 🎵 SONG-ONLY SEARCH

- **Artist search input:** `null`
- **Song search input:** `"oceans"`

- **API endpoint:** `/api/cifraclub-search`
- **Request URL path:** `/api/cifraclub-search?artist=&song=oceans`
- **Response example:** [`oceans.json`](../../shared/fixtures/cifraclub-search/oceans.json)
- **Response type:** [`Song[]`](../../packages/types/src/domain/song.ts)
- **Frontend URL path:** `/search?song=oceans`

---

## 💾 IndexedDB Store: [chordSheets](../../frontend/src/storage/types/chord-sheet.ts)

### 🎼 CHORD SHEET

> 2 scenarios:
>
> - Song selection from songs list. The origin search could be either: **artist | song | artist + song**
> - User directly lands on a song page (**e.g: `/radiohead/creep`**)

>

- **Artist search input:** `"Radiohead"` | `null`
- **Song search input:** `"creep"` | `null`

- **API endpoint:** `/api/cifraclub-chord-sheet`
- **Request URL path:** `/api/cifraclub-chord-sheet?artist=radiohead&song=creep`
- **Response example:** [`creep.json`](../../shared/fixtures/chord-sheet/radiohead-creep.json)
- **Response type:** [`ChordSheet[]`](../../packages/types/src/domain/chord-sheet.ts)
- **Frontend URL path:** `/search?artist=radiohead&song=creep`
