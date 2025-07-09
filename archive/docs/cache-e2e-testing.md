# Cache E2E Testing Documentation

## Overview

This document describes the comprehensive cache E2E testing implementation for the Chordium application. All cache E2E tests use mocked API responses to prevent excessive scraping of external websites while maintaining comprehensive test coverage.

## Key Changes - No Real API Calls

**Previous Approach**: Tests made real API calls to external websites (CifraClub) which could cause:
- Excessive scraping of external websites
- Unreliable tests due to network dependencies
- Slower test execution
- Potential rate limiting issues

**Current Approach**: All tests use Cypress fixtures and interceptors:
- **Zero real API calls** - all responses are mocked
- **Faster execution** - instant, predictable responses
- **Reliable testing** - no network dependencies
- **Respectful to external services** - no scraping load

## Test Files

All cache E2E tests are located in `cypress/e2e/cache/` and use Cypress fixtures to mock API responses:

### 1. `artist-search.cy.ts` - Artist Search Caching
Tests caching functionality for artist search operations:

- **Artist Search Caching**: Tests caching of artist search results and cache reuse
- **Cache Structure Validation**: Verifies proper cache key generation and data structure
- **Access Count Tracking**: Validates cache hit detection and usage statistics

### 2. `song-search.cy.ts` - Song Search Caching  
Tests caching functionality for song search operations:

- **Song Search Caching**: Tests independent caching of song search results
- **Cache Reuse Verification**: Ensures cached song results are properly retrieved
- **Multiple Search Handling**: Tests caching behavior across different song searches

### 3. `combined-search.cy.ts` - Combined Search Caching
Tests caching for artist+song combination searches:

- **Combined Search Caching**: Tests that combined searches are cached separately from individual searches
- **Search Type Separation**: Verifies different search types maintain separate cache entries
- **Cache Reuse for Identical Searches**: Tests cache hits for identical combined searches

### 4. `cache-management.cy.ts` - Cache Management Operations
Tests cache lifecycle and management functionality:

- **Cache Expiration**: Tests cache TTL and expiration handling
- **Corrupted Cache Handling**: Tests graceful fallback when cache data is corrupted
- **Cache Performance**: Validates cache vs API response performance
- **Cache Persistence**: Tests cache behavior across browser sessions

