# Build Optimizations

This document describes the build optimizations implemented in the Chordium application.

## Tree Shaking

Tree shaking is the process of eliminating unused code from the final bundle. Our configuration takes advantage of Vite's built-in tree shaking capabilities with additional optimizations through Terser.

### Configuration Highlights

1. **Terser Minification**
   - Multiple passes for better optimization
   - Removal of unused code and dead code
   - Aggressive mangling of top-level variables
   - Dropping of `console` and `debugger` statements in production

2. **Rollup Options**
   - `moduleSideEffects: 'no-external'` assumes only external modules have side effects
   - `propertyReadSideEffects: false` assumes property reads don't cause side effects
   - `tryCatchDeoptimization: false` optimizes code inside try/catch blocks
   - `preset: 'recommended'` uses Rollup's recommended tree shaking settings

3. **Code Splitting**
   - Manual chunks for vendor code to improve caching
   - Compact output to eliminate empty chunks

## Test Attribute Removal

In production builds, test-related attributes are automatically removed to reduce bundle size and prevent exposing internal test selectors.

### Removed Attributes

The following test attributes are stripped from production builds:

- `data-testid`
- `data-test`
- `data-cy`
- `data-cypress`
- `data-qa`
- `data-e2e`

### Implementation

This is implemented in two complementary ways:

1. **Utility Functions**: We provide utility functions in `src/utils/test-utils.ts` that conditionally add test attributes only in development and test environments.

   ```tsx
   // Preferred approach - attributes never included in production builds
   import { testAttr } from "@/utils/test-utils";
   
   <button {...testAttr("submit-button")}>Submit</button>
   ```

2. **Vite Plugin**: A custom plugin processes all JSX, TSX, and HTML files to strip any remaining test attributes. This ensures that even manually added attributes are removed.

For more details on using test attributes, see [test-attributes.md](./test-attributes.md).

## Usage

- For development: `npm run dev` or `npm run build:dev`
- For production: `npm run build`
- To analyze bundle size: `npm run analyze-bundle`

All test attributes will be preserved in development mode for easier testing and debugging.
