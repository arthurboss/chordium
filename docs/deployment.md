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
| `NODE_ENV` | No | Set to `production` by Vercel automatically |

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
