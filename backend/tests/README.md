# Backend Test Suite

This document provides an overview of the comprehensive test suite for backend components including utility functions and API controllers.

## Test Structure

### Controllers (`backend/tests/controllers/`)

Controller integration tests for API endpoints, migrated to TypeScript:

- `search.controller.artists.test.ts` - Tests for `/api/artists` endpoint (3 tests)
- `search.controller.cifraclub.test.ts` - Tests for `/api/cifraclub-search` endpoint (2 tests)
- `search.controller.artist-songs.test.ts` - Tests for `/api/artist-songs` endpoint (2 tests)

**Migration Notes**: The original `search.controller.integration.test.js` (225 lines) was split into 3 focused TypeScript files (~85 lines each) and archived to `tests/_archive/` for reference.

### Utilities (`backend/tests/utils/`)

Unit tests for utility functions:

- `logger.test.js` - Tests for the logging utility
- `normalize-for-search.test.js` - Tests for text normalization for search
- `normalize-path-for-comparison.test.js` - Tests for path normalization

## Utilities Overview and Usage

### 1. Logger (`utils/logger.js`)

**Purpose**: Provides structured logging with different levels (info, error, warn, debug).

**Currently used in**:
- `app.js` - Application startup logging
- `server.js` - Server startup logging
- `controllers/search.controller.js` - Request/response logging
- `services/cifraclub.service.js` - Service operation logging
- `services/puppeteer.service.js` - Browser automation logging
- `middlewares/error.middleware.js` - Error handling logging

**Key Features**:
- Environment-aware debug logging (only in development)
- Consistent log formatting with prefixes
- Support for multiple arguments including objects and errors

### 2. Normalize for Search (`utils/normalize-for-search.js`)

**Purpose**: Normalizes text for search operations by removing special characters and standardizing format.

**Currently used in**: ⚠️ **Not currently used in backend code** - Available for future search implementations.

**Key Features**:
- Converts to lowercase
- Removes special characters (keeps only letters, digits, and spaces)
- Normalizes whitespace
- Handles edge cases like null/undefined inputs

### 3. Normalize Path for Comparison (`utils/normalize-path-for-comparison.js`)

**Purpose**: Normalizes paths by removing hyphens to enable flexible path matching.

**Currently used in**: ⚠️ **Not currently used in backend code** - Available for future path comparison implementations.

**Key Features**:
- Converts to lowercase
- Removes hyphens entirely
- Preserves other characters and structure

## Test Coverage

All utilities have **100% code coverage** including:

- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

## Controller Tests (TypeScript)

The controller integration tests were migrated from JavaScript to TypeScript and split for better maintainability:

### Original File Migration
- **Original**: `search.controller.integration.test.js` (225 lines, 7 tests)
- **Archived to**: `tests/_archive/search.controller.integration.test.js`
- **Split into**: 3 focused TypeScript files (~85 lines each)

### Current TypeScript Tests

#### 1. Artists Endpoint (`search.controller.artists.test.ts`)
- **Endpoint**: `/api/artists`
- **Tests**: 3 integration tests
- **Features**: Supabase database queries, CifraClub fallback, error handling

#### 2. CifraClub Search (`search.controller.cifraclub.test.ts`)
- **Endpoint**: `/api/cifraclub-search`
- **Tests**: 2 integration tests  
- **Features**: Artist search with Supabase fallback, direct song search

#### 3. Artist Songs (`search.controller.artist-songs.test.ts`)
- **Endpoint**: `/api/artist-songs`
- **Tests**: 2 integration tests
- **Features**: S3 caching, CifraClub scraping, error handling

### TypeScript Migration Benefits
- **Type Safety**: Proper typing for Express request/response objects
- **Better IDE Support**: IntelliSense and error detection
- **Mock Type Safety**: Jest mocks with proper TypeScript support
- **Maintainability**: Smaller, focused test files easier to understand and modify

### Test Patterns Used
- **Jest Mock Casting**: `(mockFunction as jest.Mock).mockImplementation()`
- **ESLint Suppressions**: `@typescript-eslint/no-explicit-any` for test infrastructure
- **Module Mocking**: `jest.unstable_mockModule()` for ES module mocking
- **Async Testing**: Proper handling of Promise-based controller logic

## Test Categories

Each utility test file includes comprehensive test categories:

### 1. Basic Functionality Tests
- Core feature validation
- Expected input/output verification
- Standard use cases

### 2. Edge Cases
- Empty strings
- Null and undefined inputs
- Falsy values
- Boundary conditions

### 3. Punctuation-Heavy Text
- Special characters handling
- Musical notation symbols
- Complex punctuation combinations
- Quotes and apostrophes

### 4. Unicode Characters
- Accented characters
- Non-Latin scripts (Cyrillic, Japanese, Arabic)
- Emojis and symbols
- Currency and mathematical symbols

### 5. Real-World Scenarios
- Artist names with special characters
- File paths and URLs
- Song titles with metadata
- Version indicators

### 6. Performance Tests
- Large input handling
- Strings with many special characters
- Mixed long content processing

### 7. Consistency and Idempotency
- Multiple applications of the same function
- Equivalent input handling
- Result consistency verification

## Running Tests

```bash
# Run all tests (utilities + controllers)
npm test

# Run only controller integration tests
npm test -- tests/controllers/

# Run specific controller test files
npm test -- tests/controllers/search.controller.artists.test.ts
npm test -- tests/controllers/search.controller.cifraclub.test.ts  
npm test -- tests/controllers/search.controller.artist-songs.test.ts

# Run only utility tests
npm test -- tests/utils/

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Configuration

The test suite uses Jest with the following configuration:
- **Environment**: Node.js
- **Transform**: Babel for ES modules support
- **Pattern**: `**/tests/**/*.test.{js,ts}` (supports both JavaScript and TypeScript)
- **Coverage**: Focuses on `utils/**/*.js` and `controllers/**/*.ts` files
- **TypeScript**: ES module imports with `jest.unstable_mockModule()` for controller tests

## Key Testing Patterns

1. **Mocking Console Methods**: Logger tests mock console methods to verify output
2. **Environment Variable Testing**: Logger tests verify environment-dependent behavior
3. **Parameterized Testing**: Using arrays of test cases for comprehensive coverage
4. **Idempotency Verification**: Ensuring functions can be safely called multiple times
5. **Unicode Handling**: Extensive testing of international characters and symbols

## Recommendations

1. **Logger**: Continue using this well-tested utility for all logging needs
2. **Normalize Functions**: Consider integrating these utilities into search and path comparison features
3. **Test Maintenance**: Keep tests updated when modifying utility functions
4. **Coverage Monitoring**: Maintain 100% coverage when adding new utilities

## Future Enhancements

Consider adding tests for:
- Integration testing with actual backend services
- Performance benchmarking for large-scale operations
- Memory usage testing for long-running processes
- Error recovery and resilience testing
