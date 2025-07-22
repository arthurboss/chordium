# Lazy Component Loading Tests

This file contains automated end-to-end tests to verify that the lazy loading implementation of various components works as expected.

## Test Coverage

- **Basic Page Loading**: Verifies main page components load without errors or React lazy loading exceptions
- **ChordContent Component**: Tests that chord content is rendered properly when viewing a song
- **ChordSheetControls**: Ensures auto-scroll controls and other features work correctly
- **Mobile vs Desktop Layout**: Tests that appropriate components load based on viewport size
- **Component Interaction**: Verifies that transitioning between lazy-loaded components preserves state

## Component Testing

The tests specifically verify these lazily-loaded components:

- `LazyChordContent`
- `LazyChordSheetControls`
- `LazyChordEdit`
- `LazyConfigMenu`
- `LazyMobileControlsBar`
- `LazyDesktopControls`

## How to Run

```bash
# Run just the lazy loading tests
npx cypress run --spec "cypress/e2e/lazy-loading.cy.ts"

# Run all tests including lazy loading tests
npx cypress run
```

## Implementation Notes

- All components are loaded using React's `lazy()` function in `lazyComponents.ts`
- The lazy loading implementation helps improve initial page load performance
- The tests verify that no errors occur during the loading process
