# Chordium Backend


## Architecture Notes

This backend uses relative imports for shared types (`../packages/types`) for deployment simplicity. See [Backend Import Strategy](../docs/technical-decisions/backend-import-strategy.md) for the technical decision rationale.

## Quick Start

```bash
npm install
npm run dev  # Start development server
npm test     # Run all tests
```

## 🚀 Deployment

The backend runs as Vercel serverless functions in `frontend/api/`.

- **Production**: Automatically deployed from GitHub
- **Environment**: Node.js with Puppeteer support
- **Database**: Neon (via Vercel Postgres)
- **Status Monitoring & Keep-Alive**: [Backend Status Page](https://stats.uptimerobot.com/sIX45GbfwC)

For deployment configuration, see:

- [Deployment Guide](../docs/deployment.md) - Complete deployment guide

## Tests

```bash
# All tests
npm test


```

## API Endpoints

- `GET /api/search?q=<query>` - Unified search: matches artists and songs (by title or lyrics) in one request, returning a single tagged list
- `GET /api/artist-songs?artistPath=<path>` - Get all songs by a specific artist
- `GET /api/cifraclub-song?url=<artist/song>` - Get chord sheet + metadata in one request (prefers the simplified arrangement)
- `GET /api/cifraclub-song-full?url=<artist/song>` - Get the full (tabbed) arrangement
- `GET /api/cifraclub-song-metadata?url=<artist/song>` - Metadata only (local dev backend only, no Vercel equivalent; not called by the frontend)
- `GET /api/cifraclub-chord-sheet?url=<artist/song>` - Chord sheet content only (local dev backend only, no Vercel equivalent; not called by the frontend)

See [Search & Artist-Songs Requests](../docs/dev-guides/search-types.md) for request/response shapes and caching.

## Environment

Copy `.env.example` to `.env` and configure:



