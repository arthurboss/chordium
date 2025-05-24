# Cache Implementation Test Plan

## Edge Case Scenario Test
**Goal**: Prevent redundant API calls when navigating back to same artist's songs after navigating between artist lists and song lists.

## Test Steps:

### Step 1: Initial Artist Search
1. Navigate to http://localhost:8081/
2. Search for an artist (e.g., "john mayer")
3. Verify API call is made to `/api/artists?artist=john%20mayer`
4. Verify results are cached and displayed
5. **Expected**: First API call made, results cached

### Step 2: Select Artist and View Songs
1. Click "View Songs" on an artist result
2. Verify API call is made to `/api/artist-songs?artistPath=<artistPath>`
3. Verify artist songs are displayed
4. **Expected**: Artist songs API call made, results cached

### Step 3: Navigate Back to Artists List
1. Click back to return to artist search results
2. **Expected**: No new API call, cached artist results displayed immediately

### Step 4: Select Same Artist Again (Edge Case)
1. Click "View Songs" on the same artist again
2. **Expected**: No API call to `/api/artist-songs`, cached artist songs displayed immediately

### Step 5: Navigate to Different Artist
1. Click "View Songs" on a different artist
2. **Expected**: New API call made only for the new artist, previous artist remains cached

## Cache Verification Commands:
In browser console:
- `debugCache()` - View current cache contents
- `clearAllCaches()` - Clear all caches for testing

## Success Criteria:
- ✅ Artist search results are cached and reused
- ✅ Artist songs are cached per artist path
- ✅ No redundant API calls when returning to previously visited artist songs
- ✅ Cache persists across browser tabs/refreshes (localStorage)
- ✅ Different artists maintain separate cache entries
- ✅ Cache expires appropriately (4 hours for artist songs, 1 month for search results)
