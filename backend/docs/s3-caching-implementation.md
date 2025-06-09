# S3 Caching Implementation for Artist Songs

## Overview

This implementation provides a comprehensive S3-based caching system for artist song lists, with the ability to dynamically add and remove songs from cached data. The system provides significant performance improvements by caching CifraClub scraping results.

## Architecture

### Components

1. **S3StorageService** (`services/s3-storage.service.js`)
   - Handles all S3 operations (CRUD)
   - Lazy initialization pattern for environment variables
   - Graceful fallback when AWS credentials are unavailable
   - Automatic error handling and logging

2. **Search Controller** (`controllers/search.controller.js`)
   - Integrated caching in `getArtistSongs()` method
   - Cache-first approach with fallback to scraping
   - New endpoints for managing cached data

3. **API Routes** (`routes/api.js`)
   - Extended with cache management endpoints

### Data Flow

```
Client Request → Check S3 Cache → Cache Hit: Return Data
                                → Cache Miss: Scrape CifraClub → Store in S3 → Return Data
```

## Performance Improvements

- **89.5% faster** response times for cached artist data
- First request: ~4.7 seconds (scraping + caching)
- Subsequent requests: ~0.5 seconds (cache retrieval)

## API Endpoints

### Existing (Enhanced)
- `GET /api/artist-songs?artistPath=<artist>` - Now cache-enabled

### New Cache Management
- `POST /api/artist-songs/add` - Add song to cached artist list
- `DELETE /api/artist-songs/remove` - Remove song from cached artist list  
- `GET /api/artists/cached` - List all cached artists

## Usage Examples

### Cache-First Artist Songs Retrieval
```bash
curl "http://localhost:3001/api/artist-songs?artistPath=hillsong-united"
```

### Add Custom Song
```bash
curl -X POST "http://localhost:3001/api/artist-songs/add" \
  -H "Content-Type: application/json" \
  -d '{
    "artistName": "hillsong-united",
    "song": {
      "title": "Custom Song",
      "path": "hillsong-united/custom-song",
      "url": "https://www.cifraclub.com.br/hillsong-united/custom-song/",
      "artist": "Hillsong United"
    }
  }'
```

### Remove Song
```bash
curl -X DELETE "http://localhost:3001/api/artist-songs/remove" \
  -H "Content-Type: application/json" \
  -d '{
    "artistName": "hillsong-united",
    "songPath": "hillsong-united/custom-song"
  }'
```

### List Cached Artists
```bash
curl "http://localhost:3001/api/artists/cached"
```

## Configuration

### Environment Variables (.env)
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SESSION_TOKEN=your_session_token  # Optional, for temporary credentials
AWS_REGION=eu-central-1
S3_BUCKET_NAME=chordium
```

## Storage Format

### S3 Structure
```
chordium/
├── artist-songs/
│   ├── hillsong-united.json
│   ├── bethel-music.json
│   └── elevation-worship.json
├── user-data/          # Future: user playlists, favorites
├── chord-charts/       # Future: cached chord charts
└── app-config/         # Future: app configuration
```

### JSON Format (Optimized - URL Removed)

```json
[
  {
    "title": "Oceans (Where Feet May Fail)",
    "path": "oceans-where-feet-may-fail",
    "artist": "Hillsong United"
  }
]
```

**Note:** URL field removed to save storage space (~44% reduction). URLs can be reconstructed as: `${baseUrl}/${artistPath}/${songPath}/`

## Testing

### Test Scripts
- `npm run test:s3` - Basic S3 connection and operations
- `npm run test:s3-workflow` - Comprehensive workflow testing
- `npm run migrate:s3` - Migrate data from old bucket with schema optimization

### Manual Testing
1. Start backend: `npm start`
2. Run workflow test: `npm run test:s3-workflow`
3. Test API endpoints with curl or Postman

## Error Handling

### Graceful Degradation
- If AWS credentials are missing: Falls back to direct scraping
- If S3 operations fail: Logs warning and continues without caching
- If cached data is corrupted: Returns null and re-scrapes

### Logging
All operations are logged with appropriate levels:
- INFO: Successful operations and cache hits/misses
- WARN: Fallback scenarios and non-critical errors
- ERROR: Critical failures

## Future Enhancements

1. **AWS SDK v3 Migration** - Current implementation uses AWS SDK v2 (maintenance mode)
2. **Cache Expiration** - Add TTL metadata for automatic cache invalidation
3. **Bulk Operations** - Add endpoints for bulk add/remove operations
4. **Cache Statistics** - Track hit/miss ratios and performance metrics
5. **Search Integration** - Cache artist search results in addition to song lists

## Security Considerations

- AWS credentials are handled securely via environment variables
- Session tokens supported for temporary credentials
- No sensitive data logged
- Proper error message sanitization for client responses
