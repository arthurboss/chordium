# Test Attributes Best Practices

This document provides guidelines for implementing test attributes in the Chordium application in a way that ensures they're removed from production builds.

## Using Test Attributes

Prefer using the utility functions from `src/utils/test-utils.ts` instead of directly adding test attributes to your components.

### Available Utility Functions

```tsx
import { testAttr, cyAttr, e2eAttr, qaAttr } from "@/utils/test-utils";

// For Jest/React Testing Library
<button {...testAttr("submit-button")}>Submit</button>

// For Cypress
<input {...cyAttr("name-input")} />

// For E2E tests
<form {...e2eAttr("login-form")} />

// For QA testing
<div {...qaAttr("user-profile")} />
```

### Benefits

1. **Automatic Production Stripping**: Test attributes are automatically excluded from production builds.
2. **Consistent Naming Conventions**: Promotes uniform test attribute usage across the codebase.
3. **Type Safety**: TypeScript ensures correct attribute usage.
4. **Future-proofing**: If we need to change how test attributes are implemented, we can do it in one place.

## Implementation Details

### Build Configuration

Our Vite build configuration includes:

1. **Tree Shaking**: Unused code is eliminated in production builds.
2. **Test Attribute Stripping**: A custom Vite plugin removes any remaining test attributes.

### For Testing

The test utilities will return appropriate attributes during development and testing but will return empty objects in production, allowing the bundler to remove them entirely.

## Legacy Approach (Not Recommended)

If for some reason you need to use test attributes directly, they will still be removed in production:

```tsx
// Not recommended, but still works
<div data-testid="my-element">Content</div>
```

However, using the utilities is preferred as it provides additional type safety and future flexibility.

## Validating Test Attribute Removal

You can run the following command to verify that test attributes are being properly stripped from the production build:

```bash
npm run validate-optimizations
```

This will build both development and production versions and check that test attributes are properly removed.
