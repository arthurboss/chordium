# Chordium

A modern, minimalist chord viewer app for beginner guitar players and hobbyists.

**Live:** https://chordium.vercel.app

## Architecture

Turborepo monorepo with npm workspaces:

```
chordium/
├── frontend/       # React 19 + TypeScript + Vite + Tailwind + shadcn/ui
├── backend/        # Node.js/Express + TypeScript + Puppeteer (chord scraping only)
├── packages/
│   ├── types/      # @chordium/types - shared TypeScript types (published to npm)
│   └── e2e-tests/  # Cypress end-to-end tests
├── docs/           # Project documentation
└── scripts/        # Build and utility scripts
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router 7, TanStack Query, PWA
- **API:** Vercel Serverless Functions in frontend/api/ — search (Neon + JSONP), chord sheets (@sparticuz/chromium)
- **Backend:** Express, TypeScript, Puppeteer + Cheerio (local dev / chord scraping)
- **Database:** Neon (Vercel Postgres)
- **Testing:** Vitest (frontend), Jest (backend), Cypress (e2e)
- **Build:** Turborepo, npm workspaces
- **Linting:** ESLint 9 (flat config)

## Common Commands

```bash
npm install          # Install all workspace dependencies
npm run dev          # Start all services (turbo)
npm run dev:fe       # Frontend only
npm run dev:be       # Backend only
npm run build        # Build all + prerender
npm run test         # Run all tests
npm run test:fe      # Frontend tests only
npm run test:be      # Backend tests only
npm run test:e2e     # Cypress e2e tests
npm run lint         # Lint all
npm run lint:fix     # Auto-fix lint issues
npm run clean        # Remove all node_modules and build artifacts
```

## Key Details

- Node.js >= 16 required
- ESM throughout (`"type": "module"`)
- Deploys entirely to Vercel (frontend + serverless API functions)
- Shared types package: `@chordium/types`
- Environment files: `frontend/env.example`, `backend/env.example`

## Git Workflow

- NEVER commit without explicit user approval
- NEVER push directly to main/master — always use a feature branch and let the user merge via PR
- No Co-Authored-By or Claude attribution in commits
