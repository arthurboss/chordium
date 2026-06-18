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

- `GET /api/artists?artist=<name>` - Search for artists matching a name
- `GET /api/cifraclub-search?artist=<name>&song=<title>` - Search songs (artist and/or song parameters)
- `GET /api/artist-songs?artistPath=<path>` - Get all songs by a specific artist
- `GET /api/cifraclub-song?url=<artist/song>` - Get chord sheet + metadata in one request

## Environment

Copy `.env.example` to `.env` and configure:


