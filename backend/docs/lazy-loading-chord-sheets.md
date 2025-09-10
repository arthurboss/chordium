## Lazy Loading Chord Sheets (Backend Proposal)

### Context
The frontend now separates chord sheet storage into two IndexedDB stores: `songsMetadata` and `chordSheets` (content). It fetches lightweight metadata first and loads chord content on demand. The backend currently exposes a single endpoint that returns the full `ChordSheet` payload (metadata + content), which can be slow and block UI rendering when only metadata is needed for initial display.

### Goals
- Speed up metadata fetch to avoid blocking UI rendering.
- Provide an explicit, on-demand API for heavy chord content.
- Replace the existing full `ChordSheet` endpoint with split endpoints.
- Enable progressive rendering where metadata loads first, then content.

### Summary of Changes
- Add new metadata endpoint for fast loading:
  - Metadata-only: fast, minimal payload to avoid blocking UI rendering
- Repurpose existing endpoint for content-only:
  - Content-only: heavy payload for on-demand content loading
- Single scrape strategy with progressive data extraction and caching.

---

### Proposed API

#### 1) Metadata (fast)
- Method: GET
- Path: `/api/cifraclub-song-metadata`
- Query: `url=artist/song` (same format as today)
- Response: `SongMetadata` (no `songChords`)

Example request:
```http
GET /api/cifraclub-song-metadata?url=frank-sinatra/thats-life
```

Example response:
```json
{
  "title": "That's Life",
  "artist": "Frank Sinatra",
  "songKey": "G",
  "guitarTuning": ["E","A","D","G","B","E"],
  "guitarCapo": 0
}
```

#### 2) Content (on-demand)
- Method: GET
- Path: `/api/cifraclub-chord-sheet` (existing endpoint, repurposed)
- Query: `url=artist/song`
- Response: `ChordSheetContent` (just `songChords`)

Example request:
```http
GET /api/cifraclub-chord-sheet?url=frank-sinatra/thats-life
```

Example response:
```json
{
  "songChords": "[Intro] G  Em  A7  D..."
}
```


---

### Shared Types (Proposed)

- Reuse existing `SongMetadata` from `shared/types/domain/song-metadata.ts`.

- Add one new type for content:
```ts
// shared/types/domain/chord-sheet-content.ts
export interface ChordSheetContent {
  songChords: string;
}
```

- Reuse existing `SongMetadata` for metadata endpoint response.

---

### Scraping Strategy (Single Scrape with Progressive Extraction)

#### Core Strategy
- **Single scrape per URL**: One Puppeteer page load per unique song URL
- **Progressive extraction**: Extract metadata first (fast), then content (heavy)
- **In-memory caching**: Cache extracted data for subsequent requests to same URL
- **Fast metadata response**: Return metadata immediately after DOM loads
- **On-demand content**: Extract and return content when requested

#### Implementation Flow
1. **First request** (metadata): 
   - Load page with fast strategy (`domcontentloaded`)
   - Extract metadata only (title, artist, songKey, guitarCapo, guitarTuning)
   - Cache metadata in memory
   - Return metadata immediately
   - Continue extracting content in background

2. **Second request** (content):
   - Check cache for content
   - If cached, return immediately
   - If not cached, wait for background extraction to complete
   - Return content

#### Benefits
- **No duplicate scraping**: Single page load per URL
- **Fast metadata**: Returns immediately after DOM loads
- **Efficient resource usage**: No multiple Puppeteer instances
- **Progressive loading**: Metadata first, content when needed

---

### Controllers & Services (High-Level)

#### Routes: `backend/routes/api.ts`
- Add new metadata endpoint:
```ts
router.get('/cifraclub-song-metadata', (req, res) => getSongMetadataHandler(req, res));
```
- Repurpose existing endpoint (no route changes needed):
```ts
// Existing route now returns content-only instead of full ChordSheet
router.get('/cifraclub-chord-sheet', (req, res) => getChordSheetHandler(req, res));
```

#### Handlers: `backend/controllers/handlers`
- `getSongMetadataHandler.ts`
  - Validates `url` query
  - Calls `cifraClubService.getSongMetadata(url)`
  - Returns `SongMetadata`

- `getChordSheetHandler.ts` (existing, repurposed)
  - Validates `url` query
  - Calls `cifraClubService.getChordSheet(url)`
  - Returns `ChordSheetContent` (instead of full `ChordSheet`)

#### Service: `backend/services/cifraclub.service.ts`
- Add new method:
```ts
async getSongMetadata(songUrl: string): Promise<SongMetadata>;
```
- Repurpose existing method:
```ts
// Existing method now returns content-only instead of full ChordSheet
async getChordSheet(songUrl: string): Promise<ChordSheetContent>;
```

#### Fetchers / Extractors
- In `backend/utils/dom-extractors.ts`, add:
  - `extractSongMetadata()` – extract metadata only (no `pre` reads)
  - `extractChordSheetContent()` – extract content only (`pre` reads)
- In `backend/utils/chord-sheet-fetcher.ts`, add:
  - `fetchWithProgressiveExtraction(url)` – single scrape with progressive extraction
  - In-memory cache for extracted data per URL
- In `backend/services/cifraclub.service.ts`:
  - Cache management for metadata and content per URL
  - Background content extraction after metadata is returned
- Update existing `fetchChordSheet()` to return content-only

---

### Migration Strategy
- Add new `/api/cifraclub-song-metadata` endpoint.
- Repurpose existing `/api/cifraclub-chord-sheet` endpoint to return content-only.
- Update frontend to use new split endpoints.
- No backward compatibility needed since app is not deployed.

---

### Frontend Integration Strategy

#### Progressive Loading Approach
The frontend will implement a progressive loading strategy that provides immediate UI feedback while content loads in the background:

**Key Benefits:**
- **Immediate UI**: User sees title, artist, metadata instantly
- **Progressive Enhancement**: Content loads in background
- **Better UX**: No blank screen while waiting for full data
- **Efficient**: Single scrape on backend, progressive display on frontend
- **Backward Compatible**: Search results can still use full data approach

**Loading States:**
1. **Metadata Loading**: Show skeleton with title/artist placeholders
2. **Metadata Loaded**: Show real title, artist, metadata + content loading spinner
3. **Content Loaded**: Show everything

#### Implementation Details
- **List views and previews**: Use metadata endpoint only
- **Detail views (`SongViewer`)**: Fetch metadata first to avoid blocking UI rendering, then content on demand
- **Frontend storage**: Already mirrors this split (`songsMetadata` vs `chordSheets`)
- **Progressive UI**: Implement loading states with immediate feedback
- **Error handling**: Graceful fallbacks if content fails to load
- **Viewport consideration**: The `songChords` content is always displayed in the viewport, but metadata loads first for immediate UI feedback

---

### Error Handling & Status Codes
- 400: Missing/invalid `url` query param
- 404: Target song page loads, but expected elements are absent
- 5xx: Navigation or scraping errors (bubbled with safe error body)
- Include structured `ErrorResponse` fields already used elsewhere

---

### Performance & Observability
- Log timing for: navigation, extraction, payload size
- Add counters: success/failure per endpoint
- Consider rate-limiting and circuit breakers if the source site rate-limits

---

### Security & Compliance
- Sanitize/validate incoming `url` path segments
- Enforce `https://www.cifraclub.com.br/<artist>/<song>/` normalization

---

### Rollout Plan
1) Add shared types for `ChordSheetContent`.
2) Implement new extractors and fetchers.
3) Add new service methods and handlers.
4) Register new metadata route.
5) Repurpose existing `/api/cifraclub-chord-sheet` endpoint to return content-only.
6) Update frontend API calls to use new endpoints.
7) Test locally with a few URLs.

---

### Open Questions
- Should metadata endpoint also return a normalized `path` in its body (for convenience)?
- Any server-side caching desired (e.g., S3/Redis) for metadata/content?
- Cache TTL strategy for in-memory cache (how long to keep extracted data)?
- Should we implement cache warming (pre-extract content after metadata request)?

---

### Appendix: Minimal Contracts

```ts
// Metadata
type GET /api/cifraclub-song-metadata?url=artist/song
=> 200: SongMetadata | 400 | 404

// Content (repurposed existing endpoint)
type GET /api/cifraclub-chord-sheet?url=artist/song
=> 200: { songChords: string } | 400 | 404
```


