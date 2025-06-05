# Cache Test Organization

This directory contains minimal, working tests for the caching system implementation.

## Structure

```
__tests__/
├── cache/
│   ├── minimal-cache.test.ts    # Minimal working tests (no memory leaks)
│   ├── safe-cache.test.ts       # Safe cache tests  
│   ├── test-utils.ts           # Shared test utilities and mocks
│   └── MEMORY_LEAK_RESOLUTION.md # Documentation of memory leak issues
└── README.md                   # This file
```

## Test Categories

### Working Tests
- **minimal-cache.test.ts**: Tests core cache key generation functionality (2 tests, 312ms runtime)
- **safe-cache.test.ts**: Additional safe cache tests without memory leak issues

### Utilities
- **test-utils.ts**: Shared mock data, utilities, and setup functions
- **MEMORY_LEAK_RESOLUTION.md**: Documents why complex tests were removed

## Running Tests

```bash
# Run minimal cache tests
npm run test:unit -- __tests__/cache

# Run specific test files
npm run test:unit -- __tests__/cache/minimal-cache.test.ts
npm run test:unit -- __tests__/cache/safe-cache.test.ts
```

## Full Cache Testing

For comprehensive cache testing, use the E2E tests which test the complete cache workflows without memory leak issues:

```bash
# Run E2E cache tests
npm run cypress:run -- --spec "cypress/e2e/cache-functionality-fixed.cy.ts"
```
