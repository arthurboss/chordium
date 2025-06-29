# Test Organization Guidelines

This document outlines the test organization following Single Responsibility Principle (SRP) and Don't Repeat Yourself (DRY) principles.

## Directory Structure

```
src/
  __tests__/
    shared/
      test-setup.ts          # Common test environment setup
      sample-data-loader.ts  # Sample data loading utilities
      
  cache/
    __tests__/
      core/                  # Core cache functionality tests
        cache-key-generation.test.ts
      implementations/       # Implementation-specific tests
        chord-sheet-cache.test.ts
        my-chord-sheets-cache.test.ts
      integration/           # Integration tests across cache components
        cache-integration.test.ts
        
  hooks/
    __tests__/
      useChordSheet/         # Tests specific to useChordSheet hook
        interface.test.ts    # Interface/return type tests
        loading.test.ts      # Loading behavior tests
        caching.test.ts      # Caching behavior tests
        
  utils/
    __tests__/
      storage/               # Storage-related utilities
        chordsheet-operations.test.ts
        song-compatibility.test.ts
        my-chord-sheets-cache.test.ts
      navigation/            # Navigation-related utilities
        song-navigation.test.ts
        enhanced-selection.test.ts
```

## Principles Applied

### Single Responsibility Principle (SRP)
- Each test file focuses on one specific aspect or component
- Test suites are organized by functionality, not by file structure
- Related tests are grouped in subfolders

### Don't Repeat Yourself (DRY)
- Shared test setup in `src/__tests__/shared/`
- Common test data and utilities
- Reusable mock configurations
- Consistent test environment across all test files

### Test File Naming
- `*.test.ts` for unit tests
- Descriptive names indicating what is being tested
- Grouped by functionality in subfolders

### Shared Setup Usage
All test files should use the shared setup:

```typescript
import { setupTestEnvironment, testChordSheet } from '@/__tests__/shared/test-setup';

// Use shared environment
setupTestEnvironment();

describe('Your Test Suite', () => {
  // Tests use consistent localStorage, fetch mocks, and sample data
});
```
