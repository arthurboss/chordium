# Backend Utils Test Suite

This document provides an overview of the comprehensive unit test suite for the backend utility functions.

## Test Structure

The tests are organized in the `backend/tests/utils/` directory, with each utility function having its own test file:

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
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Configuration

The test suite uses Jest with the following configuration:
- **Environment**: Node.js
- **Transform**: Babel for ES modules support
- **Pattern**: `**/tests/**/*.test.js`
- **Coverage**: Focuses on `utils/**/*.js` files

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
