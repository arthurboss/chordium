# Cache E2E Testing

## Current State

There is no dedicated cache e2e suite. Cache correctness is verified by unit tests instead (see below). The `.github/workflows/cache-e2e-tests.yml` and `e2e-tests.yml` workflows are archived (`.github/workflows/archived/`) and don't run in CI: see [Testing Guide](./testing.md).

## Where Cache Correctness Is Actually Verified

**Unit tests**, against the real IndexedDB-backed service, not a mock of it:

- [`search-cache-service.test.ts`](../frontend/src/storage/services/search-cache/search-cache-service.test.ts): the service layer `fetch-artist-songs.ts` and `useSearchFetch.ts` call directly. Covers TTL validation, custom TTL overrides, and the `validateTTL: false` bypass.
- [`stores/search-cache/operations/*.test.ts`](../frontend/src/storage/stores/search-cache/operations/): the underlying store operations (get, get-all, store, delete).

These run as part of `npm run test:fe` (Vitest), using [`fake-indexeddb`](https://github.com/dumbmatter/fakeIndexedDB): a real read/write path against a real (in-memory) IndexedDB, just not a browser's.

**E2E tests** focus on user-facing flows, not cache internals, and mock the network layer directly with `cy.intercept()` rather than reaching for a cache-specific fixture format: see [`search/artist-section-navigation.cy.ts`](../packages/e2e-tests/cypress/e2e/search/artist-section-navigation.cy.ts) for the current pattern. A cache *hit* is occasionally still worth asserting at this level (e.g. "does re-opening this artist skip the network call") via `cy.get('@alias.all').should('have.length', N)`, added to the relevant flow's spec rather than a separate `cache/` directory.

`packages/e2e-tests/cypress/support/e2e.ts` clears IndexedDB (`chordium-v1`) after every test: without it, a second test searching the same words is answered from a previous test's cache and never calls the API, leaving any `cy.wait()` on that request waiting for something that will not happen.

## If You're Adding Cache-Behavior Coverage

Prefer a unit test against the actual service (`search-cache-service.ts`, or the relevant `stores/*/operations` file) over a new Cypress spec: it exercises the real cache without needing to fake a network response shape, which drifts out of sync with the API the moment either changes independently.
