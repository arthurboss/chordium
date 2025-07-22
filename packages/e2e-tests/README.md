# @chordium/e2e-tests

End-to-end testing package for the Chordium application.

## Overview

This package contains all E2E tests for Chordium using Cypress. It's separated from the main application to:

- Keep production builds clean and fast
- Allow independent development of tests
- Isolate testing dependencies
- Enable specialized CI/CD workflows

## Scripts

```bash
# Run tests in headless mode
npm run test

# Open Cypress Test Runner
npm run test:open

# Run tests with browser visible
npm run test:headed

# Run tests against local development server
npm run test:dev

# Run tests for CI (with recording)
npm run test:ci
```

## Running Tests

### Prerequisites

1. Start the frontend development server:
```bash
# From root directory
npm run dev:fe
```

2. Install dependencies:
```bash
# From root directory
npm install
```

### Local Testing

```bash
# From root directory
npm run test:e2e:open    # Opens Cypress UI
npm run test:e2e         # Runs tests headlessly
npm run test:e2e:dev     # Runs against dev server
```

### CI Testing

Tests run automatically in GitHub Actions against deployed versions of the app.

## Structure

```
packages/e2e-tests/
├── cypress/
│   ├── e2e/           # Test files
│   ├── fixtures/      # Test data
│   ├── support/       # Helper functions
│   └── tsconfig.json  # Cypress TypeScript config
├── cypress.config.ts  # Cypress configuration
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## Configuration

- **Base URL**: Configured in `cypress.config.ts`
- **Test patterns**: `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`
- **Fixtures**: Uses API fixtures from `../../frontend/fixtures/api`
- **TypeScript**: Full TypeScript support enabled

## Best Practices

1. **Page Object Model**: Use page objects for complex interactions
2. **Data Attributes**: Use `data-testid` attributes for reliable selectors
3. **API Mocking**: Mock external APIs when possible
4. **Cleanup**: Ensure tests don't affect each other
5. **Screenshots**: Automatically captured on failures
