# Global Test Fixtures

This directory contains shared test fixtures used across both backend unit tests and frontend E2E tests, providing a single source of truth for all test data.

## 📁 Directory Structure

```
fixtures/
├── api/                    ← API response fixtures
│   ├── artist-search.json  ← Artist search responses
│   ├── song-search.json    ← Song search responses
│   ├── artist-songs.json   ← Artist songs lists
│   ├── chord-sheets.json   ← Chord sheet content
│   ├── artists.json        ← Legacy Cypress fixture
│   ├── cifraclub-search.json ← Legacy Cypress fixture
│   └── artist-songs/       ← Legacy Cypress fixtures
├── e2e/                    ← E2E specific fixtures
│   └── user-flows.json     ← User interaction scenarios
├── index.js                ← Global fixture loader
└── README.md               ← This documentation
```

## 🎯 Benefits

### ✅ **Single Source of Truth**
- No duplication between backend and frontend test data
- Consistent data across all test environments
- One place to update test data

### ✅ **Industry Standard**
- Common pattern used in many successful projects
- Clear separation between API data and E2E scenarios
- Centralized fixture management

### ✅ **Easy Maintenance**
- Update fixtures once, affects all tests
- Clear organization and structure
- Version controlled test data

## 🚀 Usage

### **Backend Unit Tests**

```javascript
import globalFixtureLoader, { 
  getSongSearchResult, 
  getArtistSearchResult, 
  getArtistSongs, 
  getChordSheet 
} from '../../fixtures/index.js';

// Using convenience functions
const wonderwallResults = getSongSearchResult('wonderwall');
const radioheadArtists = getArtistSearchResult('radiohead');
const radioheadSongs = getArtistSongs('radiohead');
const wonderwallChords = getChordSheet('wonderwall');

// Using loader instance
const allSongFixtures = globalFixtureLoader.getSongSearchFixtures();
```

### **Frontend E2E Tests (Cypress)**

```javascript
// cypress.config.js
export default defineConfig({
  e2e: {
    fixturesFolder: 'fixtures/api',  // Point to global API fixtures
  }
})

// In test files
cy.intercept('GET', '**/api/cifraclub-search**', {
  fixture: 'song-search.json'  // Uses fixtures/api/song-search.json
}).as('songSearchAPI');
```

## 📊 Fixture Data Structure

### **API Fixtures (`api/`)**

All fixtures contain real API response data captured from live endpoints:

#### `artist-search.json`
```json
{
  "radiohead": [
    {
      "path": "radiohead/",
      "displayName": "Radiohead",
      "songCount": null
    }
  ]
}
```

#### `song-search.json`
```json
{
  "wonderwall": [
    {
      "title": "Wonderwall",
      "url": "https://www.cifraclub.com.br/oasis/wonderwall/",
      "artist": "Oasis"
    }
  ]
}
```

#### `artist-songs.json`
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

#### `artist-songs/` (Individual Artist Song Lists)
Individual artist song lists from `/api/artist-songs?artistPath=...` endpoint:

**Files:**
- `hillsong-united.json` - 80+ Hillsong United songs
- `ac-dc.json` - AC/DC song catalog
- `guns-n-roses.json` - Guns N' Roses collection
- `rosa-de-saron.json` - Rosa de Saron songs

**Response Format:**
```json
[
  {
    "title": "Oceans (Where Feet May Fail)",
    "path": "oceans-where-feet-may-fail"
  },
  {
    "title": "So Will I (100 Billion X)",
    "path": "so-will-i-100-billion-x"
  }
]
```

#### `chord-sheets.json`
```json
{
  "wonderwall": {
    "url": "https://www.cifraclub.com.br/oasis/wonderwall/",
    "content": "[Intro] Em7  G  D4  A7(4)..."
  }
}
```

### **E2E Fixtures (`e2e/`)**

Contains frontend-specific test scenarios and user flow data.

## 🔄 Migration from Local Fixtures

### **Backend Tests**
- **Before**: `import fixtureLoader from '../fixtures/index.js';`
- **After**: `import globalFixtureLoader from '../../fixtures/index.js';`

### **Cypress Tests**
- **Before**: `fixturesFolder: 'cypress/fixtures'`
- **After**: `fixturesFolder: 'fixtures/api'`

## 🛠 Maintenance

### **Updating Fixtures**
1. Start backend server: `npm run backend`
2. Capture fresh API responses
3. Update corresponding JSON files in `fixtures/api/`
4. Run tests to verify compatibility

### **Adding New Fixtures**
1. Add new `.json` file to appropriate directory
2. Update `GlobalFixtureLoader` class if needed
3. Document the new fixture structure
4. Update tests to use new fixtures

## 🧪 Testing the Fixtures

```bash
# Run backend tests with global fixtures
cd backend && npm test

# Run E2E tests with global fixtures  
npm run cypress:open
```

## 📋 Cache Features

The `GlobalFixtureLoader` includes intelligent caching:

- Fixtures cached after first load
- Separate cache keys for API vs E2E fixtures
- Cache statistics available via `getCacheStats()`
- Manual cache clearing with `clearCache()`

## 🎨 Best Practices

1. **Keep fixtures realistic** - Use real API response data
2. **Version control** - All fixtures should be committed
3. **Document changes** - Update README when adding fixtures
4. **Test compatibility** - Verify fixtures work across all test suites
5. **Regular updates** - Refresh fixtures periodically with live data

---

**This global fixture system eliminates duplication and ensures consistent, reliable test data across your entire application!** 🎯
