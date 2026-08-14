# Deployment Guide

Chordium deploys entirely on Vercel — frontend, serverless API functions, and database (Neon).

## Architecture

```
Frontend + API (Vercel)
├── React App (SPA)
├── /api/artists               — Artist search (DB + external source)
├── /api/cifraclub-search      — Song search (DB + external source)
├── /api/artist-songs          — Artist song list (DB → Puppeteer scrape → fallback)
└── /api/cifraclub-song        — Chord sheet + metadata (Puppeteer via @sparticuz/chromium)

Database (Neon)
├── artists
└── songs
```

## Deployment

Everything deploys automatically from GitHub via Vercel.

- `main` branch → Production (`chordium.vercel.app`)
- Other branches → Preview deployments

### Environment Variables (Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Override API base URL (defaults to relative `/api/`) |
| `POSTGRES_URL` | Yes | Injected automatically by Vercel Postgres (Neon) |
| `DATABASE_URL_UNPOOLED` | Yes (migrations) | Unpooled connection URL for schema migrations (Neon) |
| `NODE_ENV` | No | Set to `production` by Vercel automatically |

### Database Configuration

Chordium uses **Neon** (PostgreSQL) via **Vercel Postgres**:

- Vercel automatically injects `POSTGRES_URL` (pooled) and `DATABASE_URL_UNPOOLED` (for migrations)
- Connection pooling is handled by Neon's built-in connection pooler
- Schema migrations must use `DATABASE_URL_UNPOOLED` to avoid transaction conflicts with pooled connections
- For more details on connection strategies, see [Neon Connection Pooling Guide](https://neon.tech/docs/connect/connection-pooling)

### Vercel Project Settings

- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### vercel.json

The `frontend/vercel.json` configures:
- SPA routing (all paths → `index.html`)
- Memory (1024 MB) and timeout (60s) for Puppeteer functions
- API route exclusion from SPA rewrite

## Local Development

```bash
npm install
npm run dev:fe   # Frontend only
npm run dev:be   # Backend (Express) only — for chord sheet testing
```

## Monitoring

- **Status**: [UptimeRobot Status Page](https://stats.uptimerobot.com/sIX45GbfwC)
- **Vercel**: Check deployment logs in the Vercel dashboard

## Troubleshooting

- **Build failures**: Check Vercel build logs
- **API errors**: Check Vercel function logs
- **Chord page slow**: Expected — Puppeteer cold start takes 5–15s on first request
- **Search returns 0 results**: Check DB connection via Vercel Storage tab
