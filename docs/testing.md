# Testing Guide

## Running Tests

```sh
# Run all tests (frontend + backend)
npm run test

# Run only frontend tests
npm run test:fe

# Run only backend tests
npm run test:be

# Run e2e tests (from the repo root)
npm run test:e2e
```

## Testing Frameworks

- **Vitest** - Frontend unit testing
- **Jest** - Backend unit testing
- **Cypress** (in `packages/e2e-tests/`) - End-to-end testing

## Important Notes

- **e2e tests aren't run automatically in CI** - none of the active workflows in `.github/workflows/` invoke Cypress; run `npm run test:e2e` locally against a running dev server (see [`packages/e2e-tests/README.md`](../packages/e2e-tests/README.md)).
- **Real-network specs**: `enhanced-song-selection.cy.ts` and part of `browser-navigation.cy.ts` make real requests against CifraClub rather than mocking them - run those locally only, to avoid unnecessary scraping load. Prefer `cy.intercept()` (see `search/artist-section-navigation.cy.ts`) for anything new.
- Cache correctness is covered by unit tests against the real (fake-IndexedDB-backed) storage services, not a dedicated e2e suite - see [Cache E2E Testing](./cache-e2e-testing.md) for why, and where.

## Test Organization

For detailed information about test organization and structure, see:
- [Cache E2E Testing](./cache-e2e-testing.md)
- [Project Structure](./project-structure.md)
