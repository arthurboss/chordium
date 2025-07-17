# Testing Guide

## Running Tests

```sh
# Run all tests (frontend + backend)
npm run test

# Run only frontend tests
npm run test:fe

# Run only backend tests
npm run test:be

# Run e2e tests
cd frontend && npm run test:e2e
```

## Testing Frameworks

- **Vitest** - Frontend unit testing
- **Jest** - Backend unit testing
- **Cypress** - End-to-end testing

## Important Notes

- **Song Search Tests**: The `cypress/e2e/search/song-search.cy.ts` tests are excluded from GitHub Actions because they use real web scraping from external sites. These should only be run locally to avoid unnecessary load on external services.
- **Cache Tests**: Cache-specific e2e tests are run separately in CI to isolate their concerns.
- **GitHub Actions**: Only non-scraping, non-cache tests run automatically on GitHub to keep CI fast and avoid external dependencies.

## Test Organization

For detailed information about test organization and structure, see:
- [Backend Tests README](../backend/tests/README.md)
- [Frontend Test Organization](./test-organization.md)
- [Cache E2E Testing](./cache-e2e-testing.md)
