# Chordium Backend

Backend service for searching and retrieving chord sheets with optional S3 caching.

## Architecture Notes

This backend uses relative imports for shared types (`../packages/types`) for deployment simplicity. See [Backend Import Strategy](../docs/technical-decisions/backend-import-strategy.md) for the technical decision rationale.

## Quick Start

```bash
npm install
npm run dev  # Start development server
npm test     # Run all tests
```

## 🚀 Deployment

This backend is configured for deployment on [Render](https://render.com):

- **Production**: Automatically deployed from GitHub
- **Environment**: Node.js with Puppeteer support
- **Database**: Supabase integration
- **Caching**: AWS S3 for performance

For deployment configuration, see:

- [render.yaml](../render.yaml) - Render deployment config
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Complete deployment guide

## Tests

```bash
# All tests
npm test

# S3 caching tests
npm test -- tests/services/s3/ tests/integration/s3-cache-performance.test.js tests/integration/s3-data-validation.test.js

# Run specific S3 test categories
npm test -- tests/services/s3/configuration.test.js    # Configuration & environment
npm test -- tests/services/s3/error-handling.test.js   # Error scenarios
npm test -- tests/services/s3/data-processing.test.js  # Data processing
npm test -- tests/services/s3/connection.test.js       # Connection testing
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
