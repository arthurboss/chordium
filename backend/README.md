# Chordium Backend

Backend service for searching and retrieving chord sheets with optional S3 caching.

## Quick Start

```bash
npm install
npm run dev  # Start development server
npm test     # Run all tests
```

## Tests

```bash
# All tests
npm test

# S3 caching tests (44 tests)
npm test -- tests/services/s3-storage-unit.test.js tests/integration/s3-cache-performance.test.js tests/integration/s3-data-validation.test.js
```

## API Endpoints

- `GET /api/artists?artist=<name>` - Search artists
- `GET /api/cifraclub-search?artist=<name>&song=<title>` - Search songs
- `GET /api/artist-songs?artistPath=<path>` - Get artist songs
- `GET /api/chord-sheet?url=<encoded-url>` - Get chord sheet

## Environment

Copy `.env.example` to `.env` and configure:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE` - Supabase service role key
- `AWS_ACCESS_KEY_ID` - AWS access key (optional, for S3 caching)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (optional, for S3 caching)
- `S3_BUCKET_NAME` - S3 bucket name (default: chordium)

S3 caching is optional - app works without AWS credentials.
