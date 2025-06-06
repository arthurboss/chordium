# Storing Data

## Current Backend Implementation Status

The backend is **fully operational** with a comprehensive API providing the following endpoints:

### 🚀 Active API Endpoints

- **`GET /api/artists`** - Search for artists (Supabase + fallback to CifraClub)
- **`GET /api/artist-songs`** - Get songs for specific artist (requires `artistPath`)
- **`GET /api/cifraclub-search`** - General search (songs + artists)
- **`GET /api/cifraclub-chord-sheet`** - Fetch chord sheet content (requires `url`)
- **`GET /health`** - Health check endpoint

### 📊 API Response Schemas

For current API response formats and examples, see the **[Global Fixtures Documentation](../fixtures/README.md)** which contains real endpoint responses used in testing.

## Artists

Use tables in Supabase, since it allows for SQL querying:

| Display Name     | Path             | Song Count |
|------------------|------------------|------------|
| AC/DC            | ac-dc            | 95         |
| Guns N' Roses    | guns-n-roses     | 150        |
| Hillsong United  | hillsong-united  | 127        |
| Rosa de Saron    | rosa-de-saron    | 93         |

On SQL then it will allow searches like:

```sql
SELECT * FROM artists WHERE display_name LIKE 'A%';
```
which fetches all artists whose names start with "A", without needing separate files.

### Path

All URLs start with the same domain, so we can only store the path for the artist.

Backend will have the `BASE_URL = "https://www.cifraclub.com.br/" as a constant, and it will construct the URL to scrape data.

### Display Name

Due to edge cases, like AC/DC, Guns N' Roses and other names with different characters, it's best to scrape the displayName and store it as well, instead of extracting it from the URL path.

### Song Count

The song count will be useful for when running the cronjob that will check for new songs on CifraClub, also to know beforehand how many songs will be fetched when searching for their songs, allowing for pre-optimization of the rendering in the frontend.

### API response

Current format (see live examples in [fixtures/api/artist-search.json](../fixtures/api/artist-search.json)):

```json
[
  {
    "path": "hillsong-united/",
    "displayName": "Hillsong United",
    "songCount": 127
  },
  {
    "path": "ac-dc/",
    "displayName": "AC/DC",
    "songCount": 95
  },
  {
    "path": "guns-n-roses/",
    "displayName": "Guns N' Roses",
    "songCount": 150
  },
  {
    "path": "rosa-de-saron/",
    "displayName": "Rosa de Saron",
    "songCount": 93
  }
]
```

---

## Songs

These are the artist songs list, meaning that this is the response for when we start with or include in the search the artist.

**Current Implementation**: Backend fetches songs dynamically from CifraClub via the `/api/artist-songs` endpoint using the `artistPath` parameter.

**Live Examples**: See [fixtures/api/artist-songs.json](../fixtures/api/artist-songs.json) for current response format.

### Further Iteration

The songs list should be stored as json files in S3, to avoid using up the free-tier of supabase (500mb). 
Backend fetches songs dynamically when needed and caches frequently searched artists for performance optimization.

Current format:

```json
[
  {
    "title": "Acércame a ti",
    "path": "acercame-a-ti"
  },
  {
    "title": "Across the heart",
    "path": "across-the-heart"
  },
  {
    "title": "Adonai",
    "path": "adonai"
  }
]
```

### Title

Different than `displayName` in the artist objects, specifically to differentiate and because it just makes sense for songs.

### Path

It's the segment that comes after the artist segment in the URL query.

**Current Implementation**: Backend constructs the URL as follows:

```javascript
const URL = BASE_URL + "/" + [artist-path] + "/" + [song-path] + "/"
```

### Further Considerations

Should we add entries for `tabs`, `lyrics`, `key` and/or `tuning`? Can we even fetch these data on song scraping and do we need these data beforehand?

## Chord Sheets

**Current Implementation**: Fully functional via `/api/cifraclub-chord-sheet` endpoint.

**Live Examples**: See [fixtures/api/chord-sheets.json](../fixtures/api/chord-sheets.json) for current response format.

Current storage: Retrieved dynamically from CifraClub and returned as JSON response with chord sheet content.

### Further Iteration

Store them as json files in S3.

## The Final Storage Approach
1️⃣ Scrape song lists only when searched – Store results only when requested to reduce space usage.

2️⃣ Cache popular songs – Keep frequently searched song lists temporarily in memory or a lightweight DB.

3️⃣ Store full song data externally (S3, JSON-based storage, etc.) – Avoid bloating Supabase with complete song details.

4️⃣ API dynamically fetches song lists – Instead of storing every song upfront, the backend queries CifraClub when needed.

### 🔥 Why This Works Best?

✅ Avoids storing unnecessary songs for every artist upfront.

✅ Keeps Supabase lightweight, avoiding free-tier storage limits.

✅ Ensures performance stays fast, fetching only relevant data. 

✅ Flexible scaling if the project grows in the future.


## Current Storage Implementation ✅

The backend is **currently operational** with the following approach:

1️⃣ **Dynamic song fetching** – `/api/artist-songs` endpoint fetches songs on-demand from CifraClub

2️⃣ **Supabase artist database** – Artist search tries Supabase first, falls back to CifraClub

3️⃣ **Real-time chord sheet retrieval** – `/api/cifraclub-chord-sheet` endpoint fetches chord content

4️⃣ **Comprehensive testing** – All 136 backend tests pass using global fixtures with real API responses

### 🔥 Why This Implementation Works

✅ **Operational backend** – All endpoints are functional and tested

✅ **Intelligent fallback** – Supabase for artists, CifraClub for dynamic content

✅ **Performance optimized** – Dynamic fetching only when needed

✅ **Comprehensive testing** – Global fixtures ensure reliability

✅ **Scalable architecture** – Ready for future enhancements

### 📋 Test Coverage

All API endpoints are thoroughly tested with real response data stored in the [global fixtures system](../fixtures/README.md), ensuring reliability and consistency across development and testing environments.