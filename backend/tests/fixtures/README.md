# Test Fixtures

This directory contains fixtures created from real endpoint responses to avoid future fetching in tests and ensure consistent, reliable test data.

## Fixtures Overview

### Files Created

- **`song-search.json`** - Real song search responses from `/api/cifraclub-search?song=...`
- **`artist-search.json`** - Real artist search responses from `/api/cifraclub-search?artist=...`
- **`artist-songs.json`** - Real artist songs responses from `/api/artist-songs?artistPath=...`
- **`chord-sheets.json`** - Real chord sheet content from `/api/cifraclub-chord-sheet?url=...`

### Fixture Data Structure

#### Song Search Fixtures (`song-search.json`)
```json
{
  "wonderwall": [
    {
      "title": "Wonderwall",
      "url": "https://www.cifraclub.com.br/oasis/wonderwall/",
      "artist": "Oasis"
    }
  ],
  "creep": [
    {
      "title": "Creep", 
      "url": "https://www.cifraclub.com.br/radiohead/creep/",
      "artist": "Radiohead"
    }
  ]
}
```

#### Artist Search Fixtures (`artist-search.json`)
```json
{
  "radiohead": [
    {
      "displayName": "Radiohead",
      "path": "radiohead/",
      "songCount": null
    }
  ]
}
```

#### Artist Songs Fixtures (`artist-songs.json`)
```json
{
  "radiohead": [
    {
      "title": "Creep",
      "url": "https://www.cifraclub.com.br/radiohead/creep/"
    }
  ]
}
```

#### Chord Sheets Fixtures (`chord-sheets.json`)
```json
{
  "wonderwall": {
    "url": "https://www.cifraclub.com.br/oasis/wonderwall/",
    "content": "[Intro] Em7  G  D4  A7(4)..."
  }
}
```

## Using Fixtures in Tests

### Fixture Loader

Use the `FixtureLoader` class or convenience functions:

```javascript
import fixtureLoader, { 
  getSongSearchResult, 
  getArtistSearchResult, 
  getArtistSongs, 
  getChordSheet 
} from '../fixtures/index.js';

// Using convenience functions
const wonderwallResults = getSongSearchResult('wonderwall');
const radiheadArtists = getArtistSearchResult('radiohead');
const radiheadSongs = getArtistSongs('radiohead');
const wonderwallChords = getChordSheet('wonderwall');

// Using loader instance  
const songFixtures = fixtureLoader.getSongSearchFixtures();
const artistFixtures = fixtureLoader.getArtistSearchFixtures();
```

### Example Test

```javascript
describe('Song Search with Fixtures', () => {
  it('should use fixture data instead of real API calls', async () => {
    // BEFORE: Real API call
    // const results = await cifraClubService.search('wonderwall', 'song');
    
    // AFTER: Use fixture data
    const fixtureResults = getSongSearchResult('wonderwall');
    mockCifraClubService.search.mockResolvedValue(fixtureResults);
    
    const results = await mockCifraClubService.search('wonderwall', 'song');
    
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      title: 'Wonderwall',
      url: 'https://www.cifraclub.com.br/oasis/wonderwall/',
      artist: 'Oasis'
    });
  });
});
```

## Benefits

1. **No Real API Calls**: Tests don't make actual HTTP requests to external services
2. **Consistent Data**: Same data every time, eliminating flaky tests
3. **Faster Tests**: Instant responses instead of network delays
4. **Offline Testing**: Tests work without internet connection
5. **Respectful**: No load on external services like CifraClub

## Data Sources

All fixture data was captured from real endpoint responses:

- **Song Search**: `/api/cifraclub-search?song=wonderwall` and `/api/cifraclub-search?song=creep`
- **Artist Search**: `/api/cifraclub-search?artist=radiohead`, `/api/cifraclub-search?artist=oasis`, `/api/cifraclub-search?artist=coldplay`
- **Artist Songs**: `/api/artist-songs?artistPath=radiohead`, `/api/artist-songs?artistPath=oasis`, `/api/artist-songs?artistPath=coldplay`
- **Chord Sheets**: `/api/cifraclub-chord-sheet?url=https://www.cifraclub.com.br/oasis/wonderwall/` and `/api/cifraclub-chord-sheet?url=https://www.cifraclub.com.br/radiohead/creep/`

## Updating Fixtures

To update fixtures with new data:

1. Start the backend server: `npm run backend`
2. Make requests to endpoints to get fresh data
3. Update the corresponding JSON files
4. Run tests to ensure compatibility

## Cache Features

The `FixtureLoader` includes caching:

- Fixtures are cached after first load
- Use `fixtureLoader.clearCache()` to refresh
- Reduces file I/O in test suites
