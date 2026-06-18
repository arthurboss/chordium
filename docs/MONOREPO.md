# Chordium Monorepo Architecture

This document explains the monorepo structure, architecture decisions, and workspace management for Chordium.

## 🏗️ Architecture Overview

Chordium uses a **monorepo architecture** with npm workspaces to manage multiple related packages in a single repository. This approach provides several benefits:

- **Shared code:** Common types, utilities, and fixtures
- **Atomic changes:** Related changes across frontend/backend in single commits
- **Simplified tooling:** Single build system, testing, and deployment pipeline
- **Better coordination:** Easier to maintain consistency between packages

## 📁 Repository Structure

```
chordium/
├── frontend/                    # React + Vite frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Frontend utilities
│   │   ├── services/          # Frontend services
│   │   └── types/             # Frontend-specific types
│   ├── public/                # Static assets
│   └── cypress/               # E2E tests
├── backend/                    # Node.js + Express API server (local dev only)
│   ├── controllers/           # API route handlers
│   ├── services/              # Business logic services
│   ├── utils/                 # Backend utilities
│   ├── tests/                 # Backend tests
│   └── types/                 # Backend-specific types
├── packages/                   # Shared packages (npm workspaces)
│   └── types/                 # @chordium/types - Shared TypeScript types package
├── shared/                     # Shared resources
│   └── fixtures/              # Shared test fixtures
├── docs/                       # Project documentation
├── scripts/                    # Build and utility scripts
└── cypress/                    # End-to-end tests
```

## 🔧 Workspace Configuration

### Root package.json
```json
{
  "workspaces": [
    "frontend",
    "backend",
    "packages/types"
  ]
}
```

### Dependency Management

- **Root dependencies:** Shared dev tools (ESLint, Prettier, TypeScript)
- **Workspace dependencies:** Package-specific dependencies
- **Hoisting:** Compatible dependencies are hoisted to root `node_modules`

### Scripts Architecture

Root scripts orchestrate workspace commands:

```json
{
  "scripts": {
    "dev": "npm run dev:fe & npm run dev:be",
    "test": "npm run test:fe && npm run test:be",
    "build": "npm run build:fe && npm run build:be",
    "lint": "npm run lint:fe && npm run lint:be"
  }
}
```

## 🎯 Key Architectural Decisions

### 1. Shared Types Strategy

**Problem:** Frontend and backend need consistent type definitions
**Solution:** Dedicated `@chordium/types` npm package in `packages/types/`

```typescript
// packages/types/src/domain/chord-sheet.ts
export interface ChordSheet {
  title: string;
  artist: string;
  songChords: string;
  guitarTuning: GuitarTuning;
  guitarCapo: number;
}

// Usage in frontend/backend
import { ChordSheet, GUITAR_TUNINGS } from '@chordium/types';
```

**Benefits:**
- Type safety across the entire stack
- Single source of truth for data structures
- Proper npm package with versioning
- Built distribution with CommonJS/ESM support
- Automatic type checking in both environments

### 2. Shared Fixtures Strategy

**Problem:** Tests need consistent test data
**Solution:** Shared fixtures in `shared/fixtures/`

```
shared/fixtures/chord-sheet/
├── oasis-wonderwall.json
├── eagles-hotel_california.json
└── radiohead-creep.json
```

**Benefits:**
- Consistent test data across frontend/backend
- Single maintenance point for test fixtures
- Prevents test drift between environments

### 3. Build System Strategy

**Frontend:** Vite for fast development and optimized production builds
**Backend:** TypeScript compiler for type safety and modern JavaScript

### 4. Testing Strategy

- **Unit tests:** Jest for backend, Vitest for frontend
- **Integration tests:** Backend API tests
- **E2E tests:** Cypress for full user journey testing
- **Shared test utilities:** Common testing patterns and helpers

## 🔄 Development Workflow

### Local Development
```bash
# Start both services
npm run dev

# Start individual services
npm run dev:fe
npm run dev:be
```

### Testing
```bash
# Run all tests
npm run test

# Run with watch mode
npm run test:watch

# Run individual test suites
npm run test:fe
npm run test:be
```

### Code Quality
```bash
# Lint all code
npm run lint

# Auto-fix issues
npm run lint:fix

# Type checking
npm run lint:ts
```

## 🚀 Deployment Strategy

Everything deploys automatically to Vercel from `main`. There is no separate backend deployment.

### Production (Vercel)
- **Frontend:** React SPA built with Vite, served as static files
- **API:** Serverless functions in `frontend/api/` (artists, search, chord sheets)
- **Database:** Neon (via Vercel Postgres), connection injected automatically
- **Environment variables:** Configured in the Vercel dashboard

### Local Development
- **Frontend:** Vite dev server (`npm run dev:fe`)
- **Backend (Express):** `npm run dev:be` — mirrors the Vercel API functions locally, used for chord sheet and scraping work
- The Express backend in `backend/` is **not deployed**; it exists solely as a local dev convenience

### API Contracts
- Shared types (`@chordium/types`) ensure the frontend and API functions stay compatible
- Environment variables are consistent between local and production via `.env` / Vercel dashboard

## 🔧 Tooling Decisions

### Package Manager: npm
- **Workspaces:** Native npm workspace support
- **Hoisting:** Automatic dependency deduplication
- **Scripts:** Cross-workspace script orchestration

### TypeScript Configuration
- **Root config:** Shared TypeScript configuration
- **Workspace configs:** Package-specific overrides
- **Path mapping:** Consistent import paths across workspaces

### Linting and Formatting
- **ESLint:** Consistent code style and quality
- **Prettier:** Automatic code formatting
- **Shared configs:** Consistent rules across workspaces

## 📊 Benefits of This Architecture

### For Developers
- **Single repository:** Easier to understand the entire codebase
- **Atomic changes:** Related changes in single commits
- **Shared tooling:** Consistent development experience
- **Type safety:** End-to-end type safety

### For Maintenance
- **Reduced duplication:** Shared code and configurations
- **Easier refactoring:** Changes across packages in single PR
- **Consistent tooling:** Same linting, testing, build processes
- **Simplified CI/CD:** Single pipeline for all packages

### For Deployment
- **Coordinated releases:** Frontend and backend deployed together
- **Version alignment:** Guaranteed compatibility between packages
- **Simplified infrastructure:** Single repository to manage

## 🔮 Future Considerations

### Potential Improvements
- **Shared build system:** Unified build pipeline
- **Shared testing framework:** Common testing utilities
- **Micro-frontend architecture:** If frontend grows significantly
- **Service mesh:** If backend becomes more complex

### Scaling Considerations
- **Package boundaries:** Clear separation of concerns
- **Dependency management:** Careful hoisting decisions
- **Build optimization:** Incremental builds and caching
- **Team coordination:** Clear ownership and contribution guidelines

This monorepo architecture provides a solid foundation for Chordium's current needs while remaining flexible for future growth and changes. 