**All tests use mocked API responses via Cypress fixtures:**
- `artists.json`: Contains artist data (Hillsong United, AC/DC, Guns N' Roses, Rosa de Saron)
- `cifraclub-search.json`: Contains song search results
- `artist-songs/`: Directory with artist-specific song lists

## Test Structure

### Cache Data Interface
```typescript
interface CacheItem {
  key: string;
  timestamp: number;
  accessCount: number;
  results: unknown;
  query: {
    artist?: string;
    song?: string;
  };
}

interface CacheData {
  items: CacheItem[];
}
```

### Cache Types Tested
1. **Search Cache** (`chordium-search-cache` in localStorage)
   - 30-day TTL
   - Stores search results with query parameters
   - Tracks access count for cache hit verification

2. **Artist Cache** (4-hour TTL)
3. **Chord Sheet Cache** (72-hour TTL)

## GitHub Workflows

### 1. Cache E2E Tests Workflow (`.github/workflows/cache-e2e-tests.yml`)
**Purpose**: Dedicated workflow for cache-specific E2E tests using mocked data only

**Jobs:**
- `cache-e2e`: Runs all cache E2E tests with mocked API responses
  - Runs `artist-search.cy.ts` 
  - Runs `song-search.cy.ts`
  - Runs `combined-search.cy.ts`
  - Runs `cache-management.cy.ts`
  - Uses separate artifact names (`cache-cypress-screenshots`, `cache-cypress-videos`)
  - No real API calls - all responses are mocked via Cypress fixtures

- `cache-visual-testing`: Handles test failure artifacts and PR comments
  - Provides cache-specific failure analysis
  - Offers troubleshooting tips for cache-related issues

**Concurrency Group**: `cache-e2e-${{ github.ref }}`

### 2. Main E2E Tests Workflow (`.github/workflows/e2e-tests.yml`)
**Purpose**: Runs all non-cache E2E tests

**Key Changes:**
- **Name**: Changed to "E2E Tests (Non-Cache)"
- **Spec Pattern**: `cypress/e2e/!(cache)/**/*.cy.ts,cypress/e2e/!(cache*).cy.ts` (excludes cache tests)
- **Artifacts**: `non-cache-cypress-screenshots`, `non-cache-cypress-videos`
- **Concurrency Group**: `e2e-non-cache-${{ github.ref }}`

## Test Coverage

All cache E2E tests use mocked API responses and are organized into focused, modular test files:

### Artist Search Tests (`artist-search.cy.ts`)
1. **Artist Search Caching**
   - Cache population verification using mocked artist data
   - Cache structure validation for artist searches
   - Cache reuse and access count tracking
   - Multiple artist search separation

### Song Search Tests (`song-search.cy.ts`)
1. **Song Search Caching**
   - Independent song search caching using mocked song data
   - Multiple song search handling
   - Cache hit verification for song searches
   - Song search result validation

### Combined Search Tests (`combined-search.cy.ts`)
1. **Combined Search Caching**
   - Artist+song combination caching
   - Separation from individual artist/song searches
   - Cache reuse for identical combined searches
   - Validation that combined searches create unique cache entries

### Cache Management Tests (`cache-management.cy.ts`)
1. **Cache Lifecycle Management**
   - Cache expiration and TTL validation
   - Corrupted cache data graceful handling
   - Cache performance measurement
   - Cross-browser session persistence testing

**Key Benefits:**
- **No External Dependencies**: All tests use Cypress fixtures
- **Faster Execution**: Mocked responses provide instant, predictable results
- **Enhanced Reliability**: No dependency on external API availability
- **Modular Organization**: Each test file focuses on specific cache functionality

## Benefits of Workflow Separation

### 1. **Independent Execution**
- Cache tests run separately from other E2E tests
- Failures in cache tests don't affect other test results
- Easier debugging and issue isolation

### 2. **Parallel Execution**
- Both workflows can run simultaneously
- Reduced overall CI/CD pipeline time
- Better resource utilization

### 3. **Specialized Failure Handling**
- Cache-specific error messages and troubleshooting tips
- Separate artifact management
- Targeted PR comments for cache issues

### 4. **Maintainability**
- Clear separation of concerns
- Easier test maintenance and updates
- Specialized monitoring for cache functionality

## Running Tests Locally

### Run All Cache Tests
```bash
npx cypress run --spec "cypress/e2e/cache/*.cy.ts"
```

### Run Individual Cache Test Files
```bash
# Artist search caching tests
npx cypress run --spec "cypress/e2e/cache/artist-search.cy.ts"

# Song search caching tests  
npx cypress run --spec "cypress/e2e/cache/song-search.cy.ts"

# Combined search caching tests
npx cypress run --spec "cypress/e2e/cache/combined-search.cy.ts"

# Cache management tests
npx cypress run --spec "cypress/e2e/cache/cache-management.cy.ts"
```

### Run Non-Cache Tests
```bash
npx cypress run --spec "cypress/e2e/!(cache)/**/*.cy.ts,cypress/e2e/!(cache*).cy.ts"
```

## Troubleshooting

### Common Cache Issues
1. **Cache Not Populating**: Check localStorage key `chordium-search-cache`
2. **Cache Not Reused**: Verify access count increment and API call patterns  
3. **Cache Expiration**: Ensure timestamp validation is working correctly
4. **Corrupted Cache**: Test graceful fallback to mocked API responses
5. **Fixture Loading**: Verify Cypress fixtures are properly loaded (`artists.json`, `cifraclub-search.json`)

### Test Debugging
1. Use Cypress Test Runner for interactive debugging
2. Check browser console for cache-related errors
3. Verify localStorage content in browser DevTools
4. Monitor network requests to confirm mocked responses are being used
5. Verify Cypress intercepts are properly configured
6. Check that fixture files exist and contain expected data

### Mocked API Debugging
1. **Intercept Not Working**: Verify URL patterns match actual API calls
2. **Fixture Not Found**: Ensure fixture files exist in `cypress/fixtures/`
3. **Wrong Response Format**: Validate fixture data matches expected API response structure
4. **Network Tab**: Check that API calls are intercepted (should show as "from disk cache" or similar)

## Future Enhancements

1. **Cache Performance Metrics**: Add detailed timing measurements comparing cache vs mocked API
2. **Cache Size Monitoring**: Test cache size limits and cleanup with larger fixture datasets  
3. **Cache Invalidation**: Test manual cache clearing functionality
4. **Cross-Browser Cache Behavior**: Test cache consistency across browsers
5. **Fixture Data Expansion**: Add more comprehensive test data to fixtures
6. **Edge Case Testing**: Test cache behavior with malformed or unexpected fixture data
